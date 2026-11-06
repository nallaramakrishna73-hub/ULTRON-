#!/usr/bin/env bash
# ==============================================================================
# ULTRON - Local AI Operating System for Kali Linux (XFCE)
# Autonomous Neural Operating Environment Setup & Launch Script
# ==============================================================================

set -e

CYAN='\033[0;36m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "=============================================================="
echo "          ULTRON – LOCAL AI OPERATING SYSTEM                   "
echo "        Think  •  Analyze  •  Execute  •  Kali Linux          "
echo "=============================================================="
echo -e "${NC}"

# 1. Verify Architecture & Host OS
echo -e "${CYAN}[1/5] Checking Kali Linux Environment...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo -e "      OS: ${GREEN}${PRETTY_NAME}${NC}"
else
    echo -e "      OS: Linux (generic)"
fi

# 2. Check and Start Ollama Daemon
echo -e "${CYAN}[2/5] Initializing Local AI Inference (Ollama)...${NC}"
if command -v ollama >/dev/null 2>&1; then
    echo -e "      ${GREEN}✓ Ollama binary found.${NC}"
    if ! pgrep -x "ollama" >/dev/null; then
        echo -e "      Starting Ollama daemon in background..."
        ollama serve >/dev/null 2>&1 &
        sleep 2
    fi
    echo -e "      Checking default model (qwen2.5-coder:7b)..."
    if ! ollama list | grep -q "qwen2.5-coder"; then
        echo -e "      ${YELLOW}Notice: Default model qwen2.5-coder:7b not pulled yet.${NC}"
        echo -e "      To install, run: ${CYAN}ollama pull qwen2.5-coder:7b${NC}"
    else
        echo -e "      ${GREEN}✓ qwen2.5-coder:7b model ready.${NC}"
    fi
else
    echo -e "      ${YELLOW}⚠ Ollama is not installed.${NC}"
    echo -e "      Install via: curl -fsSL https://ollama.com/install.sh | sh"
fi

# 3. Create persistent data directory
echo -e "${CYAN}[3/5] Verifying SQLite Database and Directories...${NC}"
mkdir -p data
echo -e "      ${GREEN}✓ Database directory verified at ./data/ultron.db${NC}"

# 4. Install Node / Python dependencies if required
echo -e "${CYAN}[4/5] Checking Dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "      Running npm install..."
    npm install
else
    echo -e "      ${GREEN}✓ Node dependencies present.${NC}"
fi

# 5. Launch ULTRON
echo -e "${CYAN}[5/5] Launching ULTRON AI Operating Environment...${NC}"
echo -e "      Port: ${GREEN}http://localhost:3000${NC}"
echo -e "${PURPLE}==============================================================${NC}"

npm run dev
