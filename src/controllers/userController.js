const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 * Clear, professional, and well-documented API endpoints
 */
class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(req, res) {
    try {
      const { email, role, status } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
          message: 'Email field is required',
        });
      }

      // Create user
      const result = await userService.createUser({
        email,
        role,
        status,
        emailHash: '', // Will be set by crypto service later
        signature: '', // Will be set by crypto service later
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info('User created via API', {
        userId: result.data.id,
        email: result.data.email,
        ip: req.ip,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('User creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create user',
      });
    }
  }

  /**
   * Get all users with pagination and filtering
   * GET /api/users
   */
  async getUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        status,
        search,
      } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid page number',
          message: 'Page number must be greater than 0',
        });
      }

      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 100',
        });
      }

      // Get users
      const result = await userService.getUsers({
        page: pageNum,
        limit: limitNum,
        role,
        status,
        search,
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      logger.info('Users retrieved via API', {
        count: result.data.users.length,
        page: pageNum,
        ip: req.ip,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to get users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve users',
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
          message: 'User ID parameter is required',
        });
      }

      // Get user
      const result = await userService.getUserById(id);

      if (!result.success) {
        const statusCode = result.error === 'User not found' ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      logger.info('User retrieved by ID via API', {
        userId: id,
        ip: req.ip,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user',
      });
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
          message: 'User ID parameter is required',
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Update data is required',
          message: 'At least one field must be provided for update',
        });
      }

      // Update user
      const result = await userService.updateUser(id, updateData);

      if (!result.success) {
        const statusCode = result.error === 'User not found' ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      logger.info('User updated via API', {
        userId: id,
        updatedFields: Object.keys(updateData),
        ip: req.ip,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to update user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user',
      });
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
          message: 'User ID parameter is required',
        });
      }

      // Delete user
      const result = await userService.deleteUser(id);

      if (!result.success) {
        const statusCode = result.error === 'User not found' ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      logger.info('User deleted via API', {
        userId: id,
        ip: req.ip,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to delete user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete user',
      });
    }
  }

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  async getUserStats(req, res) {
    try {
      const result = await userService.getUserStats();

      if (!result.success) {
        return res.status(500).json(result);
      }

      logger.info('User statistics retrieved via API', {
        ip: req.ip,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to get user statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user statistics',
      });
    }
  }

  /**
   * Get users created in the last N days
   * GET /api/users/chart
   */
  async getUsersChart(req, res) {
    try {
      const { days = 7 } = req.query;
      const daysNum = parseInt(days);

      if (daysNum < 1 || daysNum > 365) {
        return res.status(400).json({
          success: false,
          error: 'Invalid days parameter',
          message: 'Days must be between 1 and 365',
        });
      }

      const result = await userService.getUsersByDay(daysNum);

      if (!result.success) {
        return res.status(500).json(result);
      }

      logger.info('Users chart data retrieved via API', {
        days: daysNum,
        ip: req.ip,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to get users chart data:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve users chart data',
      });
    }
  }

  /**
   * Export users in protobuf format
   * GET /api/users/export
   */
  async exportUsers(req, res) {
    try {
      logger.info('User export requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Get users in Protocol Buffer format
      const result = await userService.exportUsers();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }

      // Set appropriate headers for binary data
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="users.pb"');
      res.setHeader('Content-Length', result.data.length);
      res.setHeader('X-User-Count', result.userCount || 0);
      res.setHeader('X-Format', 'Protocol Buffer');
      res.setHeader('X-Size', result.size || 0);

      logger.info('Users exported successfully via API', {
        userCount: result.userCount,
        size: result.size,
        format: 'Protocol Buffer',
        ip: req.ip,
      });

      // Send binary data
      res.send(result.data);

    } catch (error) {
      logger.error('Failed to export users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to export users',
      });
    }
  }

  /**
   * Get public key for signature verification
   * GET /api/users/crypto/public-key
   */
  async getPublicKey(req, res) {
    try {
      const cryptoService = require('../utils/crypto');
      const publicKey = cryptoService.getPublicKey();
      const stats = cryptoService.getStats();

      logger.info('Public key requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        success: true,
        data: {
          publicKey,
          algorithm: stats.algorithm,
          hashAlgorithm: stats.hashAlgorithm,
        },
        message: 'Public key retrieved successfully',
      });
    } catch (error) {
      logger.error('Failed to get public key:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve public key',
      });
    }
  }

  /**
   * Verify digital signature
   * POST /api/users/crypto/verify
   */
  async verifySignature(req, res) {
    try {
      const { data, signature } = req.body;

      if (!data || !signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Both data and signature are required',
        });
      }

      const cryptoService = require('../utils/crypto');
      const isValid = cryptoService.verifySignature(data, signature);

      logger.info('Signature verification requested', {
        ip: req.ip,
        isValid,
        dataLength: data.length,
        signatureLength: signature.length,
      });

      res.json({
        success: true,
        data: isValid,
        message: isValid ? 'Signature is valid' : 'Signature is invalid',
      });
    } catch (error) {
      logger.error('Failed to verify signature:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify signature',
      });
    }
  }
}

module.exports = new UserController();
