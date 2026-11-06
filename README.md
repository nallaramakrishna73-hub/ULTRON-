# ULTRON – Voice-First Local AI Operating Assistant

> **Think • Analyze • Execute**  
> An advanced, voice-first, locally powered personal AI operating assistant for Windows and Linux.

---

## 1. System Vision & Architecture

ULTRON has been transformed from a traditional dashboard into a **cinematic, full-screen AI environment** floating in deep space, featuring:

1. **Clean, Uncluttered Interface**:
   - No sidebars or dashboard cards.
   - Minimal glowing ULTRON identity at the top.
   - Cinematic space environment with real-time 3D starfield, cosmic dust clouds, and light waves.
   - Central conversational AI stream with real tool execution cards.
   - Floating bottom glass bar with responsive voice controls.

2. **Advanced Continuous Voice Assistant**:
   - Continuous voice listening with Voice Activity Detection (VAD).
   - **5-Second Silence Detection**: Listens to speech, counts down 5 seconds of silence when speaking pauses, and automatically submits the completed message.
   - Real-time animated voice visualizer reacting to sound waves and AI thinking/speaking states.
   - Neural TTS output with ElevenLabs and browser speech synthesis fallback.

3. **Real Computer Control (Universal System Agent)**:
   - Real OS operations across **Windows** and **Linux**:
     - **Open Terminal**: Windows Terminal (`wt.exe`), PowerShell, or Linux Terminal.
     - **Launch Applications**: VS Code (`code`), Chrome, Firefox, Calculator, Wireshark, etc.
     - **File Management**: Open File Explorer, Downloads, Projects, create folders, search files, read file contents.
     - **System Information**: Real CPU, RAM, Disk, OS version, and uptime telemetry.
     - **Approved Commands**: Executes development commands (`git`, `python`, `nmap`, etc.) with security allowlisting, regex safety intercept, and confirmation cards for actions requiring approval.

4. **Local Ollama AI Integration**:
   - Connects directly to local Ollama at `http://127.0.0.1:11434` (configurable in settings).
   - Dynamic model detection (`/api/tags`) and switching without restart (`qwen2.5-coder:7b`, `llama3.2`, etc.).
   - Tool intent mapping that automatically matches user requests to registered computer control tools.

---

## 2. Quick Start

### Running on Windows
1. Open PowerShell or Windows Terminal in the project directory:
   ```powershell
   npm install
   npm run dev
   ```
2. Navigate to `http://localhost:3000`.

### Running on Linux (Kali / Ubuntu)
```bash
chmod +x ultron-start.sh
./ultron-start.sh
```
Or manually:
```bash
npm install
npm run dev
```

---

## 3. Configuring Local Ollama
1. Install and start Ollama on your machine:
   - **Windows**: Download the installer from [ollama.com/download/windows](https://ollama.com/download/windows).
   - **Linux**: Run `curl -fsSL https://ollama.com/install.sh | sh`.
2. Start the Ollama server:
   ```bash
   ollama serve
   ```
3. Pull your preferred model (e.g. Qwen or LLaMA):
   ```bash
   ollama pull qwen2.5-coder:7b
   ```
4. In ULTRON, click the **Settings** gear icon (or the Ollama status badge) in the top bar to verify the connection or switch models.

---

## 4. Voice Commands Examples
Speak naturally to ULTRON:
- *"ULTRON, open terminal."*
- *"ULTRON, open VS Code."*
- *"ULTRON, open Chrome."*
- *"ULTRON, open my Downloads folder."*
- *"ULTRON, open my project folder."*
- *"ULTRON, create a new folder named test_lab."*
- *"ULTRON, check my system info."*
- *"ULTRON, search for files named package."*
- *"ULTRON, run git status."*
- *"ULTRON, execute python script."*

---

## 5. Security & Safety Guard
All computer operations run through the ULTRON System Agent with strict security policies:
- Destructive commands (`rm -rf /`, formatting, raw disk writes) are intercepted and rejected.
- Administrative or sensitive commands present an interactive confirmation card before execution.
- All actions are logged to SQLite (`data/ultron.db`) for complete auditability.
