const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Cryptographic Utilities
 * Implements SHA-384 hashing and RSA digital signing for user data
 *
 * Interview Points:
 * - SHA-384: More secure than SHA-256, 384-bit output
 * - RSA: Industry standard for digital signatures
 * - Key Management: Secure key generation and storage
 * - Data Integrity: Ensures data hasn't been tampered with
 */
class CryptoService {
  constructor() {
    this.privateKey = null;
    this.publicKey = null;
    this.keyPath = path.join(__dirname, '../../keys');
    this.privateKeyPath = path.join(this.keyPath, 'private.pem');
    this.publicKeyPath = path.join(this.keyPath, 'public.pem');

    this.initializeKeys();
  }

  /**
   * Initialize RSA keypair
   * Generates new keys if they don't exist, loads existing ones if they do
   */
  async initializeKeys() {
    try {
      // Create keys directory if it doesn't exist
      if (!fs.existsSync(this.keyPath)) {
        fs.mkdirSync(this.keyPath, { recursive: true });
        logger.info('Created keys directory', { path: this.keyPath });
      }

      // Check if keys already exist
      if (
        fs.existsSync(this.privateKeyPath) &&
        fs.existsSync(this.publicKeyPath)
      ) {
        await this.loadExistingKeys();
        logger.info('Loaded existing RSA keypair');
      } else {
        await this.generateNewKeys();
        logger.info('Generated new RSA keypair');
      }
    } catch (error) {
      logger.error('Failed to initialize cryptographic keys:', error);
      throw error;
    }
  }

  /**
   * Load existing RSA keys from files
   */
  async loadExistingKeys() {
    try {
      this.privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
      this.publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
    } catch (error) {
      logger.error('Failed to load existing keys:', error);
      throw error;
    }
  }

  /**
   * Generate new RSA keypair
   * RSA-2048: Industry standard, secure for most applications
   */
  async generateNewKeys() {
    try {
      // Generate RSA keypair
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // 2048-bit key (industry standard)
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      // Save keys to files
      fs.writeFileSync(this.privateKeyPath, privateKey);
      fs.writeFileSync(this.publicKeyPath, publicKey);

      this.privateKey = privateKey;
      this.publicKey = publicKey;

      logger.info('RSA keypair generated successfully', {
        keySize: '2048-bit',
        algorithm: 'RSA',
        privateKeyPath: this.privateKeyPath,
        publicKeyPath: this.publicKeyPath,
      });
    } catch (error) {
      logger.error('Failed to generate RSA keypair:', error);
      throw error;
    }
  }

  /**
   * Hash email using SHA-384
   * SHA-384: More secure than SHA-256, produces 384-bit (48-byte) hash
   *
   * Interview Points:
   * - SHA-384 is more secure than SHA-256
   * - Produces fixed-length output regardless of input size
   * - One-way function (cannot reverse the hash)
   * - Collision-resistant (extremely difficult to find two inputs with same hash)
   */
  hashEmail(email) {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Email must be a non-empty string');
      }

      // Create SHA-384 hash
      const hash = crypto.createHash('sha384');
      hash.update(email.toLowerCase().trim());
      const emailHash = hash.digest('hex');

      logger.info('Email hashed successfully', {
        email: email,
        hashLength: emailHash.length,
        algorithm: 'SHA-384',
      });

      return emailHash;
    } catch (error) {
      logger.error('Failed to hash email:', error);
      throw error;
    }
  }

  /**
   * Create digital signature using RSA private key
   * Signs the email hash to prove authenticity
   *
   * Interview Points:
   * - Digital signature proves data came from our server
   * - Uses RSA private key (only we have this)
   * - Anyone can verify with our public key
   * - Ensures data integrity and authenticity
   */
  signHash(emailHash) {
    try {
      if (!emailHash || typeof emailHash !== 'string') {
        throw new Error('Email hash must be a non-empty string');
      }

      if (!this.privateKey) {
        throw new Error('Private key not available for signing');
      }

      // Create digital signature
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(emailHash);
      const signature = sign.sign(this.privateKey, 'hex');

      logger.info('Digital signature created successfully', {
        hashLength: emailHash.length,
        signatureLength: signature.length,
        algorithm: 'RSA-SHA256',
      });

      return signature;
    } catch (error) {
      logger.error('Failed to create digital signature:', error);
      throw error;
    }
  }

  /**
   * Verify digital signature using RSA public key
   * Used by frontend to verify data authenticity
   *
   * Interview Points:
   * - Anyone can verify signature with public key
   * - Proves data hasn't been tampered with
   * - Proves data came from our server
   * - Essential for frontend security
   */
  verifySignature(emailHash, signature) {
    try {
      if (!emailHash || !signature) {
        throw new Error('Email hash and signature are required');
      }

      if (!this.publicKey) {
        throw new Error('Public key not available for verification');
      }

      // Verify signature
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(emailHash);
      const isValid = verify.verify(this.publicKey, signature, 'hex');

      logger.info('Signature verification completed', {
        isValid: isValid,
        algorithm: 'RSA-SHA256',
      });

      return isValid;
    } catch (error) {
      logger.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Get public key for frontend verification
   * Frontend needs this to verify signatures
   */
  getPublicKey() {
    if (!this.publicKey) {
      throw new Error('Public key not available');
    }
    return this.publicKey;
  }

  /**
   * Process user email: hash + sign
   * Complete cryptographic processing for user creation
   *
   * Interview Points:
   * - Combines hashing and signing in one operation
   * - Returns both hash and signature
   * - Used during user creation
   * - Ensures data integrity from creation
   */
  processUserEmail(email) {
    try {
      logger.info('Processing user email cryptographically', { email: email });

      // Step 1: Hash the email
      const emailHash = this.hashEmail(email);

      // Step 2: Sign the hash
      const signature = this.signHash(emailHash);

      logger.info('User email processed successfully', {
        email: email,
        hashLength: emailHash.length,
        signatureLength: signature.length,
      });

      return {
        emailHash,
        signature,
      };
    } catch (error) {
      logger.error('Failed to process user email:', error);
      throw error;
    }
  }

  /**
   * Get cryptographic statistics
   * Useful for monitoring and debugging
   */
  getStats() {
    return {
      hasPrivateKey: !!this.privateKey,
      hasPublicKey: !!this.publicKey,
      keyPath: this.keyPath,
      privateKeyPath: this.privateKeyPath,
      publicKeyPath: this.publicKeyPath,
      algorithm: 'RSA-2048',
      hashAlgorithm: 'SHA-384',
    };
  }
}

module.exports = new CryptoService();
