const express = require('express');
const router = express.Router();
const CardService = require('../services/CardService');
const { validateCardControls, validateCardRequest } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       properties:
 *         cardId:
 *           type: string
 *           example: "CRD-0001"
 *         customerId:
 *           type: string
 *           example: "CUST-12345"
 *         cardNumber:
 *           type: string
 *           example: "****-****-****-9012"
 *         cardLastFour:
 *           type: string
 *           example: "9012"
 *         cardType:
 *           type: string
 *           enum: [DEBIT, CREDIT, PREPAID]
 *         cardBrand:
 *           type: string
 *           enum: [VISA, MASTERCARD, AMERICAN EXPRESS, DISCOVER]
 *         cardStatus:
 *           type: string
 *           enum: [ACTIVE, LOCKED, CLOSED, PENDING, EXPIRED]
 *         expiryDate:
 *           type: string
 *           format: date
 *           example: "2028-01-31"
 *         creditLimit:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *             currency:
 *               type: string
 *         canTransact:
 *           type: boolean
 *         isExpired:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/cards:
 *   get:
 *     summary: Get all cards for customer
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: number
 *                     pageSize:
 *                       type: number
 *                     customerId:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const result = await CardService.getCardsByCustomer(customerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/{cardId}:
 *   get:
 *     summary: Get specific card details
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CRD-0001"
 *     responses:
 *       200:
 *         description: Card details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:cardId', async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { customerId } = req.user;
    const card = await CardService.getCardById(cardId, customerId);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/{cardId}/lock:
 *   post:
 *     summary: Lock a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CRD-0001"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "CUSTOMER_REQUEST"
 *               notes:
 *                 type: string
 *                 example: "Traveling, want to secure card temporarily"
 *     responses:
 *       200:
 *         description: Card locked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cardId:
 *                   type: string
 *                 previousStatus:
 *                   type: string
 *                 newStatus:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       404:
 *         description: Card not found
 *       409:
 *         description: Card already locked
 */
router.post('/:cardId/lock', async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { customerId } = req.user;
    const { reason, notes } = req.body;
    
    const result = await CardService.lockCard(cardId, customerId, reason, notes);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/{cardId}/unlock:
 *   post:
 *     summary: Unlock a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CRD-0001"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "CUSTOMER_REQUEST"
 *     responses:
 *       200:
 *         description: Card unlocked successfully
 *       404:
 *         description: Card not found
 *       400:
 *         description: Card not locked
 */
router.post('/:cardId/unlock', async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { customerId } = req.user;
    const { reason } = req.body;
    
    const result = await CardService.unlockCard(cardId, customerId, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/{cardId}/controls:
 *   get:
 *     summary: Get card controls
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CRD-0001"
 *     responses:
 *       200:
 *         description: Card controls retrieved successfully
 *       404:
 *         description: Card not found
 */
router.get('/:cardId/controls', async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { customerId } = req.user;
    
    const controls = await CardService.getCardControls(cardId, customerId);
    res.json(controls);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/{cardId}/controls:
 *   put:
 *     summary: Update card controls
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CRD-0001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limits:
 *                 type: object
 *                 properties:
 *                   daily:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       currency:
 *                         type: string
 *                   perTransaction:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       currency:
 *                         type: string
 *               features:
 *                 type: object
 *                 properties:
 *                   international:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                   contactless:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *               allowedCountries:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Card controls updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Card not found
 */
router.put('/:cardId/controls', validateCardControls, async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { customerId } = req.user;
    const controlsData = req.body;
    
    const result = await CardService.updateCardControls(cardId, customerId, controlsData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/request:
 *   post:
 *     summary: Request new card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardType
 *             properties:
 *               cardType:
 *                 type: string
 *                 enum: [DEBIT, CREDIT, PREPAID]
 *               cardBrand:
 *                 type: string
 *                 enum: [VISA, MASTERCARD, AMERICAN EXPRESS, DISCOVER]
 *                 default: VISA
 *     responses:
 *       200:
 *         description: Card request submitted successfully
 *       400:
 *         description: Validation error
 */
router.post('/request', validateCardRequest, async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const { cardType, cardBrand } = req.body;
    
    const result = await CardService.requestNewCard(customerId, cardType, cardBrand);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/cards/{cardId}/replace:
 *   post:
 *     summary: Replace card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         example: "CRD-0001"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [LOST, STOLEN, DAMAGED, OTHER]
 *                 default: LOST
 *     responses:
 *       200:
 *         description: Card replacement requested successfully
 *       404:
 *         description: Card not found
 */
router.post('/:cardId/replace', async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { customerId } = req.user;
    const { reason } = req.body;
    
    const result = await CardService.replaceCard(cardId, customerId, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
