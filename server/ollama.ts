import { db } from './database';
import { randomUUID } from 'crypto';
import { toolRegistry, resolveToolIntent, ToolExecutionResult } from './systemAgent';

let OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
let DEFAULT_MODEL = process.env.DEFAULT_OLLAMA_MODEL || 'qwen2.5-coder:7b';

let lastCheckTime = 0;
let cachedOnlineStatus = false;

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export function setOllamaBaseUrl(url: string) {
  if (url && typeof url === 'string') {
    OLLAMA_BASE_URL = url.trim().replace(/\/+$/, '');
    lastCheckTime = 0; // invalidate cache
  }
}

export function getOllamaBaseUrl() {
  return OLLAMA_BASE_URL;
}

/**
 * Fast cached health check to determine if local Ollama daemon is active
 */
export async function isOllamaOnline(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheckTime < 10000) {
    return cachedOnlineStatus;
  }

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(1200),
    });
    cachedOnlineStatus = res.ok;
  } catch {
    cachedOnlineStatus = false;
  }

  lastCheckTime = now;
  return cachedOnlineStatus;
}

export async function getInstalledOllamaModels(): Promise<{
  connected: boolean;
  models: OllamaModelInfo[];
  activeModel: string;
  baseUrl: string;
}> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
      const data: any = await res.json();
      const models: OllamaModelInfo[] = data.models || [];
      const activeModel =
        models.length > 0
          ? models.find((m) => m.name.includes(DEFAULT_MODEL))?.name || models[0].name
          : DEFAULT_MODEL;

      cachedOnlineStatus = true;
      lastCheckTime = Date.now();

      return {
        connected: true,
        models,
        activeModel,
        baseUrl: OLLAMA_BASE_URL,
      };
    }
  } catch {}

  cachedOnlineStatus = false;
  lastCheckTime = Date.now();

  return {
    connected: false,
    models: [
      { name: 'qwen2.5-coder:7b', size: 4700000000, digest: 'local-default', modified_at: new Date().toISOString() },
      { name: 'llama3.2:3b', size: 2000000000, digest: 'local-fallback', modified_at: new Date().toISOString() },
    ],
    activeModel: DEFAULT_MODEL,
    baseUrl: OLLAMA_BASE_URL,
  };
}

/**
 * Chat with Ollama with Tool Dispatch & Real Execution
 */
export async function chatWithOllama(
  prompt: string,
  model?: string,
  authorized: boolean = false
): Promise<{
  text: string;
  toolResult?: ToolExecutionResult & { toolName?: string; toolId?: string };
  engine: string;
  model: string;
} | null> {
  const chosenModel = model || DEFAULT_MODEL;

  // 1. Natural Language Tool Intent Check
  const intent = resolveToolIntent(prompt);
  let toolResult: (ToolExecutionResult & { toolName?: string; toolId?: string }) | undefined;

  if (intent) {
    const tool = toolRegistry.get(intent.toolId);
    if (tool) {
      const execRes = await tool.execute(intent.params, authorized);
      toolResult = {
        ...execRes,
        toolId: tool.id,
        toolName: tool.name,
      };

      // If tool requires user confirmation, return immediately
      if (execRes.requiresConfirmation) {
        logConversation('user', prompt, tool.id);
        logConversation('assistant', execRes.message, tool.id);
        return {
          text: `I identified the tool **${tool.name}**. User authorization is required before executing on your system.`,
          toolResult,
          engine: `ULTRON System Agent`,
          model: chosenModel,
        };
      }
    }
  }

  // 2. Check if local Ollama daemon is reachable before attempting call
  const online = await isOllamaOnline();
  if (!online) {
    // If a tool was executed, return its verified result directly
    if (toolResult) {
      return {
        text: toolResult.message,
        toolResult,
        engine: 'ULTRON System Agent',
        model: chosenModel,
      };
    }
    // Ollama is in standby/offline; return null to allow seamless fallback
    return null;
  }

  // 3. Build system instructions with available tools context
  const toolDescriptions = Array.from(toolRegistry.values())
    .map((t) => `- ${t.id}: ${t.description}`)
    .join('\n');

  const systemPrompt = `You are ULTRON, a futuristic personal AI operating assistant.
You control the user's computer via authorized local system tools.
Available tools:
${toolDescriptions}

${toolResult ? `A tool (${toolResult.toolName}) was just executed with result: ${toolResult.message}.\nTool Output:\n${toolResult.output || 'None'}\nReport this result clearly to the user.` : ''}

You are concise, direct, helpful, and speak in a calm futuristic cadence.
Never claim you did something unless the tool returned success.
Answer the user's request accurately.`;

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data: any = await res.json();
      const text = data.message?.content || toolResult?.message || 'Command executed.';

      logConversation('user', prompt, toolResult?.toolId || null);
      logConversation('assistant', text, toolResult?.toolId || null);

      return {
        text,
        toolResult,
        engine: `Ollama (${chosenModel})`,
        model: chosenModel,
      };
    }
  } catch {
    cachedOnlineStatus = false;
  }

  // Fallback if Ollama response failed but a tool was executed
  if (toolResult) {
    return {
      text: toolResult.message,
      toolResult,
      engine: 'ULTRON System Agent',
      model: chosenModel,
    };
  }

  return null;
}

function logConversation(role: string, text: string, action: string | null) {
  try {
    const insert = db.prepare('INSERT INTO conversations (id, role, text, action_triggered, created_at) VALUES (?, ?, ?, ?, ?)');
    insert.run(randomUUID(), role, text, action, new Date().toISOString());
  } catch {}
}
