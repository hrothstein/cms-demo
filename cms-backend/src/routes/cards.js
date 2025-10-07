const express = require('express');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { syncCardLockToHBR, syncCardControlsToHBR } = require('../services/mulesoft');

const router = express.Router();

// GET /api/v1/cards - Get all cards for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const cardsResult = await query(
      `SELECT 
        card_id,
        customer_id,
        account_id,
        card_number_last4,
        card_type,
        card_network,
        card_status,
        expiry_month,
        expiry_year,
        card_art_url,
        available_balance,
        credit_limit,
        available_credit,
        is_locked,
        issued_date,
        created_at
      FROM cards 
      WHERE customer_id = $1 
      ORDER BY created_at DESC`,
      [req.user.customer_id]
    );

    const cards = cardsResult.rows.map(card => ({
      cardId: card.card_id,
      customerId: card.customer_id,
      accountId: card.account_id,
      cardNumberLast4: card.card_number_last4,
      cardType: card.card_type,
      cardNetwork: card.card_network,
      cardStatus: card.card_status,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cardArtUrl: card.card_art_url,
      availableBalance: card.available_balance,
      creditLimit: card.credit_limit,
      availableCredit: card.available_credit,
      isLocked: card.is_locked,
      issuedDate: card.issued_date
    }));

    res.json({
      success: true,
      data: cards
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/cards/:cardId - Get specific card details
router.get('/:cardId', authenticateToken, async (req, res, next) => {
  try {
    const { cardId } = req.params;

    const cardResult = await query(
      `SELECT 
        c.card_id,
        c.customer_id,
        c.account_id,
        c.card_number_last4,
        c.card_type,
        c.card_network,
        c.card_status,
        c.expiry_month,
        c.expiry_year,
        c.card_art_url,
        c.available_balance,
        c.credit_limit,
        c.available_credit,
        c.is_locked,
        c.locked_at,
        c.locked_by,
        c.issued_date,
        c.created_at,
        cc.daily_limit,
        cc.per_transaction_limit,
        cc.atm_daily_limit,
        cc.online_daily_limit,
        cc.contactless_enabled,
        cc.online_enabled,
        cc.international_enabled,
        cc.atm_enabled,
        cc.magstripe_enabled,
        cc.domestic_only,
        cc.allowed_countries,
        cc.blocked_countries
      FROM cards c
      LEFT JOIN card_controls cc ON c.card_id = cc.card_id
      WHERE c.card_id = $1 AND c.customer_id = $2`,
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const card = cardResult.rows[0];

    const cardData = {
      cardId: card.card_id,
      customerId: card.customer_id,
      accountId: card.account_id,
      cardNumberLast4: card.card_number_last4,
      cardType: card.card_type,
      cardNetwork: card.card_network,
      cardStatus: card.card_status,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cardArtUrl: card.card_art_url,
      availableBalance: card.available_balance,
      creditLimit: card.credit_limit,
      availableCredit: card.available_credit,
      isLocked: card.is_locked,
      lockedAt: card.locked_at,
      lockedBy: card.locked_by,
      issuedDate: card.issued_date,
      controls: {
        dailyLimit: card.daily_limit,
        perTransactionLimit: card.per_transaction_limit,
        atmDailyLimit: card.atm_daily_limit,
        onlineDailyLimit: card.online_daily_limit,
        contactlessEnabled: card.contactless_enabled,
        onlineEnabled: card.online_enabled,
        internationalEnabled: card.international_enabled,
        atmEnabled: card.atm_enabled,
        magstripeEnabled: card.magstripe_enabled,
        domesticOnly: card.domestic_only,
        allowedCountries: card.allowed_countries || [],
        blockedCountries: card.blocked_countries || []
      }
    };

    res.json({
      success: true,
      data: cardData
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/cards/:cardId/lock - Lock a card
router.put('/:cardId/lock', authenticateToken, validate(schemas.cardLock), async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { reason } = req.body;

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id, card_status FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const card = cardResult.rows[0];

    if (card.card_status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Card is not active and cannot be locked'
      });
    }

    // Lock the card
    await query(
      'UPDATE cards SET is_locked = TRUE, locked_at = CURRENT_TIMESTAMP, locked_by = $1 WHERE card_id = $2',
      ['CUSTOMER', cardId]
    );

    // Sync to HBR via MuleSoft
    await syncCardLockToHBR(cardId, true);

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'LOCK_CARD',
        reason ? `Card locked: ${reason}` : 'Card locked by customer',
        'CARD',
        cardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: 'Card locked successfully',
      data: {
        cardId,
        isLocked: true,
        lockedAt: new Date().toISOString(),
        lockedBy: 'CUSTOMER'
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/cards/:cardId/unlock - Unlock a card
router.put('/:cardId/unlock', authenticateToken, async (req, res, next) => {
  try {
    const { cardId } = req.params;

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id, card_status FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const card = cardResult.rows[0];

    if (card.card_status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Card is not active and cannot be unlocked'
      });
    }

    // Unlock the card
    await query(
      'UPDATE cards SET is_locked = FALSE, locked_at = NULL, locked_by = NULL WHERE card_id = $1',
      [cardId]
    );

    // Sync to HBR via MuleSoft
    await syncCardLockToHBR(cardId, false);

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'UNLOCK_CARD',
        'Card unlocked by customer',
        'CARD',
        cardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: 'Card unlocked successfully',
      data: {
        cardId,
        isLocked: false,
        lockedAt: null,
        lockedBy: null
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/cards/:cardId/controls - Update card controls
router.put('/:cardId/controls', authenticateToken, validate(schemas.cardControls), async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const controls = req.body;

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

    // Update or insert card controls
    await query(
      `INSERT INTO card_controls (
        card_id, daily_limit, per_transaction_limit, atm_daily_limit, online_daily_limit,
        contactless_enabled, online_enabled, international_enabled, atm_enabled, magstripe_enabled,
        domestic_only, allowed_countries, blocked_countries
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (card_id) DO UPDATE SET
        daily_limit = EXCLUDED.daily_limit,
        per_transaction_limit = EXCLUDED.per_transaction_limit,
        atm_daily_limit = EXCLUDED.atm_daily_limit,
        online_daily_limit = EXCLUDED.online_daily_limit,
        contactless_enabled = EXCLUDED.contactless_enabled,
        online_enabled = EXCLUDED.online_enabled,
        international_enabled = EXCLUDED.international_enabled,
        atm_enabled = EXCLUDED.atm_enabled,
        magstripe_enabled = EXCLUDED.magstripe_enabled,
        domestic_only = EXCLUDED.domestic_only,
        allowed_countries = EXCLUDED.allowed_countries,
        blocked_countries = EXCLUDED.blocked_countries,
        updated_at = CURRENT_TIMESTAMP`,
      [
        cardId,
        controls.dailyLimit,
        controls.perTransactionLimit,
        controls.atmDailyLimit,
        controls.onlineDailyLimit,
        controls.contactlessEnabled,
        controls.onlineEnabled,
        controls.internationalEnabled,
        controls.atmEnabled,
        controls.magstripeEnabled,
        controls.domesticOnly,
        controls.allowedCountries,
        controls.blockedCountries
      ]
    );

    // Sync to HBR via MuleSoft
    await syncCardControlsToHBR(cardId, controls);

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'UPDATE_CONTROLS',
        'Card controls updated',
        'CARD',
        cardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: 'Card controls updated successfully',
      data: {
        cardId,
        controls
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/cards/:cardId/report-lost - Report card as lost/stolen
router.post('/:cardId/report-lost', authenticateToken, validate(schemas.reportLost), async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { reportType, lastSeenLocation, requestReplacement, deliveryAddress, expeditedShipping } = req.body;

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id, card_status FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const card = cardResult.rows[0];

    if (card.card_status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Card is not active and cannot be reported as lost'
      });
    }

    // Update card status to LOST or STOLEN
    await query(
      'UPDATE cards SET card_status = $1, is_locked = TRUE, locked_at = CURRENT_TIMESTAMP, locked_by = $2 WHERE card_id = $3',
      [reportType, 'CUSTOMER', cardId]
    );

    let replacementRequest = null;

    // Create replacement request if requested
    if (requestReplacement) {
      const requestId = `REQ${Date.now()}`;
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + (expeditedShipping ? 3 : 7));

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
          'REPLACE_LOST',
          `Card reported as ${reportType.toLowerCase()}`,
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

      replacementRequest = {
        requestId,
        status: 'PENDING',
        estimatedDeliveryDate: estimatedDelivery.toISOString().split('T')[0]
      };
    }

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        cardId,
        'REPORT_LOST',
        `Card reported as ${reportType.toLowerCase()}`,
        'CARD',
        cardId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: `Card reported as ${reportType.toLowerCase()} and locked. ${requestReplacement ? 'Replacement card requested.' : ''}`,
      data: {
        cardId,
        cardStatus: reportType,
        isLocked: true,
        replacementRequest
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
