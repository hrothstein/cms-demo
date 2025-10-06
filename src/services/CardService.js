const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Card Service - Business logic for card operations
 * Handles database operations for cards and card controls
 */
class CardService {
  // Get all cards for a customer
  async getCardsByCustomer(customerId) {
    const queryText = `
      SELECT 
        c.card_id,
        c.customer_id,
        c.account_number,
        c.card_last_four,
        c.card_type,
        c.card_brand,
        c.card_status,
        c.card_sub_status,
        c.cardholder_name,
        c.issue_date,
        c.expiry_date,
        c.activation_date,
        c.credit_limit,
        c.available_credit,
        c.is_primary,
        c.card_format,
        c.created_at,
        c.updated_at,
        cc.daily_limit,
        cc.per_transaction_limit,
        cc.atm_daily_limit,
        cc.contactless_enabled,
        cc.online_enabled,
        cc.international_enabled,
        cc.atm_enabled,
        cc.allowed_countries,
        cc.alert_threshold
      FROM cards c
      LEFT JOIN card_controls cc ON c.card_id = cc.card_id
      WHERE c.customer_id = $1
      ORDER BY c.is_primary DESC, c.created_at ASC
    `;

    const result = await query(queryText, [customerId]);
    const cards = result.rows.map(row => this.formatCard(row));

    return {
      success: true,
      data: cards,
      count: cards.length
    };
  }

