const User = require('../models/User');
const logger = require('../utils/logger');
const cryptoService = require('../utils/crypto');

/**
 * User Service
 * Business logic layer for user operations
 * Handles validation, business rules, and data processing
 */
class UserService {
  constructor() {
    this.validRoles = ['admin', 'user', 'moderator'];
    this.validStatuses = ['active', 'inactive'];
  }

  /**
   * Validate user data
   * @param {Object} userData - User data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    // Email validation
    if (!isUpdate || userData.email !== undefined) {
      if (!userData.email || typeof userData.email !== 'string') {
        errors.push('Email is required and must be a string');
      } else if (!this.isValidEmail(userData.email)) {
        errors.push('Email must be a valid email address');
      }
    }

    // Role validation
    if (userData.role !== undefined) {
      if (!this.validRoles.includes(userData.role)) {
        errors.push(`Role must be one of: ${this.validRoles.join(', ')}`);
      }
    }

    // Status validation
    if (userData.status !== undefined) {
      if (!this.validStatuses.includes(userData.status)) {
        errors.push(`Status must be one of: ${this.validStatuses.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      // Validate input data
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Process email cryptographically (SHA-384 hash + RSA signature)
      logger.info('Processing user email with cryptographic features', { 
        email: userData.email 
      });
      
      const cryptoData = cryptoService.processUserEmail(userData.email);
      
      // Set user data with cryptographic information
      const userToCreate = {
        email: userData.email,
        role: userData.role || 'user',
        status: userData.status || 'active',
        emailHash: cryptoData.emailHash, // SHA-384 hash of email
        signature: cryptoData.signature, // RSA digital signature
      };

      // Create user
      const createdUser = await User.create(userToCreate);

      logger.info('User created successfully', {
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      });

      return {
        success: true,
        data: createdUser,
        message: 'User created successfully',
      };
    } catch (error) {
      logger.error('Failed to create user:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create user',
      };
    }
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users and metadata
   */
  async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        status,
        search,
      } = options;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query options
      const queryOptions = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        role,
        status,
      };

      // Get users
      const users = await User.findAll(queryOptions);
      
      // Get total count
      const totalCount = await User.count({ role, status });

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Users retrieved successfully', {
        count: users.length,
        page,
        totalPages,
        totalCount,
      });

      return {
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
        },
        message: 'Users retrieved successfully',
      };
    } catch (error) {
      logger.error('Failed to get users:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve users',
      };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found',
        };
      }

      logger.info('User retrieved successfully', {
        userId: user.id,
        email: user.email,
      });

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user',
      };
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate update data
      const validation = this.validateUserData(updateData, true);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found',
        };
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await User.findByEmail(updateData.email);
        if (emailExists) {
          throw new Error('User with this email already exists');
        }
        
        // If email is being updated, we need to re-hash and re-sign
        const cryptoData = cryptoService.processUserEmail(updateData.email);
        updateData.emailHash = cryptoData.emailHash;
        updateData.signature = cryptoData.signature;
      }

      // Update user
      const updatedUser = await User.update(userId, updateData);

      if (!updatedUser) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found',
        };
      }

      logger.info('User updated successfully', {
        userId: updatedUser.id,
        email: updatedUser.email,
        updatedFields: Object.keys(updateData),
      });

      return {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      };
    } catch (error) {
      logger.error('Failed to update user:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update user',
      };
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found',
        };
      }

      // Delete user
      const deleted = await User.delete(userId);

      if (!deleted) {
        return {
          success: false,
          error: 'User not found',
          message: 'User not found',
        };
      }

      logger.info('User deleted successfully', {
        userId: existingUser.id,
        email: existingUser.email,
      });

      return {
        success: true,
        data: { id: userId },
        message: 'User deleted successfully',
      };
    } catch (error) {
      logger.error('Failed to delete user:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete user',
      };
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ status: 'active' });
      const inactiveUsers = await User.count({ status: 'inactive' });
      const adminUsers = await User.count({ role: 'admin' });

      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
        users: totalUsers - adminUsers,
      };

      logger.info('User statistics retrieved', stats);

      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully',
      };
    } catch (error) {
      logger.error('Failed to get user statistics:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user statistics',
      };
    }
  }

  /**
   * Get users created in the last N days
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Users by day data
   */
  async getUsersByDay(days = 7) {
    try {
      const usersByDay = await User.getUsersByDay(days);

      logger.info('Users by day retrieved', {
        days,
        records: usersByDay.length,
      });

      return {
        success: true,
        data: usersByDay,
        message: 'Users by day retrieved successfully',
      };
    } catch (error) {
      logger.error('Failed to get users by day:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve users by day',
      };
    }
  }

  /**
   * Export all users in Protocol Buffer format
   * @returns {Promise<Object>} Serialized user data
   */
  async exportUsers() {
    try {
      logger.info('Starting user export in Protocol Buffer format');

      // Get all users from database
      const users = await User.findAll();
      
      if (!users || users.length === 0) {
        logger.info('No users found for export');
        return {
          success: true,
          data: Buffer.alloc(0), // Empty buffer
          message: 'No users to export',
          userCount: 0
        };
      }

      // Import protobuf service
      const protobufService = require('../utils/protobuf');
      
      // Serialize users to Protocol Buffer format
      const serializedData = await protobufService.serializeUserCollection(users);

      logger.info('Users exported successfully in Protocol Buffer format', {
        userCount: users.length,
        serializedSize: serializedData.length,
        format: 'Protocol Buffer'
      });

      return {
        success: true,
        data: serializedData,
        message: 'Users exported successfully',
        userCount: users.length,
        format: 'Protocol Buffer',
        size: serializedData.length
      };

    } catch (error) {
      logger.error('Failed to export users:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export users',
      };
    }
  }
}

module.exports = new UserService();
