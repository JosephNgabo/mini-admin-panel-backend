const express = require('express');
const userController = require('../controllers/userController');
const logger = require('../utils/logger');

const router = express.Router();

// Log all user route requests
router.use((req, res, next) => {
  logger.info('User route accessed', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               role:
 *                 type: string
 *                 enum: [admin, user, moderator]
 *                 default: user
 *                 description: User role
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *                 description: User status
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, moderator]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/stats', userController.getUserStats);

/**
 * @swagger
 * /api/users/chart:
 *   get:
 *     summary: Get users created in the last N days for chart
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Users chart data retrieved successfully
 *       400:
 *         description: Invalid days parameter
 *       500:
 *         description: Internal server error
 */
router.get('/chart', userController.getUsersChart);

/**
 * @swagger
 * /api/users/export:
 *   get:
 *     summary: Export users in protobuf format
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users exported successfully
 *       500:
 *         description: Internal server error
 */
router.get('/export', userController.exportUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               role:
 *                 type: string
 *                 enum: [admin, user, moderator]
 *                 description: User role
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: User status
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', userController.deleteUser);

/**
 * @swagger
 * /api/users/crypto/public-key:
 *   get:
 *     summary: Get public key for signature verification
 *     tags: [Users]
 *     description: Returns the RSA public key for verifying digital signatures
 *     responses:
 *       200:
 *         description: Public key for signature verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicKey:
 *                       type: string
 *                       description: RSA public key in PEM format
 *                     algorithm:
 *                       type: string
 *                       example: RSA-2048
 *                     hashAlgorithm:
 *                       type: string
 *                       example: SHA-384
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/crypto/public-key', userController.getPublicKey);
router.post('/crypto/verify', userController.verifySignature);

module.exports = router;
