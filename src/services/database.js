const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Professional Database Service
 * Handles SQLite connection with proper error handling and logging
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Initialize database connection
   * Creates database file and tables if they don't exist
   */
  async connect() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(config.database.path);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info(`Created data directory: ${dataDir}`);
      }

      // Create database connection
      this.db = new sqlite3.Database(config.database.path, (err) => {
        if (err) {
          logger.error('Database connection failed:', err);
          throw err;
        }
        logger.info('Database connected successfully', {
          path: config.database.path,
          timestamp: new Date().toISOString()
        });
      });

      // Initialize tables
      await this.initializeTables();
      this.isConnected = true;
      
      return this.db;
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables
   * Creates users table with proper schema
   */
  async initializeTables() {
    return new Promise((resolve, reject) => {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          status TEXT NOT NULL DEFAULT 'active',
          createdAt TEXT NOT NULL,
          emailHash TEXT NOT NULL,
          signature TEXT NOT NULL
        )
      `;

      this.db.run(createUsersTable, (err) => {
        if (err) {
          logger.error('Failed to create users table:', err);
          reject(err);
        } else {
          logger.info('Users table initialized successfully');
          resolve();
        }
      });
    });
  }

  /**
   * Test database connection
   * Verifies that the database is accessible and responsive
   */
  async testConnection() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get('SELECT 1 as test', (err, row) => {
        if (err) {
          logger.error('Database connection test failed:', err);
          reject(err);
        } else {
          logger.info('Database connection test successful');
          resolve(row);
        }
      });
    });
  }

  /**
   * Get database instance
   * Returns the database connection for use in other services
   */
  getDatabase() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   * Properly closes the database connection
   */
  async disconnect() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err);
            reject(err);
          } else {
            logger.info('Database connection closed');
            this.isConnected = false;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get database statistics
   * Returns useful database information
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get('SELECT COUNT(*) as userCount FROM users', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            userCount: row.userCount,
            connected: this.isConnected,
            path: config.database.path
          });
        }
      });
    });
  }
}

// Export singleton instance
module.exports = new DatabaseService();
