const express = require('express');
const databaseService = require('../services/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Health Check Routes
 * Provides comprehensive health status including database connectivity
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic server health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/', async (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/database:
 *   get:
 *     summary: Database health check
 *     description: Checks database connectivity and returns statistics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *       500:
 *         description: Database connection failed
 */
router.get('/database', async (req, res) => {
  try {
    // Test database connection
    await databaseService.testConnection();
    
    // Get database statistics
    const stats = await databaseService.getStats();
    
    res.status(200).json({
      status: 'OK',
      database: {
        connected: true,
        path: stats.path,
        userCount: stats.userCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      database: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /health/full:
 *   get:
 *     summary: Full system health check
 *     description: Comprehensive health check including server and database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All systems healthy
 *       500:
 *         description: One or more systems unhealthy
 */
router.get('/full', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      systems: {}
    };

    // Check database
    try {
      await databaseService.testConnection();
      const stats = await databaseService.getStats();
      health.systems.database = {
        status: 'OK',
        connected: true,
        userCount: stats.userCount
      };
    } catch (dbError) {
      health.systems.database = {
        status: 'ERROR',
        connected: false,
        error: dbError.message
      };
      health.status = 'DEGRADED';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.systems.memory = {
      status: 'OK',
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    const statusCode = health.status === 'OK' ? 200 : 500;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Full health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
