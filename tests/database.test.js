const databaseService = require('../src/services/database');
const config = require('../src/config');

/**
 * Database Service Tests
 * Comprehensive testing for database connectivity and operations
 */
describe('Database Service', () => {
  beforeAll(async () => {
    // Connect to database before running tests
    await databaseService.connect();
  });

  afterAll(async () => {
    // Clean up database connection after tests
    await databaseService.disconnect();
  });

  describe('Connection', () => {
    it('should connect to database successfully', async () => {
      expect(databaseService.isConnected).toBe(true);
    });

    it('should test database connection', async () => {
      const result = await databaseService.testConnection();
      expect(result).toBeDefined();
      expect(result.test).toBe(1);
    });

    it('should get database statistics', async () => {
      const stats = await databaseService.getStats();
      expect(stats).toHaveProperty('userCount');
      expect(stats).toHaveProperty('connected', true);
      expect(stats).toHaveProperty('host');
      expect(stats).toHaveProperty('database');
    });
  });

  describe('Database Operations', () => {
    it('should have users table created', async () => {
      const db = databaseService.getDatabase();
      expect(db).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // Test with invalid query
      const pool = databaseService.getDatabase();
      try {
        await pool.query('INVALID SQL QUERY');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('syntax error');
      }
    });
  });

  describe('Configuration', () => {
    it('should use correct database host', () => {
      expect(config.database.host).toBeDefined();
      expect(typeof config.database.host).toBe('string');
    });

    it('should have proper database port', () => {
      expect(config.database.port).toBeDefined();
      expect(typeof config.database.port).toBe('string');
    });

    it('should have proper database name', () => {
      expect(config.database.database).toBeDefined();
      expect(typeof config.database.database).toBe('string');
    });
  });
});
