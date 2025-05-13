import Redis from 'ioredis';
import { config } from '../config';
import { log } from './logger';

const redis = new Redis(config.REDIS_URL);

redis.on('error', (error) => {
  log.error('Redis connection error:', error);
});

redis.on('connect', () => {
  log.info('Redis connected successfully');
});

export default redis; 