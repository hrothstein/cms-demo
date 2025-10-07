const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { changePinInHBR, requestCardReplacementFromHBR, activateCardInHBR } = require('../services/mulesoft');

const router = express.Router();

// POST /api/v1/card-services/view-pin - View PIN (with re-authentication)
router.post('/view-pin', authenticateToken, validate(schemas.viewPin), async (req, res, next) => {
  try {
    const { cardId, password } = req.body;

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Re-authenticate user with password
    const userResult = await query(
      'SELECT password_hash FROM customers WHERE customer_id = $1',
      [req.user.customer_id]
    );

    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Get PIN (in real implementation, this would be decrypted)
    const pin = '4567'; // This should be decrypted from database
    const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'VIEW_PIN',
        'PIN viewed by customer',
        'CARD',
        cardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      data: {
        pin,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/card-services/change-pin - Change PIN
router.post('/change-pin', authenticateToken, validate(schemas.changePin), async (req, res, next) => {
  try {
    const { cardId, currentPin, newPin, confirmPin } = req.body;

    if (newPin !== confirmPin) {
      return res.status(400).json({
        success: false,
        message: 'New PIN and confirmation do not match'
      });
    }

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Verify current PIN (in real implementation, this would be decrypted and compared)
    const storedPin = '4567'; // This should be decrypted from database
    if (currentPin !== storedPin) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN is incorrect'
      });
    }

    // Validate new PIN
    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be 4-6 digits'
      });
    }

    // Check for sequential numbers
    const isSequential = /(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(newPin);
    if (isSequential) {
      return res.status(400).json({
        success: false,
        message: 'PIN cannot contain sequential numbers'
      });
    }

    // Update PIN in database (in real implementation, this would be encrypted)
    await query(
      'UPDATE cards SET cvv = $1, updated_at = CURRENT_TIMESTAMP WHERE card_id = $2',
      [newPin, cardId]
    );

    // Sync to HBR via MuleSoft
    await changePinInHBR(cardId, newPin);

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'CHANGE_PIN',
        'PIN changed by customer',
        'CARD',
        cardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: 'PIN changed successfully'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/card-services/request-replacement - Request card replacement
router.post('/request-replacement', authenticateToken, validate(schemas.requestReplacement), async (req, res, next) => {
  try {
    const { cardId, requestType, requestReason, deliveryAddress, expeditedShipping } = req.body;

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Generate request ID
    const requestId = `REQ${Date.now()}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (expeditedShipping ? 3 : 7));

    // Create service request
    await query(
      `INSERT INTO card_service_requests (
        request_id, customer_id, card_id, request_type, request_reason, request_status,
        delivery_address_line1, delivery_address_line2, delivery_city, delivery_state,
        delivery_postal_code, delivery_country, expedited_shipping, estimated_delivery_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        requestId,
        req.user.customer_id,
        cardId,
        requestType,
        requestReason,
        'PENDING',
        deliveryAddress.line1,
        deliveryAddress.line2,
        deliveryAddress.city,
        deliveryAddress.state,
        deliveryAddress.postalCode,
        deliveryAddress.country,
        expeditedShipping,
        estimatedDelivery
      ]
    );

    // Submit to HBR card production via MuleSoft
    await requestCardReplacementFromHBR({
      requestId,
      customerId: req.user.customer_id,
      cardId,
      requestType,
      deliveryAddress,
      expeditedShipping,
      estimatedDeliveryDate: estimatedDelivery.toISOString().split('T')[0]
    });

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'REQUEST_REPLACEMENT',
        `Card replacement requested: ${requestType}`,
        'CARD_SERVICE_REQUEST',
        requestId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Card replacement requested',
      data: {
        requestId,
        requestType,
        requestStatus: 'PENDING',
        estimatedDeliveryDate: estimatedDelivery.toISOString().split('T')[0],
        requestedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/card-services/activate - Activate new card
router.post('/activate', authenticateToken, validate(schemas.activateCard), async (req, res, next) => {
  try {
    const { cardNumber, cvv, newPin } = req.body;

    // Validate card number format
    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number format'
      });
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CVV format'
      });
    }

    // Validate PIN
    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be 4-6 digits'
      });
    }

    // Generate new card ID
    const newCardId = `CARD${Date.now()}`;
    const cardNumberLast4 = cardNumber.slice(-4);

    // Create new card record
    await query(
      `INSERT INTO cards (
        card_id, customer_id, card_number, card_number_last4, card_type, card_network,
        card_status, expiry_month, expiry_year, cvv, available_balance, is_locked, issued_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        newCardId,
        req.user.customer_id,
        cardNumber, // In real implementation, this would be encrypted
        cardNumberLast4,
        'DEBIT',
        'VISA',
        'ACTIVE',
        12,
        2026,
        newPin, // In real implementation, this would be encrypted
        0.00,
        false,
        new Date()
      ]
    );

    // Create default card controls
    await query(
      `INSERT INTO card_controls (card_id) VALUES ($1)`,
      [newCardId]
    );

    // Activate in HBR via MuleSoft
    await activateCardInHBR({
      cardId: newCardId,
      cardNumber,
      cvv,
      newPin
    });

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        newCardId,
        'ACTIVATE_CARD',
        'New card activated',
        'CARD',
        newCardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: 'Card activated successfully',
      data: {
        cardId: newCardId,
        cardStatus: 'ACTIVE',
        activatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
