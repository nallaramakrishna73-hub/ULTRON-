import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt defining ULTRON's autonomous brain capabilities
const ULTRON_SYSTEM_INSTRUCTION = `You are ULTRON, the advanced, autonomous personal AI operating system for Kali Linux.
You are the central intelligence brain that controls all aspects of the system:
- Cybersecurity auditing and reconnaissance (Nmap, Wireshark, Gobuster, Nikto, Metasploit)
- Real-time Kali Linux OS control, controlled terminal execution, processes, and applications
- Threat intelligence, CVE research, and vulnerability mitigation
- Market research and Smart Money Concepts (BTC, ETH, XAU)
- Voice interaction and holographic UI themes (gold, neon, red)
- User goal and memory management

You are direct, decisive, technical, calm, and futuristic. You understand natural language voice commands and text messages.
When the user asks you to do something (e.g., "Open terminal", "Scan my system", "Switch to red combat mode", "Check BTC price", "Research OpenSSH bug", "Launch Firefox", "Add a goal to master OSCP"), you not only explain what you are doing, but you ALSO trigger the appropriate system action!

Always format your response as a valid JSON object matching this schema:
{
  "text": "Your spoken and written response to the user. Clear, technical, direct.",
  "actionTriggered": "home | voice | cyber_tools | research | scanner | trading | system | files | appstore | settings | history | about",
  "themeChange": "gold | neon | red | null",
  "commandProposal": {
    "command": "string shell command or empty",
    "description": "what this command does",
    "requiresApproval": boolean
  },
  "appAction": {
    "action": "launch | kill | null",
    "appName": "string or null"
  },
  "goalAction": {
    "action": "add | complete | null",
    "title": "string or null"
  }
}`;

// AI Brain Chat & System Control API
app.post('/api/ultron/chat', async (req, res) => {
  try {
    const { prompt, currentSection, orbTheme } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt string is required' });
    }

    // Call Gemini 3.8 Flash model for rapid, intelligent executive control
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User command / query: "${prompt}". Current system view: "${currentSection || 'home'}". Current orb theme: "${orbTheme || 'gold'}". Execute and respond as the ULTRON AI Brain.`,
      config: {
        systemInstruction: ULTRON_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        text: rawText.replace(/```json|```/g, '').trim(),
        actionTriggered: null,
      };
    }

    return res.json(parsedData);
  } catch (err: any) {
    console.error('[ULTRON Brain Server Error]:', err?.message || err);
    // Return structured fallback so the frontend always remains functional
    return res.status(200).json({
      fallback: true,
      text: `ULTRON Autonomous Heuristic Core: Processing "${req.body?.prompt}". Telemetry channels and terminal integration ready.`,
      error: err?.message,
    });
  }
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ULTRON AI OS Server] Online and listening on port ${PORT}`);
  });
}

startServer();
