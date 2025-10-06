const express = require('express');
const router = express.Router();
const TransactionService = require('../services/TransactionService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         transactionId:
 *           type: string
 *           example: "TXN-20241005-001"
 *         cardId:
 *           type: string
 *           example: "CRD-0001"
 *         customerId:
 *           type: string
 *           example: "CUST-12345"
 *         transactionDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [APPROVED, DECLINED, PENDING, DISPUTED]
 *         transactionType:
 *           type: string
 *           enum: [PURCHASE, REFUND, ATM_WITHDRAWAL]
 *         merchant:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             category:
 *               type: string
 *             categoryCode:
 *               type: string
 *         amount:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *             currency:
 *               type: string
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *         fraudScore:
 *           type: number
 *         fraudRiskLevel:
 *           type: string
 *           enum: [MINIMAL, LOW, MEDIUM, HIGH]
 *         isDisputed:
 *           type: boolean
 *         canBeDisputed:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get transactions for customer
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: string
 *         description: Filter by card ID
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by merchant category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     offset:
 *                       type: number
 *                     hasMore:
 *                       type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAmount:
 *                       type: number
 *                     transactionCount:
 *                       type: number
 *                     averageAmount:
 *                       type: number
 */
router.get('/', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const filters = {
      cardId: req.query.cardId,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      category: req.query.category,
      status: req.query.status
    };

    const result = await TransactionService.getTransactionsByCustomer(customerId, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   get:
 *     summary: Get specific transaction details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "TXN-20241005-001"
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.get('/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { customerId } = req.user;
    
    const transaction = await TransactionService.getTransactionById(transactionId, customerId);
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/transactions/search:
 *   get:
 *     summary: Search transactions with advanced filters
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term (merchant name, amount, etc.)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Merchant category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Transaction status
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const searchFilters = {
      query: req.query.query,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
      category: req.query.category,
      status: req.query.status,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const result = await TransactionService.searchTransactions(customerId, searchFilters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
