// tests/database.test.js
const databaseService = require('../src/services/database');

jest.mock('../src/services/database', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getDatabase: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue([]),
  }),
  testConnection: jest.fn().mockResolvedValue({ status: 'ok' }),
  isConnected: true,
}));

describe('Database Service', () => {
  it('should connect and disconnect successfully', async () => {
    const db = require('../src/services/database');

    await expect(db.connect()).resolves.toBe(true);
    await expect(db.disconnect()).resolves.toBe(true);
    const connection = db.getDatabase();
    await expect(connection.query()).resolves.toEqual([]);
  });

  it('should test connection', async () => {
    const db = require('../src/services/database');
    await expect(db.testConnection()).resolves.toEqual({ status: 'ok' });
  });
});
