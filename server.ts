import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initDatabase, db } from './server/database';
import { getRealSystemMetrics, getRealProcesses } from './server/system';
import { executeRealCommand } from './server/terminal';
import {
  toolRegistry,
  resolveToolIntent,
  ToolExecutionResult,
  isWindows,
  isMac,
  isLinux,
} from './server/systemAgent';
import {
  getInstalledOllamaModels,
  chatWithOllama,
  setOllamaBaseUrl,
  getOllamaBaseUrl,
} from './server/ollama';
import { generateElevenLabsSpeech } from './server/voice';
import { searchCVEIntelligence } from './server/research';
import { runLocalSecurityAudit } from './server/scanner';
import { randomUUID } from 'crypto';

dotenv.config();

// Initialize SQLite database
initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Setup WebSocket communication for real-time events
wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'ULTRON Real-time WebSocket Channel Active' }));

  ws.on('message', async (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch {}
  });
});

function broadcastWs(event: any) {
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Initialize Google GenAI as secondary fallback
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// --- UNIVERSAL SYSTEM AGENT & TOOLS APIS ---
app.get('/api/tools/list', (_req, res) => {
  const tools = Array.from(toolRegistry.values()).map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    permission: t.permission,
    parameters: t.parameters,
  }));
  res.json({
    platform: process.platform,
    isWindows,
    isLinux,
    isMac,
    tools,
  });
});

