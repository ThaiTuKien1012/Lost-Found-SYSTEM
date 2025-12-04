const express = require('express');
const lostItemController = require('../controllers/lostItemController');
const { authenticateToken, roleCheck } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/lost-items:
 *   post:
 *     summary: Báo mất vật dụng
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LostItem'
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, roleCheck('student'), lostItemController.createLostItem);

/**
 * @swagger
 * /api/lost-items:
 *   get:
 *     summary: Danh sách báo mất (Staff)
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
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
 *         description: List of lost items
 */
router.get('/', authenticateToken, roleCheck('staff'), lostItemController.listLostItems);

/**
 * @swagger
 * /api/lost-items/search:
 *   get:
 *     summary: Tìm kiếm báo mất (Public)
 *     tags: [Lost Items]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [PHONE, WALLET, BAG, LAPTOP, WATCH, BOOK, KEYS, OTHER]
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *           enum: [NVH, SHTP]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', lostItemController.searchLostItems);

/**
 * @swagger
 * /api/lost-items/my-reports:
 *   get:
 *     summary: Xem báo cáo của tôi
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: campus
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
 *         description: User's reports
 */
router.get('/my-reports', authenticateToken, roleCheck('student'), lostItemController.getMyReports);

/**
 * @swagger
 * /api/lost-items/{id}/verify:
 *   put:
 *     summary: Xác minh báo mất (Staff)
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report verified successfully
 *       404:
 *         description: Not found
 */
router.put('/:id/verify', authenticateToken, roleCheck('staff'), lostItemController.verifyLostItem);

/**
 * @swagger
 * /api/lost-items/{id}/reject:
 *   put:
 *     summary: Từ chối báo mất (Staff)
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report rejected successfully
 *       404:
 *         description: Not found
 */
router.put('/:id/reject', authenticateToken, roleCheck('staff'), lostItemController.rejectLostItem);

/**
 * @swagger
 * /api/lost-items/{id}:
 *   get:
 *     summary: Xem chi tiết báo mất
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lost item details
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticateToken, lostItemController.getLostItem);

/**
 * @swagger
 * /api/lost-items/{id}:
 *   put:
 *     summary: Cập nhật báo mất
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LostItem'
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', authenticateToken, roleCheck('student'), lostItemController.updateLostItem);

/**
 * @swagger
 * /api/lost-items/{id}:
 *   delete:
 *     summary: Xóa báo mất
 *     tags: [Lost Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/:id', authenticateToken, lostItemController.deleteLostItem);

module.exports = router;

