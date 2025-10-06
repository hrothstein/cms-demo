const express = require('express');
const router = express.Router();
const FraudService = require('../services/FraudService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Dispute:
 *       type: object
 *       properties:
 *         disputeId:
 *           type: string
 *           example: "DSP-001"
 *         transactionId:
 *           type: string
 *           example: "TXN-20241005-007"
 *         cardId:
 *           type: string
 *           example: "CRD-0004"
 *         customerId:
 *           type: string
 *           example: "CUST-12346"
 *         disputeDate:
 *           type: string
 *           format: date
 *         disputeReason:
 *           type: string
 *           enum: [UNAUTHORIZED_TRANSACTION, MERCHANT_DISPUTE, BILLING_ERROR, FRAUD]
 *         disputeAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [SUBMITTED, UNDER_REVIEW, RESOLVED, DENIED]
 *         customerDescription:
 *           type: string
 *         caseNumber:
 *           type: string
 *         expectedResolutionDate:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/v1/fraud/disputes:
 *   get:
 *     summary: Get all disputes for customer
 *     tags: [Fraud]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes retrieved successfully
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
 *                     $ref: '#/components/schemas/Dispute'
 *                 count:
 *                   type: number
 */
router.get('/disputes', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const disputes = await FraudService.getDisputesByCustomer(customerId);
    res.json({
      success: true,
      data: disputes,
      count: disputes.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/fraud/disputes/{disputeId}:
 *   get:
 *     summary: Get specific dispute details
 *     tags: [Fraud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *         example: "DSP-001"
 *     responses:
 *       200:
 *         description: Dispute details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dispute'
 *       404:
 *         description: Dispute not found
 */
router.get('/disputes/:disputeId', async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { customerId } = req.user;
    
    const dispute = await FraudService.getDisputeById(disputeId, customerId);
    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/fraud/disputes:
 *   post:
 *     summary: File a new dispute
 *     tags: [Fraud]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - disputeReason
 *               - disputeAmount
 *               - customerDescription
 *             properties:
 *               transactionId:
 *                 type: string
 *                 example: "TXN-20241005-007"
 *               disputeReason:
 *                 type: string
 *                 enum: [UNAUTHORIZED_TRANSACTION, MERCHANT_DISPUTE, BILLING_ERROR, FRAUD]
 *               disputeAmount:
 *                 type: number
 *                 example: 845.00
 *               customerDescription:
 *                 type: string
 *                 example: "I did not make this transaction"
 *     responses:
 *       201:
 *         description: Dispute filed successfully
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
 *                   $ref: '#/components/schemas/Dispute'
 *       400:
 *         description: Validation error or transaction not eligible for dispute
 */
router.post('/disputes', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const disputeData = req.body;
    
    const result = await FraudService.fileDispute(customerId, disputeData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/fraud/report-fraud:
 *   post:
 *     summary: Report suspected fraud
 *     tags: [Fraud]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - description
 *             properties:
 *               cardId:
 *                 type: string
 *                 example: "CRD-0004"
 *               description:
 *                 type: string
 *                 example: "I noticed unauthorized transactions on my card"
 *               transactionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["TXN-20241005-007"]
 *     responses:
 *       200:
 *         description: Fraud report submitted successfully
 */
router.post('/report-fraud', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const fraudData = req.body;
    
    const result = await FraudService.reportFraud(customerId, fraudData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
