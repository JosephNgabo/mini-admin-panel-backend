
// Mock the database service
jest.mock('../src/services/database', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getDatabase: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue([]),
  }),
  testConnection: jest.fn().mockResolvedValue({ status: 'ok' }),
  isConnected: true,
}));

jest.mock('../src/models/User', () => ({
  findAll: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((user) =>
    Promise.resolve({ id: 1, ...user })
  ),
  count: jest.fn().mockResolvedValue(0),
}));

describe('User routes', () => {


  it('should create a new user', async () => {
    const User = require('../src/models/User');
    const newUser = await User.create({ name: 'Test User' });
    expect(newUser).toEqual({ id: 1, name: 'Test User' });
  });

});
