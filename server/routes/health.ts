import { Router } from 'express';
import { log } from '../utils/logger';
import redis from '../utils/redis';
import { storage } from '../storage';
import os from 'os';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
  };
  cpu: {
    loadAvg: number[];
    cores: number;
  };
  services: {
    redis: boolean;
    database: boolean;
  };
}

// Basic health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Detailed health check
router.get('/health/details', async (req, res) => {
  try {
    // Check Redis
    let redisHealthy = false;
    try {
      await redis.ping();
      redisHealthy = true;
    } catch (error) {
      log.error('Redis health check failed:', error);
    }

    // Check Database
    let dbHealthy = false;
    try {
      await storage.healthCheck();
      dbHealthy = true;
    } catch (error) {
      log.error('Database health check failed:', error);
    }

    const status: HealthStatus = {
      status: redisHealthy && dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        loadAvg: os.loadavg(),
        cores: os.cpus().length
      },
      services: {
        redis: redisHealthy,
        database: dbHealthy
      }
    };

    res.json(status);
  } catch (error) {
    log.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

export default router; 