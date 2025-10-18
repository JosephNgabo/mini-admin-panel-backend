const protobuf = require('protobufjs');
const path = require('path');
const logger = require('./logger');

/**
 * Protocol Buffer Utilities
 * Handles serialization and deserialization of user data
 *
 * Interview Points:
 * - Protocol Buffers: Efficient binary serialization format
 * - Schema Definition: .proto files define data structure
 * - Cross-platform: Works with any programming language
 * - Performance: Smaller and faster than JSON
 * - Type Safety: Strongly typed data structures
 */
class ProtobufService {
  constructor() {
    this.UserMessage = null;
    this.UserCollectionMessage = null;
    this.isInitialized = false;

    // Initialize protobuf schema asynchronously
    this.initializeProtobuf().catch(error => {
      logger.error('Failed to initialize protobuf in constructor:', error);
    });
  }

  /**
   * Coerce various timestamp inputs to ISO string
   */
  static toIsoString(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? '' : d.toISOString();
    } catch {}
  }

  /**
   * Initialize Protocol Buffer schema
   * Loads and compiles the .proto file
   */
  async initializeProtobuf() {
    try {
      const protoPath = path.join(__dirname, '../proto/user.proto');

      // Load and compile the .proto file
      const root = await protobuf.load(protoPath);

      // Get message types
      this.UserMessage = root.lookupType('user.User');
      this.UserCollectionMessage = root.lookupType('user.UserCollection');

      this.isInitialized = true;

      logger.info('Protocol Buffer schema loaded successfully', {
        userMessage: this.UserMessage.name,
        userCollectionMessage: this.UserCollectionMessage.name,
        protoPath: protoPath,
      });
    } catch (error) {
      logger.error('Failed to initialize Protocol Buffer schema:', error);
      throw error;
    }
  }

  /**
   * Ensure protobuf service is initialized
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeProtobuf();
    }
  }

  /**
   * Serialize a single user to Protocol Buffer format
   * @param {Object} user - User object from database
   * @returns {Buffer} Serialized user data
   */
  async serializeUser(user) {
    try {
      await this.ensureInitialized();

      if (!this.isInitialized) {
        throw new Error('Protocol Buffer not initialized');
      }

      // Validate user data
      if (!user || typeof user !== 'object') {
        throw new Error('Invalid user data provided');
      }

      // Create user message
      const userMessage = {
        id: user.id || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || '',
        // ProtobufJS expects camelCase field names when creating messages
        createdAt: ProtobufService.toIsoString(
          user.created_at || user.createdAt
        ),
        emailHash: user.email_hash || user.emailHash || '',
        signature: user.signature || '',
      };

      // Verify message before encoding
      const errMsg = this.UserMessage.verify(userMessage);
      if (errMsg) {
        throw new Error(`User message verification failed: ${errMsg}`);
      }

      // Create message and encode
      const message = this.UserMessage.create(userMessage);
      const buffer = this.UserMessage.encode(message).finish();

      logger.info('User serialized successfully', {
        userId: user.id,
        bufferSize: buffer.length,
        email: user.email,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to serialize user:', error);
      throw error;
    }
  }

  /**
   * Serialize multiple users to Protocol Buffer format
   * @param {Array} users - Array of user objects
   * @returns {Buffer} Serialized user collection
   */
  async serializeUserCollection(users) {
    try {
      await this.ensureInitialized();

      if (!this.isInitialized) {
        throw new Error('Protocol Buffer not initialized');
      }

      // Validate users array
      if (!Array.isArray(users)) {
        throw new Error('Users must be an array');
      }

      // Create user collection message
      const usersMapped = users.map(user => ({
        id: user.id || '',
        email: user.email || '',
        role: user.role || '',
        status: user.status || '',
        // ProtobufJS expects camelCase property names on create
        createdAt: ProtobufService.toIsoString(
          user.created_at || user.createdAt
        ),
        emailHash: user.email_hash || user.emailHash || '',
        signature: user.signature || '',
      }));

      // Debug: log mapping outcome for hashes
      try {
        usersMapped.forEach(u => {
          logger.info('Protobuf mapping - user hash field', {
            userId: u.id,
            hasEmailHash: !!u.email_hash,
            emailHashPreview: u.email_hash
              ? String(u.email_hash).slice(0, 12)
              : '',
          });
        });
      } catch {}

      const userCollectionMessage = {
        users: usersMapped,
        total_count: users.length,
        exported_at: new Date().toISOString(),
        algorithm: 'RSA-2048',
        hash_algorithm: 'SHA-384',
      };

      // Verify message before encoding
      const errMsg = this.UserCollectionMessage.verify(userCollectionMessage);
      if (errMsg) {
        throw new Error(
          `User collection message verification failed: ${errMsg}`
        );
      }

      // Create message and encode
      const message = this.UserCollectionMessage.create(userCollectionMessage);
      const buffer = this.UserCollectionMessage.encode(message).finish();

      logger.info('User collection serialized successfully', {
        userCount: users.length,
        bufferSize: buffer.length,
        exportedAt: userCollectionMessage.exported_at,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to serialize user collection:', error);
      throw error;
    }
  }

  /**
   * Deserialize Protocol Buffer data to user object
   * @param {Buffer} buffer - Serialized user data
   * @returns {Object} Deserialized user object
   */
  deserializeUser(buffer) {
    try {
      if (!this.isInitialized) {
        throw new Error('Protocol Buffer not initialized');
      }

      if (!Buffer.isBuffer(buffer)) {
        throw new Error('Buffer must be a Buffer object');
      }

      // Decode the buffer
      const message = this.UserMessage.decode(buffer);
      const user = this.UserMessage.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: true,
        arrays: true,
        objects: true,
      });

      logger.info('User deserialized successfully', {
        userId: user.id,
        email: user.email,
        bufferSize: buffer.length,
      });

      return user;
    } catch (error) {
      logger.error('Failed to deserialize user:', error);
      throw error;
    }
  }

  /**
   * Deserialize Protocol Buffer data to user collection
   * @param {Buffer} buffer - Serialized user collection data
   * @returns {Object} Deserialized user collection
   */
  deserializeUserCollection(buffer) {
    try {
      if (!this.isInitialized) {
        throw new Error('Protocol Buffer not initialized');
      }

      if (!Buffer.isBuffer(buffer)) {
        throw new Error('Buffer must be a Buffer object');
      }

      // Decode the buffer
      const message = this.UserCollectionMessage.decode(buffer);
      const userCollection = this.UserCollectionMessage.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: true,
        arrays: true,
        objects: true,
      });

      logger.info('User collection deserialized successfully', {
        userCount: userCollection.users.length,
        totalCount: userCollection.total_count,
        exportedAt: userCollection.exported_at,
        bufferSize: buffer.length,
      });

      return userCollection;
    } catch (error) {
      logger.error('Failed to deserialize user collection:', error);
      throw error;
    }
  }

  /**
   * Get Protocol Buffer statistics
   * @returns {Object} Protobuf service statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      userMessage: this.UserMessage ? this.UserMessage.name : null,
      userCollectionMessage: this.UserCollectionMessage
        ? this.UserCollectionMessage.name
        : null,
      supportedFormats: ['binary', 'json'],
      version: protobuf.util.Long ? 'protobufjs' : 'unknown',
    };
  }

  /**
   * Test Protocol Buffer functionality
   * @returns {Object} Test results
   */
  async testProtobuf() {
    try {
      if (!this.isInitialized) {
        throw new Error('Protocol Buffer not initialized');
      }

      // Test data
      const testUser = {
        id: 'test-id-123',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        email_hash: 'test-hash-123',
        signature: 'test-signature-123',
      };

      // Test serialization
      const serialized = this.serializeUser(testUser);

      // Test deserialization
      const deserialized = this.deserializeUser(serialized);

      // Verify data integrity
      const isDataIntact =
        deserialized.id === testUser.id &&
        deserialized.email === testUser.email &&
        deserialized.role === testUser.role &&
        deserialized.status === testUser.status;

      logger.info('Protocol Buffer test completed', {
        success: isDataIntact,
        originalSize: JSON.stringify(testUser).length,
        serializedSize: serialized.length,
        compressionRatio: (
          JSON.stringify(testUser).length / serialized.length
        ).toFixed(2),
      });

      return {
        success: isDataIntact,
        originalSize: JSON.stringify(testUser).length,
        serializedSize: serialized.length,
        compressionRatio: (
          JSON.stringify(testUser).length / serialized.length
        ).toFixed(2),
      };
    } catch (error) {
      logger.error('Protocol Buffer test failed:', error);
      throw error;
    }
  }
}

module.exports = new ProtobufService();
