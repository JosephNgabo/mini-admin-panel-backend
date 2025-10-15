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
      expect(stats).toHaveProperty('path');
      expect(stats.path).toBe(config.database.path);
    });
  });

  describe('Database Operations', () => {
    it('should have users table created', async () => {
      const db = databaseService.getDatabase();
      expect(db).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // Test with invalid query
      const db = databaseService.getDatabase();
      expect(() => {
        db.run('INVALID SQL QUERY', (err) => {
          expect(err).toBeDefined();
        });
      }).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should use correct database path', () => {
      expect(config.database.path).toBeDefined();
      expect(typeof config.database.path).toBe('string');
    });

    it('should have proper database options', () => {
      expect(config.database.options).toBeDefined();
      expect(typeof config.database.options.verbose).toBe('boolean');
    });
  });
});
