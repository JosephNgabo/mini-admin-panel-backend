// tests/app.test.js
const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/database', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getDatabase: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue([]),
  }),
  testConnection: jest.fn().mockResolvedValue({ status: 'ok' }),
  isConnected: true,
}));

describe('App health routes', () => {
  it('should return 200 for GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  it('should return 200 for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
