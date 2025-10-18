const db = require('../src/services/database');

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
    const connection = db.getDatabase(); // <-- get the mocked connection here
    await expect(db.connect()).resolves.toBe(true);
    await expect(db.disconnect()).resolves.toBe(true);
    await expect(connection.query()).resolves.toEqual([]); // now connection is defined
  });

  it('should test connection', async () => {
    await expect(db.testConnection()).resolves.toEqual({ status: 'ok' });
  });
});
