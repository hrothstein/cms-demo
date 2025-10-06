const express = require('express');
const router = express.Router();
const CustomerService = require('../services/CustomerService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         customerId:
 *           type: string
 *           example: "CUST-12345"
 *         username:
 *           type: string
 *           example: "john.doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           example: "+1-212-555-0123"
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/customers/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const customer = await CustomerService.getCustomerProfile(customerId);
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/customers/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer profile updated successfully
 */
router.put('/profile', async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const updates = req.body;
    
    const result = await CustomerService.updateCustomerProfile(customerId, updates);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
