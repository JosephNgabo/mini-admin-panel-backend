const request = require('supertest');
const app = require('../src/app');
const databaseService = require('../src/services/database');

/**
 * Professional Test Suite
 * Comprehensive testing for the mini admin panel backend
 */
describe('Mini Admin Panel Backend', () => {
  beforeAll(async () => {
    // Connect to database before running tests
    await databaseService.connect();
  });

  afterAll(async () => {
    // Clean up database connection after tests
    await databaseService.disconnect();
  });
  describe('Health Check', () => {
    it('should return 200 and server status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
    });

    it('should return database health status', async () => {
      const response = await request(app).get('/health/database').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('connected', true);
      expect(response.body.database).toHaveProperty('userCount');
    });

    it('should return full system health', async () => {
      const response = await request(app).get('/health/full').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('systems');
      expect(response.body.systems).toHaveProperty('database');
      expect(response.body.systems).toHaveProperty('memory');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('documentation');
      expect(response.body).toHaveProperty('health');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('availableEndpoints');
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', async () => {
      await request(app).get('/api-docs/').expect(200);
    });
  });
});
