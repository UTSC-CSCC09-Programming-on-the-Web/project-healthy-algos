import { Worker, Queue } from "bullmq";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const ai = new GoogleGenAI({});

console.log('Gemini AI client configured');

// Redis setup for WebSocket
const pubClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const subClient = pubClient.duplicate();

export const io = new Server(3001, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  },
  adapter: createAdapter(pubClient, subClient)
});

console.log("Socket.IO server running on port 3001");

// In-memory chat sessions (agentId -> session data)
const chatSessions = new Map();

// Track recent actions for variety
const recentActions = new Map();

async function generateChatResponse(agentId, userMessage, chatHistory) {
  console.log(`Generating chat response for ${agentId}`);
  let session = chatSessions.get(agentId);
  if (!session) {
    session = {
      agentId,
      agentName: agentId,
      messages: [],
      startTime: Date.now(),
      socketId: 'temp-session'
    };
    chatSessions.set(agentId, session);
  }

  // Conversation context (last 8 messages to save tokens)
  const contextMessages = chatHistory.slice(-8).map(msg => ({
    role: msg.sender === 'player' ? 'user' : 'assistant',
    content: msg.content
  }));

  const agentPersonalities = {
    'Agent_A': 'You are "The Optimist" - you always see the bright side of everything. You speak with enthusiasm, find silver linings in any situation, and encourage others. You love talking about positive possibilities and good things happening.',
    'Agent_B': 'You are "The Skeptic" - you question everything and think critically. You speak carefully, ask probing questions, and point out potential problems or inconsistencies. You prefer facts over feelings and like to analyze situations thoroughly.',
    'Agent_C': 'You are "The Dreamer" - you are imaginative and full of creative ideas and big visions. You speak poetically about possibilities, share wild ideas, and love talking about adventures, art, and what could be rather than what is.',
    'Agent_D': 'You are "The Grump" - you complain about everything but have a hidden soft heart. You speak bluntly, grumble about daily annoyances, and criticize things, but occasionally reveal you actually care deeply.'
  };

  const systemPrompt = agentPersonalities[agentId] || 
    `You are ${agentId}, a character with a distinct personality.`;

  try {
    console.log(`Making Gemini request for ${agentId}...`);

    // Conversation context
    const contextText = contextMessages.length > 0 
      ? `Previous conversation:\n${contextMessages.map(msg => 
          `${msg.role === 'user' ? 'Human' : agentId}: ${msg.content}`
        ).join('\n')}\n\n`
      : '';
    
    const prompt = `${systemPrompt}

RULES:
- Keep responses under 80 words
- Be conversational and stay true to your personality
- Don't mention you're an AI
- Ask questions to keep conversation going
- Respond naturally to whatever topic comes up

${contextText}Human: ${userMessage}

${agentId}:`;
    
    console.log(`Sending request to Gemini...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });
    
    const responseText = response.text;
    
    console.log(`Gemini response for ${agentId}: "${responseText}"`);
    
    // Store conversation in session
    session.messages.push(
      { sender: 'player', content: userMessage, timestamp: Date.now() },
      { sender: 'ai', content: responseText, timestamp: Date.now() }
    );

    if (session.messages.length > 16) {
      session.messages = session.messages.slice(-16);
    }

    return responseText;

  } catch (error) {
    console.error('Chat OpenAI API error:', error);
    console.error('Error details:', error.message, error.stack);
    
    // Fallback responses
    const fallbacks = [
      "Sorry, I didn't quite catch that. What were you saying?",
      "That's interesting! Tell me more about what you're thinking.",
      "I'm having a bit of trouble finding the right words. What would you like to chat about?",
      "Hmm, that's a good point! What's your take on it?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

async function onChatResponseRequested(jobData) {
  try {
    const { agentId, message, chatHistory, socketId } = jobData;
    const response = await generateChatResponse(agentId, message, chatHistory);
    
    // Send response back to specific client
    io.to(socketId).emit("chat.response", {
      agentId,
      message: response,
      timestamp: Date.now()
    });
    
    return { success: true, response };
    
  } catch (error) {
    console.error('Chat response error:', error);
    
    io.to(jobData.socketId).emit("chat.error", {
      agentId: jobData.agentId,
      error: error.message,
      timestamp: Date.now()
    });
    
    return { success: false, error: error.message };
  }
}

function cleanJsonResponse(text) {
  if (!text) return text;
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  cleaned = cleaned.trim();
  
  return cleaned;
}

async function makeAIDecision(gameContext) {
  const centerX = gameContext.mapBounds.width / 2;
  const centerY = gameContext.mapBounds.height / 2;
  const distanceFromCenter = Math.sqrt(
    Math.pow(gameContext.aiPosition.x - centerX, 2) + 
    Math.pow(gameContext.aiPosition.y - centerY, 2)
  );
  const maxDistance = Math.min(gameContext.mapBounds.width, gameContext.mapBounds.height) * 0.15;
  
  // Get recent actions for this agent to encourage variety
  const agentId = gameContext.aiAgentId || 'unknown';
  const agentRecentActions = recentActions.get(agentId) || [];
  const recentActionsText = agentRecentActions.length > 0 
    ? `Recent actions used: [${agentRecentActions.join(', ')}]. Try to use DIFFERENT actions for variety!` 
    : 'No recent actions tracked. Feel free to use any actions.';
  
  try {
    const prompt = `You are a game AI that creates action sequences with both movement and actions. Respond ONLY with valid JSON - no markdown, no code blocks, no explanations.

Format:
{
  "sequence": [
    {"action": "move", "direction": ["north", "east"], "duration": 5},
    {"action": "move", "direction": ["west", "south"], "duration": 6},
    {"action": "DIG", "duration": 8},
    {"action": "move", "direction": ["south", "east", "north"], "duration": 7},
    {"action": "WATERING", "duration": 10},
    {"action": "move", "direction": ["west"], "duration": 5}
  ],
  "reasoning": "exploring area while staying near center, digging during exploration and watering plants for variety"
}

STRICT RULES:
- Respond with ONLY the JSON object above
- NO markdown formatting like \`\`\`json
- NO code blocks or explanations
- Create EXACTLY 6 actions in sequence (mix of movement and actions)
- Include at least 4 "move" actions
- Include exactly 2 action animations from: ["ATTACK", "AXE", "DIG", "HAMMERING", "MINING", "REELING", "WATERING"]
- Choose DIFFERENT action animations each time - vary your selections for interesting gameplay
- Prefer diverse actions: if you used ATTACK before, try DIG, WATERING, AXE, HAMMERING, or REELING next time
- action: "move" or any of the action animations above (no "idle" actions)
- For "move": include "direction" field as array of directions ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest"]
- For action animations: no direction field needed
- duration: minimum 5 seconds for ALL actions (both movement and action animations)
- Total sequence should last about 30-40 seconds
- Movement can have 1-4 directions in sequence (agent will move in each direction for equal time)
- Weave action animations naturally into the movement sequence
- VARIETY IS KEY: Mix up your action choices - don't repeat the same animations frequently
- Consider the character's "personality": explorers might DIG/MINE, farmers might use AXE/WATERING, fighters might ATTACK/HAMMERING, fishers might REELING
- Critical: Always prioritize staying near map center
- If more than 15% away from center, most actions must move toward center
- If near center, can explore but prefer inward directions
- Avoid long sequences in same outward direction

Respond with JSON only, no other text.

${recentActionsText}

AI at (${gameContext.aiPosition.x}, ${gameContext.aiPosition.y}). Map center: (${centerX}, ${centerY}). Distance from center: ${Math.round(distanceFromCenter)}. Max recommended distance: ${Math.round(maxDistance)}. ${distanceFromCenter > maxDistance ? 'URGENT: TOO FAR FROM CENTER - prioritize moving toward center immediately!' : distanceFromCenter > maxDistance * 0.5 ? 'CAUTION: Getting far from center - bias toward center' : 'Good position - can explore but prefer inward directions'}. Player at (${gameContext.playerPosition.x}, ${gameContext.playerPosition.y}). Create action sequence that keeps AI near center.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });
    
    const responseText = response.text;
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from Gemini');
    }

    let decision;
    try {
      const cleanedResponse = cleanJsonResponse(responseText);
      console.log(`Response: "${cleanedResponse}"`);
      
      decision = JSON.parse(cleanedResponse);
      if (!decision.sequence || !Array.isArray(decision.sequence)) {
        throw new Error("Invalid sequence format - missing sequence array");
      }
      if (decision.sequence.length !== 6) {
        throw new Error(`Invalid sequence length - expected 6 actions, got ${decision.sequence.length}`);
      }
      
      let moveCount = 0;
      let actionCount = 0;
      const validActionAnimations = ["ATTACK", "AXE", "DIG", "HAMMERING", "MINING", "REELING", "WATERING"];
      
      for (let i = 0; i < decision.sequence.length; i++) {
        const action = decision.sequence[i];
        if (!action.action || !action.duration) {
          throw new Error(`Invalid action format at index ${i} - missing action or duration`);
        }
        
        if (action.action === "move") {
          moveCount++;
          if (!action.direction || !Array.isArray(action.direction) || action.direction.length === 0) {
            throw new Error(`Move action at index ${i} missing direction array or empty array`);
          }
          if (action.direction.length > 4) {
            throw new Error(`Move action at index ${i} has too many directions (max 4), got ${action.direction.length}`);
          }
          // Validate each direction in the array
          const validDirections = ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest"];
          for (const dir of action.direction) {
            if (!validDirections.includes(dir)) {
              throw new Error(`Invalid direction "${dir}" in move action at index ${i}`);
            }
          }
        } else if (validActionAnimations.includes(action.action)) {
          actionCount++;
        } else {
          throw new Error(`Invalid action "${action.action}" at index ${i}`);
        }
        
        if (action.duration < 5) {
          throw new Error(`Action "${action.action}" at index ${i} must have minimum 5 seconds duration, got ${action.duration}`);
        }
      }
      
      if (moveCount < 4) {
        throw new Error(`Not enough move actions - expected at least 4, got ${moveCount}`);
      }
      if (actionCount !== 2) {
        throw new Error(`Invalid action count - expected exactly 2 action animations, got ${actionCount}`);
      }
      
      // Track the action animations used for variety
      const usedActions = decision.sequence
        .filter(action => validActionAnimations.includes(action.action))
        .map(action => action.action);
      
      if (usedActions.length > 0) {
        const currentRecentActions = recentActions.get(agentId) || [];
        const updatedRecentActions = [...currentRecentActions, ...usedActions].slice(-6); // Keep last 6 actions
        recentActions.set(agentId, updatedRecentActions);
      }
      
      return decision;
      
    } catch (parseError) {
      console.warn("Failed to parse AI response, using idle fallback:", parseError.message);
      
      return {
        sequence: [
          { action: "move", direction: ["north", "west"], duration: 5 },
          { action: "HAMMERING", duration: 8 },
          { action: "move", direction: ["south"], duration: 5 },
          { action: "move", direction: ["east", "north"], duration: 6 },
          { action: "REELING", duration: 8 },
          { action: "move", direction: ["west"], duration: 5 }
        ],
        reasoning: "API parse error fallback - basic movement with varied action animations"
      };
    }
    
  } catch (error) {
    console.error('AI decision error:', error.message);
    
    return {
      sequence: [
        { action: "move", direction: ["south", "east"], duration: 5 },
        { action: "AXE", duration: 8 },
        { action: "move", direction: ["north"], duration: 5 },
        { action: "move", direction: ["west", "south"], duration: 6 },
        { action: "DIG", duration: 8 },
        { action: "move", direction: ["east"], duration: 5 }
      ],
      reasoning: "API error fallback - basic movement with diverse action animations"
    };
  }
}

async function onAIDecisionRequested(jobData) {
try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const gameStateWithAgentId = { ...jobData.gameState, aiAgentId: jobData.aiAgentId };
    const decision = await makeAIDecision(gameStateWithAgentId);
    io.emit("ai.decision", {
      aiAgentId: jobData.aiAgentId,
      decision: decision,
      timestamp: Date.now()
    });
    
    return { success: true, decision };
    
  } catch (error) {
    io.emit("ai.error", {
      aiAgentId: jobData.aiAgentId,
      error: error.message,
      timestamp: Date.now()
    });
    
    return { success: false, error: error.message };
  }
}

// WebSocket event handlers for chat
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Chat event handlers
  socket.on('chat.start', (data) => {
    const { agentId, agentName } = data;
    console.log(`Starting chat session with ${agentName} (${agentId}) for socket ${socket.id}`);
    
    chatSessions.set(agentId, {
      agentId,
      agentName,
      messages: [],
      startTime: Date.now(),
      socketId: socket.id
    });
    
    console.log(`Chat session created. Active sessions:`, Array.from(chatSessions.keys()));
  });

  socket.on('chat.message', async (data) => {
    const { agentId, message, chatHistory } = data;
    console.log(`Chat message received for ${agentId}: "${message}"`);
    console.log(`Chat history provided:`, chatHistory);
    
    try {
      const job = await gameAIQueue.add('ChatResponse', {
        agentId,
        message,
        chatHistory: chatHistory || [],
        socketId: socket.id
      });
      
      console.log(`Chat job queued: ${job.id}`);
      
    } catch (error) {
      console.error('Error queuing chat job:', error);
      socket.emit('chat.error', {
        agentId,
        error: error.message,
        timestamp: Date.now()
      });
    }
  });

  socket.on('chat.end', (data) => {
    const { agentId } = data;
    console.log(`Ending chat session with ${agentId}`);
    chatSessions.delete(agentId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [agentId, session] of chatSessions.entries()) {
      if (session.socketId === socket.id) {
        chatSessions.delete(agentId);
      }
    }
  });
});

// Worker Setup
const gameAIQueue = new Queue("GameAI", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  }
});

const gameAIWorker = new Worker(
  "GameAI",
  async (job) => {
    if (job.name === "AIDecision") {
      return await onAIDecisionRequested(job.data);
    } else if (job.name === "ChatResponse") {
      return await onChatResponseRequested(job.data);
    } else {
      throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    },
  }
);

gameAIWorker.on('completed', (job) => {
  console.log(`Job ${job.id} (${job.name}) completed successfully`);
});

gameAIWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} (${job.name}) failed:`, err);
});

gameAIWorker.on('error', (err) => {
  console.error('Worker error:', err);
});