  // Get specific card by ID
  async getCardById(cardId, customerId) {
    const queryText = `
      SELECT 
        c.card_id,
        c.customer_id,
        c.account_number,
        c.card_last_four,
        c.card_type,
        c.card_brand,
        c.card_status,
        c.card_sub_status,
        c.cardholder_name,
        c.issue_date,
        c.expiry_date,
        c.activation_date,
        c.credit_limit,
        c.available_credit,
        c.is_primary,
        c.card_format,
        c.created_at,
        c.updated_at,
        cc.daily_limit,
        cc.per_transaction_limit,
        cc.atm_daily_limit,
        cc.contactless_enabled,
        cc.online_enabled,
        cc.international_enabled,
        cc.atm_enabled,
        cc.allowed_countries,
        cc.alert_threshold
      FROM cards c
      LEFT JOIN card_controls cc ON c.card_id = cc.card_id
      WHERE c.card_id = $1 AND c.customer_id = $2
    `;

    const result = await query(queryText, [cardId, customerId]);
    
    if (result.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    return {
      success: true,
      data: this.formatCard(result.rows[0])
    };
  }

  // Lock a card
  async lockCard(cardId, customerId, reason = 'CUSTOMER_REQUEST', notes = null) {
    // First verify card exists and belongs to customer
    const cardQuery = `
      SELECT card_id, card_status FROM cards 
      WHERE card_id = $1 AND customer_id = $2
    `;
    const cardResult = await query(cardQuery, [cardId, customerId]);
    
    if (cardResult.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    const card = cardResult.rows[0];
    
    if (card.card_status === 'LOCKED') {
      throw new Error('CARD_ALREADY_LOCKED');
    }

    if (card.card_status === 'CLOSED') {
      throw new Error('CARD_ALREADY_CLOSED');
    }

    // Update card status
    const updateQuery = `
      UPDATE cards 
      SET card_status = 'LOCKED', updated_at = $1
      WHERE card_id = $2
      RETURNING card_id, card_status
    `;

    const result = await query(updateQuery, [new Date().toISOString(), cardId]);
    
    return {
      success: true,
      message: 'Card locked successfully',
      data: {
        cardId: result.rows[0].card_id,
        previousStatus: card.card_status,
        newStatus: result.rows[0].card_status,
        timestamp: new Date().toISOString(),
        reason,
        notes
      }
    };
  }

  // Unlock a card
  async unlockCard(cardId, customerId, reason = 'CUSTOMER_REQUEST') {
    // First verify card exists and belongs to customer
    const cardQuery = `
      SELECT card_id, card_status FROM cards 
      WHERE card_id = $1 AND customer_id = $2
    `;
    const cardResult = await query(cardQuery, [cardId, customerId]);
    
    if (cardResult.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    const card = cardResult.rows[0];
    
    if (card.card_status !== 'LOCKED') {
      throw new Error('CARD_NOT_LOCKED');
    }

    // Update card status
    const updateQuery = `
      UPDATE cards 
      SET card_status = 'ACTIVE', updated_at = $1
      WHERE card_id = $2
      RETURNING card_id, card_status
    `;

    const result = await query(updateQuery, [new Date().toISOString(), cardId]);
    
    return {
      success: true,
      message: 'Card unlocked successfully',
      data: {
        cardId: result.rows[0].card_id,
        previousStatus: card.card_status,
        newStatus: result.rows[0].card_status,
        timestamp: new Date().toISOString(),
        reason
      }
    };
  }

  // Get card controls
  async getCardControls(cardId, customerId) {
    // First verify card exists and belongs to customer
    const cardQuery = `
      SELECT card_id FROM cards 
      WHERE card_id = $1 AND customer_id = $2
    `;
    const cardResult = await query(cardQuery, [cardId, customerId]);
    
    if (cardResult.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    const controlsQuery = `
      SELECT 
        control_id,
        card_id,
        daily_limit,
        per_transaction_limit,
        atm_daily_limit,
        contactless_enabled,
        online_enabled,
        international_enabled,
        atm_enabled,
        magnetic_stripe_enabled,
        allowed_countries,
        blocked_merchant_categories,
        alert_threshold,
        velocity_limit_enabled,
        max_transactions_per_hour,
        created_at,
        updated_at
      FROM card_controls
      WHERE card_id = $1
    `;

    const result = await query(controlsQuery, [cardId]);
    
    if (result.rows.length === 0) {
      throw new Error('CONTROLS_NOT_FOUND');
    }

    return {
      success: true,
      data: this.formatCardControls(result.rows[0])
    };
  }

  // Update card controls
  async updateCardControls(cardId, customerId, controlsData) {
    // First verify card exists and belongs to customer
    const cardQuery = `
      SELECT card_id FROM cards 
      WHERE card_id = $1 AND customer_id = $2
    `;
    const cardResult = await query(cardQuery, [cardId, customerId]);
    
    if (cardResult.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    const allowedFields = [
      'dailyLimit', 'perTransactionLimit', 'atmDailyLimit',
      'contactlessEnabled', 'onlineEnabled', 'internationalEnabled',
      'atmEnabled', 'magneticStripeEnabled', 'allowedCountries',
      'blockedMerchantCategories', 'alertThreshold', 'velocityLimitEnabled',
      'maxTransactionsPerHour'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const [field, value] of Object.entries(controlsData)) {
      if (allowedFields.includes(field) && value !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('VALIDATION_ERROR');
    }

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    paramCount++;
    values.push(cardId);

    const updateQuery = `
      UPDATE card_controls 
      SET ${updateFields.join(', ')}
      WHERE card_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('CONTROLS_NOT_FOUND');
    }

    return {
      success: true,
      message: 'Card controls updated successfully',
      data: {
        cardId: cardId,
        updatedFields: Object.keys(controlsData).filter(field => allowedFields.includes(field)),
        timestamp: new Date().toISOString(),
        controls: this.formatCardControls(result.rows[0])
      }
    };
  }

  // Request new card
  async requestNewCard(customerId, cardType, cardBrand = 'VISA') {
    const cardId = `CRD-${uuidv4().substring(0, 8).toUpperCase()}`;
    const accountNumber = `ACC-${Math.random().toString().slice(2, 11)}`;
    const cardNumber = this.generateCardNumber(cardBrand);
    const cardLastFour = cardNumber.slice(-4);
    const issueDate = moment().format('YYYY-MM-DD');
    const expiryDate = moment().add(3, 'years').format('YYYY-MM-DD');
    const creditLimit = cardType.toUpperCase() === 'CREDIT' ? 5000.00 : null;

    // Insert new card
    const cardQuery = `
      INSERT INTO cards (
        card_id, customer_id, account_number, card_number_encrypted, card_last_four,
        card_type, card_brand, card_status, cardholder_name, issue_date, expiry_date,
        credit_limit, available_credit, is_primary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING card_id
    `;

    const cardResult = await query(cardQuery, [
      cardId,
      customerId,
      accountNumber,
      cardNumber, // In real system, this would be encrypted
      cardLastFour,
      cardType.toUpperCase(),
      cardBrand.toUpperCase(),
      'PENDING',
      'CUSTOMER NAME', // In real system, get from customer data
      issueDate,
      expiryDate,
      creditLimit,
      creditLimit,
      false
    ]);

    // Create default controls
    const controlsQuery = `
      INSERT INTO card_controls (
        card_id, daily_limit, per_transaction_limit, contactless_enabled,
        online_enabled, international_enabled, atm_enabled, allowed_countries
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await query(controlsQuery, [
      cardId,
      cardType.toUpperCase() === 'CREDIT' ? 2000.00 : 1000.00,
      cardType.toUpperCase() === 'CREDIT' ? 1000.00 : 500.00,
      true,
      true,
      false,
      true,
      ['US']
    ]);

    return {
      success: true,
      message: 'Card request submitted successfully',
      data: {
        cardId: cardResult.rows[0].card_id,
        status: 'PENDING',
        estimatedDeliveryDate: moment().add(7, 'days').format('YYYY-MM-DD')
      }
    };
  }

  // Replace card
  async replaceCard(cardId, customerId, reason = 'LOST') {
    // First verify card exists and belongs to customer
    const cardQuery = `
      SELECT card_id, card_type, card_brand, credit_limit FROM cards 
      WHERE card_id = $1 AND customer_id = $2
    `;
    const cardResult = await query(cardQuery, [cardId, customerId]);
    
    if (cardResult.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    const originalCard = cardResult.rows[0];

    // Close original card
    await query(
      'UPDATE cards SET card_status = $1, updated_at = $2 WHERE card_id = $3',
      ['CLOSED', new Date().toISOString(), cardId]
    );

    // Create replacement card
    const newCardId = `CRD-${uuidv4().substring(0, 8).toUpperCase()}`;
    const accountNumber = `ACC-${Math.random().toString().slice(2, 11)}`;
    const cardNumber = this.generateCardNumber(originalCard.card_brand);
    const cardLastFour = cardNumber.slice(-4);
    const issueDate = moment().format('YYYY-MM-DD');
    const expiryDate = moment().add(3, 'years').format('YYYY-MM-DD');

    const newCardQuery = `
      INSERT INTO cards (
        card_id, customer_id, account_number, card_number_encrypted, card_last_four,
        card_type, card_brand, card_status, cardholder_name, issue_date, expiry_date,
        credit_limit, available_credit, is_primary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING card_id
    `;

    const newCardResult = await query(newCardQuery, [
      newCardId,
      customerId,
      accountNumber,
      cardNumber,
      cardLastFour,
      originalCard.card_type,
      originalCard.card_brand,
      'PENDING',
      'CUSTOMER NAME',
      issueDate,
      expiryDate,
      originalCard.credit_limit,
      originalCard.credit_limit,
      false
    ]);

    // Copy controls from original card
    const originalControlsQuery = `
      SELECT * FROM card_controls WHERE card_id = $1
    `;
    const originalControls = await query(originalControlsQuery, [cardId]);

    if (originalControls.rows.length > 0) {
      const controls = originalControls.rows[0];
      const newControlsQuery = `
        INSERT INTO card_controls (
          card_id, daily_limit, per_transaction_limit, atm_daily_limit,
          contactless_enabled, online_enabled, international_enabled, atm_enabled,
          magnetic_stripe_enabled, allowed_countries, blocked_merchant_categories,
          alert_threshold, velocity_limit_enabled, max_transactions_per_hour
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;

      await query(newControlsQuery, [
        newCardId,
        controls.daily_limit,
        controls.per_transaction_limit,
        controls.atm_daily_limit,
        controls.contactless_enabled,
        controls.online_enabled,
        controls.international_enabled,
        controls.atm_enabled,
        controls.magnetic_stripe_enabled,
        controls.allowed_countries,
        controls.blocked_merchant_categories,
        controls.alert_threshold,
        controls.velocity_limit_enabled,
        controls.max_transactions_per_hour
      ]);
    }

    return {
      success: true,
      message: 'Replacement card requested',
      data: {
        requestId: `REQ-${uuidv4().substring(0, 6).toUpperCase()}`,
        originalCardId: cardId,
        newCardId: newCardResult.rows[0].card_id,
        originalCardStatus: 'CLOSED',
        estimatedDeliveryDate: moment().add(7, 'days').format('YYYY-MM-DD')
      }
    };
  }

  // Generate demo card number based on brand
  generateCardNumber(brand) {
    const prefixes = {
      'VISA': '4',
      'MASTERCARD': '5',
      'AMEX': '3',
      'DISCOVER': '6'
    };
    
    const prefix = prefixes[brand.toUpperCase()] || '4';
    const randomDigits = Math.random().toString().slice(2, 16);
    return prefix + randomDigits;
  }

  // Format card data for API response
  formatCard(row) {
    const isExpired = moment(row.expiry_date).isBefore(moment(), 'day');
    const canTransact = row.card_status === 'ACTIVE' && !isExpired;

    return {
      cardId: row.card_id,
      customerId: row.customer_id,
      accountNumber: row.account_number,
      cardNumber: `****-****-****-${row.card_last_four}`,
      cardLastFour: row.card_last_four,
      cardType: row.card_type,
      cardBrand: row.card_brand,
      cardStatus: row.card_status,
      cardSubStatus: row.card_sub_status,
      cardholderName: row.cardholder_name,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date,
      activationDate: row.activation_date,
      creditLimit: row.credit_limit ? {
        value: parseFloat(row.credit_limit),
        currency: 'USD'
      } : null,
      availableCredit: row.available_credit ? {
        value: parseFloat(row.available_credit),
        currency: 'USD'
      } : null,
      isPrimary: row.is_primary,
      cardFormat: row.card_format,
      canTransact: canTransact,
      isExpired: isExpired,
      controls: row.daily_limit ? {
        dailyLimit: parseFloat(row.daily_limit),
        perTransactionLimit: parseFloat(row.per_transaction_limit),
        atmDailyLimit: parseFloat(row.atm_daily_limit),
        contactlessEnabled: row.contactless_enabled,
        onlineEnabled: row.online_enabled,
        internationalEnabled: row.international_enabled,
        atmEnabled: row.atm_enabled,
        allowedCountries: row.allowed_countries || ['US'],
        alertThreshold: row.alert_threshold ? parseFloat(row.alert_threshold) : null
      } : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Format card controls data for API response
  formatCardControls(row) {
    return {
      controlId: row.control_id,
      cardId: row.card_id,
      dailyLimit: row.daily_limit ? parseFloat(row.daily_limit) : null,
      perTransactionLimit: row.per_transaction_limit ? parseFloat(row.per_transaction_limit) : null,
      atmDailyLimit: row.atm_daily_limit ? parseFloat(row.atm_daily_limit) : null,
      contactlessEnabled: row.contactless_enabled,
      onlineEnabled: row.online_enabled,
      internationalEnabled: row.international_enabled,
      atmEnabled: row.atm_enabled,
      magneticStripeEnabled: row.magnetic_stripe_enabled,
      allowedCountries: row.allowed_countries || ['US'],
      blockedMerchantCategories: row.blocked_merchant_categories || [],
      alertThreshold: row.alert_threshold ? parseFloat(row.alert_threshold) : null,
      velocityLimitEnabled: row.velocity_limit_enabled,
      maxTransactionsPerHour: row.max_transactions_per_hour,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = new CardService();