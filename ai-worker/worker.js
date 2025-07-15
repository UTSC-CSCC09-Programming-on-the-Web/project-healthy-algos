import { Worker } from "bullmq";
import OpenAI from "openai";
import "dotenv/config";
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  console.log("Making AI decision for context:", gameContext);
  
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI agent in a 2D farming game. You should behave like a friendly NPC farmer.
          
          Analyze the game state and decide what action to take. Consider:
          - If the player is close (distance < 100), move toward them or interact
          - If the player is far, do random movements or idle
          - Sometimes act randomly to seem more lifelike
          
          Respond with ONLY a JSON object in this exact format:
          {
            "action": "move_to_player" | "move_random" | "idle" | "interact",
            "target": {"x": number, "y": number},
            "reasoning": "brief explanation"
          }`,
        },
        { 
          role: "user", 
          content: `Current game state:
          - Player position: (${gameContext.playerPosition.x}, ${gameContext.playerPosition.y})
          - AI position: (${gameContext.aiPosition.x}, ${gameContext.aiPosition.y})
          - Distance to player: ${Math.sqrt(
            Math.pow(gameContext.playerPosition.x - gameContext.aiPosition.x, 2) + 
            Math.pow(gameContext.playerPosition.y - gameContext.aiPosition.y, 2)
          ).toFixed(1)} pixels
          - Map bounds: width=${gameContext.mapBounds.width}, height=${gameContext.mapBounds.height}
          - Time: ${gameContext.timestamp}` 
        },
      ],
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 200,
    });
    
    const response = chatCompletion.choices[0].message.content;
    console.log("AI Response:", response);
    const decision = JSON.parse(response);
    
    if (decision.target) {
      decision.target.x = Math.max(50, Math.min(gameContext.mapBounds.width - 50, decision.target.x));
      decision.target.y = Math.max(50, Math.min(gameContext.mapBounds.height - 50, decision.target.y));
    }
    
    return decision;
    
  } catch (error) {
    console.error('AI decision error:', error);
    // Fall back to idle if error occurs
    return {
      action: "idle",
      target: gameContext.aiPosition,
      reasoning: "Error occurred, staying in place"
    };
  }
}

async function onAIDecisionRequested(jobData) {
  console.log(`Processing AI decision for agent ${jobData.aiAgentId}`);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const decision = await makeAIDecision(jobData.gameState);
    console.log(`AI Decision made:`, decision);
    
    // Emit real-time update to game clients
    io.emit("ai.decision", {
      aiAgentId: jobData.aiAgentId,
      decision: decision,
      timestamp: Date.now()
    });
    
    return { success: true, decision };
    
  } catch (error) {
    console.error('AI decision failed:', error);
    
    // Emit error to clients
    io.emit("ai.error", {
      aiAgentId: jobData.aiAgentId,
      error: error.message,
      timestamp: Date.now()
    });
    
    return { success: false, error: error.message };
  }
}

async function onPeriodicAIUpdate(jobData) {
  console.log(`Periodic AI update for agent ${jobData.aiAgentId}`);
  
  // This could be used for regular AI behavior updates
  // For now, just trigger a new decision
  return onAIDecisionRequested(jobData);
}

// Job Handlers Map
const gameJobHandlers = {
  AIDecision: onAIDecisionRequested,
  PeriodicUpdate: onPeriodicAIUpdate,
};

// Worker Setup
const gameAIWorker = new Worker(
  "GameAI",
  async (job) => {
    console.log(`Processing job: ${job.name} with ID: ${job.id}`);
    
    const handler = gameJobHandlers[job.name];
    if (handler) {
      return await handler(job.data);
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

console.log("🤖 Game AI Worker started successfully!");
console.log("🔌 Listening for jobs on 'GameAI' queue");
console.log("📡 WebSocket server running on port 3001");
