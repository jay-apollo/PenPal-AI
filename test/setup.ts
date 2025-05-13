import { config } from '../server/config';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.SESSION_SECRET = 'test-session-secret-thats-at-least-32-chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.CORS_ORIGIN = 'http://localhost:5000';

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  // Add any global teardown here
}); 