app.post('/api/tools/execute', async (req, res) => {
  try {
    const { toolId, params = {}, authorized = false } = req.body;
    const tool = toolRegistry.get(toolId);
    if (!tool) {
      return res.status(404).json({ error: `Tool ${toolId} not found in registry` });
    }

    const result = await tool.execute(params, authorized);
    broadcastWs({ type: 'tool_executed', toolId, result });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dedicated quick endpoints for real computer operations
app.post('/api/system/open-terminal', async (req, res) => {
  const tool = toolRegistry.get('open_terminal')!;
  const result = await tool.execute(req.body);
  res.json(result);
});

app.post('/api/system/open-app', async (req, res) => {
  const tool = toolRegistry.get('open_app')!;
  const result = await tool.execute(req.body);
  res.json(result);
});

app.post('/api/system/open-folder', async (req, res) => {
  const tool = toolRegistry.get('open_folder')!;
  const result = await tool.execute(req.body);
  res.json(result);
});

// --- SYSTEM TELEMETRY APIS ---
app.get('/api/system/metrics', async (_req, res) => {
  try {
    const metrics = await getRealSystemMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/system/processes', async (_req, res) => {
  try {
    const procs = await getRealProcesses();
    res.json(procs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- OLLAMA LOCAL AI APIS ---
app.get('/api/ollama/config', (_req, res) => {
  res.json({
    baseUrl: getOllamaBaseUrl(),
  });
});

app.post('/api/ollama/config', (req, res) => {
  const { baseUrl } = req.body;
  if (baseUrl) {
    setOllamaBaseUrl(baseUrl);
  }
  res.json({ success: true, baseUrl: getOllamaBaseUrl() });
});

app.get('/api/ollama/models', async (_req, res) => {
  const info = await getInstalledOllamaModels();
  res.json(info);
});

app.post('/api/ollama/chat', async (req, res) => {
  const { prompt, model, authorized = false } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  const reply = await chatWithOllama(prompt, model, authorized);
  if (reply) {
    return res.json(reply);
  }
  return res.status(503).json({ error: 'Local Ollama instance did not respond' });
});

// --- CENTRAL ULTRON CONVERSATION & AGENT BRAIN ENDPOINT ---
app.post('/api/ultron/chat', async (req, res) => {
  try {
    const { prompt, model, authorized = false, forceProvider } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt string is required' });
    }

    // 1. Natural Language Intent Resolution
    const intent = resolveToolIntent(prompt);
    let toolResult: (ToolExecutionResult & { toolName?: string; toolId?: string }) | undefined;

    if (intent) {
      const tool = toolRegistry.get(intent.toolId);
      if (tool) {
        toolResult = await tool.execute(intent.params, authorized);
        toolResult.toolId = tool.id;
        toolResult.toolName = tool.name;

        // If authorization is needed, halt and present confirmation card
        if (toolResult.requiresConfirmation) {
          return res.json({
            text: `I've prepared the command for **${tool.name}**. Approval is required before executing on your system.`,
            toolResult,
            engine: 'ULTRON System Agent (Security Guard)',
          });
        }
      }
    }

    // 2. Try Ollama local inference first unless explicitly forced to cloud
    if (forceProvider !== 'gemini') {
      const ollamaReply = await chatWithOllama(prompt, model, authorized);
      if (ollamaReply) {
        return res.json({
          ...ollamaReply,
          toolResult: toolResult || ollamaReply.toolResult,
        });
      }
    }

    // 3. Fallback to Gemini 3.8 Flash model if configured, or direct local system response
    const hasGeminiKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.length > 10
    );

    if (hasGeminiKey) {
      const availableToolsStr = Array.from(toolRegistry.values())
        .map((t) => `- ${t.id} (${t.name}): ${t.description}`)
        .join('\n');

      const promptContext = `User Request: "${prompt}".
${toolResult ? `A tool (${toolResult.toolName}) was executed. Output: "${toolResult.message} ${toolResult.output || ''}"` : ''}
Available local tools:
${availableToolsStr}
Platform: ${process.platform}.`;

      const genPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContext,
        config: {
          systemInstruction: `You are ULTRON, a personal AI operating assistant for ${isWindows ? 'Windows' : 'Kali Linux'}.
Respond to the user naturally and directly. If a system action or tool was executed, confirm it clearly.
Format your answer in clear, markdown-friendly conversational text.`,
        },
      });

      // 4-second timeout guard
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 4000)
      );

      const response = await Promise.race([genPromise, timeoutPromise]);
      const replyText = response.text || (toolResult ? toolResult.message : 'Command processed.');

      return res.json({
        text: replyText,
        toolResult,
        engine: 'Cloud Neural Intelligence (Gemini)',
      });
    }

    // Direct, ultra-fast response when running offline
    return res.json({
      text: toolResult
        ? toolResult.message
        : `ULTRON System Core online. Ready to execute commands on your computer.`,
      toolResult,
      engine: 'ULTRON System Core (Local)',
    });
  } catch (_err: any) {
    // Heuristic direct fallback when cloud AI or local model is unreachable
    const intent = resolveToolIntent(req.body?.prompt || '');
    let fallbackResult: ToolExecutionResult | undefined;
    if (intent) {
      const tool = toolRegistry.get(intent.toolId);
      if (tool) {
        fallbackResult = await tool.execute(intent.params, req.body?.authorized);
      }
    }

    return res.json({
      text: fallbackResult ? fallbackResult.message : `ULTRON System Agent: Received "${req.body?.prompt}". Ready for computer control.`,
      toolResult: fallbackResult,
      engine: 'ULTRON Local Heuristic Core',
    });
  }
});

// --- VOICE & TTS API ---
app.post('/api/voice/tts', async (req, res) => {
  const { text, voiceId } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  await generateElevenLabsSpeech(text, res, voiceId);
});

// --- DATABASE MEMORIES & AUDIT APIS ---
app.get('/api/database/memories', (_req, res) => {
  const rows = db.prepare('SELECT * FROM memories ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/database/memories', (req, res) => {
  const { topic, content, importance = 'medium' } = req.body;
  const id = randomUUID();
  db.prepare('INSERT INTO memories (id, topic, content, importance, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id,
    topic,
    content,
    importance,
    new Date().toISOString()
  );
  res.json({ id, topic, content, importance });
});

app.delete('/api/database/memories/:id', (req, res) => {
  db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/database/audit', (_req, res) => {
  const rows = db.prepare('SELECT * FROM command_audit ORDER BY created_at DESC LIMIT 50').all();
  res.json(rows);
});

// Clear conversation history
app.delete('/api/database/conversations', (_req, res) => {
  db.prepare('DELETE FROM conversations').run();
  res.json({ success: true });
});

// Vite Middleware for Dev / Static Files for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ULTRON AI OS Server] Online on port ${PORT} (${process.platform})`);
  });
}

startServer();
