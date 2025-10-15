const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Professional Database Service
 * Handles PostgreSQL connection with proper error handling and logging
 */
class DatabaseService {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Initialize database connection
   * Creates PostgreSQL connection pool and tables if they don't exist
   */
  async connect() {
    try {
      // Create PostgreSQL connection pool
      this.pool = new Pool(config.database);

      // Test the connection
      const client = await this.pool.connect();
      logger.info('Database connected successfully', {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        timestamp: new Date().toISOString(),
      });

      // Initialize tables
      await this.initializeTables(client);
      client.release();

      this.isConnected = true;
      return this.pool;
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables
   * Creates users table with proper PostgreSQL schema
   */
  async initializeTables(client) {
    try {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          email_hash VARCHAR(255) NOT NULL,
          signature TEXT NOT NULL
        )
      `;

      await client.query(createUsersTable);
      logger.info('Users table initialized successfully');
    } catch (error) {
      logger.error('Failed to create users table:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   * Verifies that the database is accessible and responsive
   */
  async testConnection() {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT 1 as test');
      client.release();

      logger.info('Database connection test successful');
      return result.rows[0];
    } catch (error) {
      logger.error('Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Get database pool
   * Returns the PostgreSQL connection pool for use in other services
   */
  getDatabase() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Close database connection
   * Properly closes the PostgreSQL connection pool
   */
  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end();
        logger.info('Database connection pool closed');
        this.isConnected = false;
      } catch (error) {
        logger.error('Error closing database pool:', error);
        throw error;
      }
    }
  }

  /**
   * Get database statistics
   * Returns useful database information
   */
  async getStats() {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    try {
      const client = await this.pool.connect();
      const result = await client.query(
        'SELECT COUNT(*) as user_count FROM users',
      );
      client.release();

      return {
        userCount: parseInt(result.rows[0].user_count),
        connected: this.isConnected,
        host: config.database.host,
        database: config.database.database,
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();
