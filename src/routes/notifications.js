const express = require('express');
const router = express.Router();
const NotificationService = require('../services/NotificationService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         alertId:
 *           type: integer
 *           example: 125
 *         cardId:
 *           type: string
 *           example: "CRD-0001"
 *         alertType:
 *           type: string
 *           example: "FRAUD_ALERT"
 *         severity:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         alertDate:
 *           type: string
 *           format: date-time
 *         alertTitle:
 *           type: string
 *           example: "Unusual Transaction Detected"
 *         alertMessage:
 *           type: string
 *           example: "A transaction of $845.00 at Electronics Store was flagged as unusual"
 *         relatedTransactionId:
 *           type: string
 *           example: "TXN-20241005-007"
 *         status:
 *           type: string
 *           enum: [NEW, READ, ACKNOWLEDGED, RESOLVED]
 *         actionRequired:
 *           type: boolean
 *         readDate:
 *           type: string
 *           format: date-time
 *     
 *     NotificationPreferences:
 *       type: object
 *       properties:
 *         customerId:
 *           type: string
 *           example: "CUST-12345"
 *         emailEnabled:
 *           type: boolean
 *         emailAddress:
 *           type: string
 *           example: "john.doe@example.com"
 *         smsEnabled:
 *           type: boolean
 *         smsNumber:
 *           type: string
 *           example: "+1-212-555-0123"
 *         pushEnabled:
 *           type: boolean
 *         transactionAlerts:
 *           type: boolean
 *         largeTransactionThreshold:
 *           type: number
 *           example: 200.00
 *         fraudAlerts:
 *           type: boolean
 *         cardStatusAlerts:
 *           type: boolean
 *         paymentDueAlerts:
 *           type: boolean
 *         quietHoursStart:
 *           type: string
 *           example: "22:00"
 *         quietHoursEnd:
 *           type: string
 *           example: "08:00"
 */

/**
 * @swagger
 * /api/v1/notifications/alerts:
 *   get:
 *     summary: Get alerts for customer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, READ, RESOLVED]
 *         description: Filter by alert status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter by alert severity
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 *                 count:
 *                   type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: number
 *                     actionRequiredCount:
 *                       type: number
 */
router.get('/alerts', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const result = await NotificationService.getAlertsByCustomer(customerId, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/notifications/alerts/{alertId}/read:
 *   put:
 *     summary: Mark alert as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 125
 *     responses:
 *       200:
 *         description: Alert marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     alertId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     readDate:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Alert not found
 */
router.put('/alerts/:alertId/read', async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { customerId } = req.user;
    
    const result = await NotificationService.markAlertAsRead(alertId, customerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   get:
 *     summary: Get notification preferences for customer
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 */
router.get('/preferences', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const preferences = await NotificationService.getNotificationPreferences(customerId);
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailEnabled:
 *                 type: boolean
 *               emailAddress:
 *                 type: string
 *               smsEnabled:
 *                 type: boolean
 *               smsNumber:
 *                 type: string
 *               pushEnabled:
 *                 type: boolean
 *               transactionAlerts:
 *                 type: boolean
 *               largeTransactionThreshold:
 *                 type: number
 *               fraudAlerts:
 *                 type: boolean
 *               cardStatusAlerts:
 *                 type: boolean
 *               paymentDueAlerts:
 *                 type: boolean
 *               quietHoursStart:
 *                 type: string
 *                 example: "23:00"
 *               quietHoursEnd:
 *                 type: string
 *                 example: "07:00"
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedFields:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.put('/preferences', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const updates = req.body;
    
    const result = await NotificationService.updateNotificationPreferences(customerId, updates);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
