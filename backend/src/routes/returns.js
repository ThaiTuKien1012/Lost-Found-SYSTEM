const express = require('express');
const returnController = require('../controllers/returnController');
const { authenticateToken, roleCheck } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/returns:
 *   post:
 *     summary: Ghi nhận trả đồ
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foundItemId
 *               - studentId
 *               - campus
 *               - returnDetails
 *             properties:
 *               foundItemId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               campus:
 *                 type: string
 *               returnDetails:
 *                 type: object
 *                 properties:
 *                   returnedDate:
 *                     type: string
 *                     format: date-time
 *                   verificationMethod:
 *                     type: string
 *                     enum: [signature, id_check, otp]
 *                   condition:
 *                     type: string
 *     responses:
 *       201:
 *         description: Return recorded successfully
 */
router.post('/', authenticateToken, roleCheck('security'), returnController.createReturn);

/**
 * @swagger
 * /api/returns/my-transactions:
 *   get:
 *     summary: Lịch sử trả của tôi
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's return transactions
 */
router.get('/my-transactions', authenticateToken, roleCheck('student'), returnController.getMyTransactions);

/**
 * @swagger
 * /api/returns/{transactionId}:
 *   get:
 *     summary: Chi tiết trả
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return transaction details
 */
router.get('/:transactionId', authenticateToken, returnController.getReturnDetail);

/**
 * @swagger
 * /api/returns:
 *   get:
 *     summary: Danh sách trả (Staff)
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of return transactions
 */
router.get('/', authenticateToken, roleCheck('staff'), returnController.listReturns);

/**
 * @swagger
 * /api/returns/{transactionId}:
 *   put:
 *     summary: Cập nhật trả
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               condition:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return updated successfully
 */
router.put('/:transactionId', authenticateToken, roleCheck('security'), returnController.updateReturn);

module.exports = router;

