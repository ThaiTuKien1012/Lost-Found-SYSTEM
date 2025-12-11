const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticateToken, roleCheck } = require('../middleware/auth');

/**
 * @swagger
 * /api/matching:
 *   post:
 *     summary: Tạo match thủ công (Staff)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lostItemId
 *               - foundItemId
 *             properties:
 *               lostItemId:
 *                 type: string
 *                 example: LF-NVH-2025-001
 *               foundItemId:
 *                 type: string
 *                 example: FF-NVH-2025-005
 *               matchScore:
 *                 type: number
 *                 example: 85
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Match created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/', 
  authenticateToken, 
  roleCheck('staff'), 
  matchingController.createMatch
);

/**
 * @swagger
 * /api/matching:
 *   get:
 *     summary: Danh sách matches (Staff/Security)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, rejected, completed]
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
router.get('/', 
  authenticateToken, 
  roleCheck('staff', 'security'), 
  matchingController.listMatches
);

/**
 * @swagger
 * /api/matching/pending:
 *   get:
 *     summary: Danh sách pending matches (Student)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of pending matches for student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/pending', 
  authenticateToken, 
  roleCheck('student'), 
  matchingController.getPendingMatches
);

/**
 * @swagger
 * /api/matching/{matchId}/confirm:
 *   post:
 *     summary: Xác nhận match (Student)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Match not found
 *       400:
 *         description: Invalid match status
 */
router.post('/:matchId/confirm', 
  authenticateToken, 
  roleCheck('student'), 
  matchingController.confirmMatch
);

/**
 * @swagger
 * /api/matching/{matchId}/reject:
 *   post:
 *     summary: Từ chối match (Student)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Không phải đồ của tôi
 *     responses:
 *       200:
 *         description: Match rejected successfully
 *       404:
 *         description: Match not found
 *       400:
 *         description: Invalid match status
 */
router.post('/:matchId/reject', 
  authenticateToken, 
  roleCheck('student'), 
  matchingController.rejectMatch
);

/**
 * @swagger
 * /api/matching/confirmed:
 *   get:
 *     summary: Danh sách confirmed matches (Security)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of confirmed matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
router.get('/confirmed', 
  authenticateToken, 
  roleCheck('security'), 
  matchingController.getConfirmedMatches
);

/**
 * @swagger
 * /api/matching/{matchId}/resolve:
 *   put:
 *     summary: Hoàn tất match (Staff/Security)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *                 enum: [returned, not_returned]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Match resolved successfully
 *       404:
 *         description: Match not found
 *       400:
 *         description: Invalid match status
 */
router.put('/:matchId/resolve', 
  authenticateToken, 
  roleCheck('staff', 'security'), 
  matchingController.resolveMatch
);

module.exports = router;

