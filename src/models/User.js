const databaseService = require('../services/database');
const logger = require('../utils/logger');

class User {
  constructor() {
    this.tableName = 'users';
  }

  /**
   * Create a new user
   * @param {Object} userData - User data to create
   * @param {string} userData.email - User email
   * @param {string} userData.role - User role (admin, user, etc.)
   * @param {string} userData.status - User status (active, inactive)
   * @param {string} userData.emailHash - SHA-384 hash of email
   * @param {string} userData.signature - Digital signature
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    try {
      const pool = databaseService.getDatabase();
      const query = `
        INSERT INTO users (email, role, status, email_hash, signature)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role, status, created_at, email_hash, signature
      `;

      const values = [
        userData.email,
        userData.role || 'user',
        userData.status || 'active',
        userData.emailHash,
        userData.signature,
      ];

      const result = await pool.query(query, values);
      const user = result.rows[0];

      logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return user;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Get all users
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of users to return
   * @param {number} options.offset - Number of users to skip
   * @param {string} options.role - Filter by role
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Array of user objects
   */
  async findAll(options = {}) {
    try {
      const pool = databaseService.getDatabase();
      let query = `
        SELECT id, email, role, status, created_at, email_hash, signature
        FROM users
      `;

      const conditions = [];
      const values = [];
      let paramCount = 0;

      // Add filters
      if (options.role) {
        paramCount++;
        conditions.push(`role = $${paramCount}`);
        values.push(options.role);
      }

      if (options.status) {
        paramCount++;
        conditions.push(`status = $${paramCount}`);
        values.push(options.status);
      }

      // Add WHERE clause if filters exist
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add ordering
      query += ' ORDER BY created_at DESC';

      // Add pagination
      if (options.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        values.push(options.limit);
      }

      if (options.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(options.offset);
      }

      const result = await pool.query(query, values);

      logger.info('Users retrieved successfully', {
        count: result.rows.length,
        filters: options,
      });

      return result.rows;
    } catch (error) {
      logger.error('Failed to retrieve users:', error);
      throw error;
    }
  }

  /**
   Get user by ID
    @param {string} userId 
    @returns {Promise<Object|null>} 
   */
  async findById(userId) {
    try {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.info('Invalid UUID format', { userId });
        return null;
      }

      const pool = databaseService.getDatabase();
      const query = `
        SELECT id, email, role, status, created_at, email_hash, signature
        FROM users
        WHERE id = $1
      `;

      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        logger.info('User not found', { userId });
        return null;
      }

      logger.info('User retrieved successfully', {
        userId: result.rows[0].id,
        email: result.rows[0].email,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to retrieve user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByEmail(email) {
    try {
      const pool = databaseService.getDatabase();
      const query = `
        SELECT id, email, role, status, created_at, email_hash, signature
        FROM users
        WHERE email = $1
      `;

      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        logger.info('User not found by email', { email });
        return null;
      }

      logger.info('User retrieved by email successfully', {
        userId: result.rows[0].id,
        email: result.rows[0].email,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to retrieve user by email:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  async update(userId, updateData) {
    try {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.info('Invalid UUID format', { userId });
        return null;
      }

      const pool = databaseService.getDatabase();

      // Build dynamic query
      const fields = [];
      const values = [];
      let paramCount = 0;

      if (updateData.email !== undefined) {
        paramCount++;
        fields.push(`email = $${paramCount}`);
        values.push(updateData.email);
      }

      if (updateData.role !== undefined) {
        paramCount++;
        fields.push(`role = $${paramCount}`);
        values.push(updateData.role);
      }

      if (updateData.status !== undefined) {
        paramCount++;
        fields.push(`status = $${paramCount}`);
        values.push(updateData.status);
      }

      if (updateData.emailHash !== undefined) {
        paramCount++;
        fields.push(`email_hash = $${paramCount}`);
        values.push(updateData.emailHash);
      }

      if (updateData.signature !== undefined) {
        paramCount++;
        fields.push(`signature = $${paramCount}`);
        values.push(updateData.signature);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      paramCount++;
      values.push(userId);

      const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, role, status, created_at, email_hash, signature
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        logger.info('User not found for update', { userId });
        return null;
      }

      const user = result.rows[0];
      logger.info('User updated successfully', {
        userId: user.id,
        email: user.email,
        updatedFields: Object.keys(updateData),
      });

      return user;
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async delete(userId) {
    try {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.info('Invalid UUID format', { userId });
        return false;
      }

      const pool = databaseService.getDatabase();
      const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id, email
      `;

      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        logger.info('User not found for deletion', { userId });
        return false;
      }

      const deletedUser = result.rows[0];
      logger.info('User deleted successfully', {
        userId: deletedUser.id,
        email: deletedUser.email,
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Get user count
   * @param {Object} options - Filter options
   * @returns {Promise<number>} Number of users
   */
  async count(options = {}) {
    try {
      const pool = databaseService.getDatabase();
      let query = 'SELECT COUNT(*) as count FROM users';

      const conditions = [];
      const values = [];
      let paramCount = 0;

      // Add filters
      if (options.role) {
        paramCount++;
        conditions.push(`role = $${paramCount}`);
        values.push(options.role);
      }

      if (options.status) {
        paramCount++;
        conditions.push(`status = $${paramCount}`);
        values.push(options.status);
      }

      // Add WHERE clause if filters exist
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await pool.query(query, values);
      const count = parseInt(result.rows[0].count);

      logger.info('User count retrieved', { count, filters: options });
      return count;
    } catch (error) {
      logger.error('Failed to get user count:', error);
      throw error;
    }
  }

  /**
   * Get users created in the last N days
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Array of user creation data
   */
  async getUsersByDay(days = 7) {
    try {
      const pool = databaseService.getDatabase();
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      const result = await pool.query(query);

      logger.info('Users by day retrieved', {
        days,
        records: result.rows.length,
      });

      return result.rows;
    } catch (error) {
      logger.error('Failed to get users by day:', error);
      throw error;
    }
  }
}

module.exports = new User();
