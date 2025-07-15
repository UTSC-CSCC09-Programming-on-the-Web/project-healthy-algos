# Setup Instructions for AI-Enhanced Game

## Prerequisites
1. **Redis Server** - Required for the AI worker queue system
2. **OpenAI API Key** - For LLM-based AI decisions
3. **Node.js** - For running the backend and AI worker

## Step-by-Step Setup

### 1. Install Redis
**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**On macOS (with Homebrew):**
```bash
brew install redis
brew services start redis
```

**On Windows:**
- Download Redis from https://redis.io/download
- Or use Docker: `docker run -d -p 6379:6379 redis:alpine`

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**AI Worker:**
```bash
cd ai-worker
npm install
```

### 3. Configure Environment Variables

**Backend (.env file - create if needed):**
```bash
cd backend
echo "PORT=3000" > .env
echo "NODE_ENV=development" >> .env
```

**AI Worker (.env file - already exists, update it):**
```bash
cd ai-worker
# Edit the .env file and add your OpenAI API key:
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 4. Start the Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - AI Worker:**
```bash
cd ai-worker
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Test the Setup

1. Open your browser to `http://localhost:5173`
2. Navigate to the World/Game page
3. You should see the player and 4 AI agents
4. The AI agents should start making intelligent decisions every 5 seconds
5. Check the browser console and terminal outputs for AI activity logs

## Expected Behavior

- **AI Agents**: Will make decisions every 5 seconds using OpenAI's GPT model
- **Fallback Mode**: If AI service is unavailable, agents use simple random behavior
- **Real-time Updates**: AI decisions are sent via WebSocket for immediate response
- **Console Logs**: You'll see AI decision requests and responses in the browser console

## Troubleshooting

**Redis Connection Issues:**
- Verify Redis is running: `redis-cli ping` (should return "PONG")
- Check port 6379 is available: `netstat -an | grep 6379`

**OpenAI API Issues:**
- Verify your API key is valid and has credits
- Check the AI worker console for error messages

**WebSocket Connection Issues:**
- Ensure port 3001 is available for the AI worker WebSocket server
- Check browser console for connection errors

**AI Agents Not Moving Intelligently:**
- Check if AI service initialization succeeded in browser console
- Look for "✅ AI Service initialized successfully" message
- If you see "⚠️ AI Service initialization failed", agents will use fallback behavior

## Features Implemented

✅ **Modular Game Architecture** - Clean separation of systems and entities
✅ **Redis-based AI Worker** - Scalable queue system for AI decisions  
✅ **OpenAI Integration** - GPT-powered intelligent AI agent behavior
✅ **WebSocket Real-time Updates** - Immediate AI decision delivery
✅ **Fallback Behavior** - Graceful degradation when AI service unavailable
✅ **Multiple AI Agents** - 4 different AI characters with unique appearances
✅ **Intelligent Pathfinding** - AI agents move toward/away from player intelligently
✅ **Animation System** - Proper idle/walk animations with directional flipping

## Architecture Overview

```
Frontend (React + Kaplay) 
    ↓ HTTP requests
Backend (Express + BullMQ)
    ↓ Redis Queue
AI Worker (OpenAI + Socket.IO)
    ↓ WebSocket
Frontend (Real-time updates)
```

The system is now ready for advanced AI features and can easily scale to support more complex game mechanics!
