import { Worker } from "bullmq";
import OpenAI from "openai";
import "dotenv/config";
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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

async function makeAIDecision(gameContext) {
  console.log("🤖 Making AI decision for agent at:", gameContext.aiPosition);
  
  try {
    // Calculate center of map and distance from center
    const centerX = gameContext.mapBounds.width / 2;
    const centerY = gameContext.mapBounds.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(gameContext.aiPosition.x - centerX, 2) + 
      Math.pow(gameContext.aiPosition.y - centerY, 2)
    );
    const maxDistance = Math.min(gameContext.mapBounds.width, gameContext.mapBounds.height) * 0.2;
    
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a game AI that creates action sequences. Respond ONLY with valid JSON.

Format:
{
  "sequence": [
    {"action": "move", "direction": "north", "duration": 3},
    {"action": "move", "direction": "east", "duration": 2},
    {"action": "move", "direction": "south", "duration": 3},
    {"action": "move", "direction": "west", "duration": 2},
    {"action": "move", "direction": "northeast", "duration": 3},
    {"action": "move", "direction": "northwest", "duration": 2},
    {"action": "move", "direction": "southeast", "duration": 3},
    {"action": "idle", "duration": 2}
  ],
  "reasoning": "exploring area while staying near center"
}

STRICT RULES:
- Create EXACTLY 8 actions in sequence (no more, no less)
- At least 6 actions must be "move" actions
- At most 2 actions can be "idle" 
- action: "move" or "idle" 
- direction: "north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest" (only for move actions)
- duration: 2-4 seconds for each action (shorter durations for more direction changes)
- Total sequence should last about 25-30 seconds
- CRITICAL: Stay near map center, avoid edges
- If far from center, prioritize directions toward center
- Mix movement and occasional idle for natural behavior

Respond with JSON only, no other text.`
        },
        { 
          role: "user", 
          content: `AI at (${gameContext.aiPosition.x}, ${gameContext.aiPosition.y}). Map center: (${centerX}, ${centerY}). Distance from center: ${Math.round(distanceFromCenter)}. Max recommended distance: ${Math.round(maxDistance)}. ${distanceFromCenter > maxDistance ? 'TOO FAR FROM CENTER - prioritize moving toward center!' : 'Good position - can explore freely.'} Player at (${gameContext.playerPosition.x}, ${gameContext.playerPosition.y}). Create action sequence.` 
        },
      ],
      model: "meta-llama/llama-3.3-70b-instruct:free",
      temperature: 0.8,
      max_tokens: 300,
    });
    
    const response = chatCompletion.choices[0].message.content;
    console.log("🤖 AI Response:", response.substring(0, 200) + (response.length > 200 ? "..." : ""));
    
    if (!response || response.trim() === '') {
      throw new Error('Empty response from AI model');
    }

    let decision;
    try {
      decision = JSON.parse(response);
      if (!decision.sequence || !Array.isArray(decision.sequence)) {
        throw new Error("Invalid sequence format - missing sequence array");
      }
      if (decision.sequence.length !== 8) {
        throw new Error(`Invalid sequence length - expected 8 actions, got ${decision.sequence.length}`);
      }
      let moveCount = 0;
      let idleCount = 0;
      
      for (let i = 0; i < decision.sequence.length; i++) {
        const action = decision.sequence[i];
        if (!action.action || !action.duration) {
          throw new Error(`Invalid action format at index ${i} - missing action or duration`);
        }
        if (action.action === "move") {
          moveCount++;
          if (!action.direction) {
            throw new Error(`Move action at index ${i} missing direction`);
          }
        } else if (action.action === "idle") {
          idleCount++;
        }
      }
      
      if (moveCount < 6) {
        throw new Error(`Not enough move actions - expected at least 6, got ${moveCount}`);
      }
      if (idleCount > 2) {
        throw new Error(`Too many idle actions - expected at most 2, got ${idleCount}`);
      }
      return decision;
      
    } catch (parseError) {
      console.warn("Failed to parse AI response, using fallback:", parseError.message);
      const centerX = gameContext.mapBounds.width / 2;
      const centerY = gameContext.mapBounds.height / 2;
      const deltaX = centerX - gameContext.aiPosition.x;
      const deltaY = centerY - gameContext.aiPosition.y;
      
      let centerDirection = "north";
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        centerDirection = deltaX > 0 ? "east" : "west";
      } else if (Math.abs(deltaY) > 50) {
        centerDirection = deltaY > 0 ? "south" : "north";
      }

      return {
        sequence: [
          { action: "move", direction: centerDirection, duration: 3 },
          { action: "move", direction: "north", duration: 3 },
          { action: "move", direction: "east", duration: 3 },
          { action: "move", direction: "south", duration: 3 },
          { action: "move", direction: "west", duration: 3 },
          { action: "move", direction: "northeast", duration: 4 },
          { action: "idle", duration: 2 },
          { action: "move", direction: "northwest", duration: 3 }
        ],
        reasoning: "fallback sequence toward center with exactly 8 actions and shorter durations"
      };
    }
    
  } catch (error) {
    const centerX = gameContext.mapBounds.width / 2;
    const centerY = gameContext.mapBounds.height / 2;
    
    return {
      sequence: [
        { action: "move", direction: "north", duration: 3 },
        { action: "move", direction: "east", duration: 3 },
        { action: "move", direction: "south", duration: 3 },
        { action: "move", direction: "west", duration: 3 },
        { action: "move", direction: "northeast", duration: 3 },
        { action: "move", direction: "northwest", duration: 3 },
        { action: "idle", duration: 2 },
        { action: "move", direction: "southeast", duration: 4 }
      ],
      reasoning: "Error fallback - exactly 8 actions exploration sequence with shorter durations"
    };
  }
}

async function onAIDecisionRequested(jobData) {
  console.log(`Processing AI decision for agent ${jobData.aiAgentId}`);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const decision = await makeAIDecision(jobData.gameState);
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

// Worker Setup
const gameAIWorker = new Worker(
  "GameAI",
  async (job) => {
    console.log(`Processing job: ${job.name} with ID: ${job.id}`);
    
    if (job.name === "AIDecision") {
      return await onAIDecisionRequested(job.data);
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
  console.log(`Job ${job.id} completed successfully`);
});

gameAIWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

gameAIWorker.on('error', (err) => {
  console.error('Worker error:', err);
});