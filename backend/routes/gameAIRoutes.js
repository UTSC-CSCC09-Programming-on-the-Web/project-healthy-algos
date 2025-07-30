import { Queue } from "bullmq";
import { Router } from "express";

const router = Router();

// Init Redis Queue
const gameAIQueue = new Queue("GameAI", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  }
});

// Request AI Decision
router.post('/ai-decision', async (req, res) => {
  try {
    const { aiAgentId, gameState } = req.body;
    
    if (!aiAgentId || !gameState) {
      return res.status(400).json({ 
        error: 'Missing required fields: aiAgentId, gameState' 
      });
    }
    
    console.log(`Queueing AI decision for agent ${aiAgentId}`);
    
    // Add job to queue
    const job = await gameAIQueue.add('AIDecision', {
      aiAgentId,
      gameState,
      timestamp: Date.now()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    
    res.json({ 
      jobId: job.id, 
      status: 'queued',
      message: 'AI decision request queued successfully'
    });
    
  } catch (error) {
    console.error('Error queueing AI decision:', error);
    res.status(500).json({ error: 'Failed to queue AI decision' });
  }
});

// Get job status (optional - for debugging)
router.get('/job-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await gameAIQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    });
    
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Check whether the Ai service is running
router.get('/health', async (req, res) => {
  try {
    const queueHealth = await gameAIQueue.getWaiting();
    res.json({
      status: 'healthy',
      queueName: gameAIQueue.name,
      waitingJobs: queueHealth.length,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
