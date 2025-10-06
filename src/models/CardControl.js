const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Card Control Model - Manages card control settings
 */
class CardControl {
  constructor(data) {
    this.controlId = data.controlId || `CC-${uuidv4().substring(0, 8).toUpperCase()}`;
    this.cardId = data.cardId;
    this.dailyLimit = data.dailyLimit || null;
    this.perTransactionLimit = data.perTransactionLimit || null;
    this.contactlessEnabled = data.contactlessEnabled !== undefined ? data.contactlessEnabled : true;
    this.internationalEnabled = data.internationalEnabled !== undefined ? data.internationalEnabled : false;
    this.onlineEnabled = data.onlineEnabled !== undefined ? data.onlineEnabled : true;
    this.atmEnabled = data.atmEnabled !== undefined ? data.atmEnabled : true;
    this.allowedCountries = data.allowedCountries || ['US']; // ISO country codes
    this.effectiveDate = data.effectiveDate || new Date().toISOString();
    this.expiryDate = data.expiryDate || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Check if controls are currently effective
  isEffective() {
    const now = moment();
    const effective = moment(this.effectiveDate);
    const expired = this.expiryDate ? moment(this.expiryDate) : null;
    
    return effective.isSameOrBefore(now) && (!expired || expired.isAfter(now));
  }

  // Validate transaction against controls
  validateTransaction(amount, country = 'US', transactionType = 'PURCHASE') {
    const errors = [];
    
    if (!this.isEffective()) {
      errors.push('Card controls are not currently effective');
      return { valid: false, errors };
    }

    // Check daily limit (would need to check against daily spending)
    if (this.dailyLimit && amount > this.dailyLimit) {
      errors.push(`Transaction amount exceeds daily limit of $${this.dailyLimit}`);
    }

    // Check per-transaction limit
    if (this.perTransactionLimit && amount > this.perTransactionLimit) {
      errors.push(`Transaction amount exceeds per-transaction limit of $${this.perTransactionLimit}`);
    }

    // Check international transactions
    if (country !== 'US' && !this.internationalEnabled) {
      errors.push('International transactions are disabled for this card');
    }

    // Check country restrictions
    if (!this.allowedCountries.includes(country)) {
      errors.push(`Transactions not allowed in country: ${country}`);
    }

    // Check transaction type restrictions
    if (transactionType === 'CONTACTLESS' && !this.contactlessEnabled) {
      errors.push('Contactless transactions are disabled for this card');
    }

    if (transactionType === 'ONLINE' && !this.onlineEnabled) {
      errors.push('Online transactions are disabled for this card');
    }

    if (transactionType === 'ATM' && !this.atmEnabled) {
      errors.push('ATM transactions are disabled for this card');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Update controls
  updateControls(updates) {
    const allowedFields = [
      'dailyLimit', 'perTransactionLimit', 'contactlessEnabled',
      'internationalEnabled', 'onlineEnabled', 'atmEnabled', 'allowedCountries'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        this[field] = updates[field];
      }
    });

    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Convert to API response format
  toApiResponse() {
    return {
      controlId: this.controlId,
      cardId: this.cardId,
      limits: {
        daily: this.dailyLimit ? {
          value: this.dailyLimit,
          currency: 'USD'
        } : null,
        perTransaction: this.perTransactionLimit ? {
          value: this.perTransactionLimit,
          currency: 'USD'
        } : null
      },
      features: {
        contactless: {
          enabled: this.contactlessEnabled
        },
        international: {
          enabled: this.internationalEnabled
        },
        online: {
          enabled: this.onlineEnabled
        },
        atm: {
          enabled: this.atmEnabled
        }
      },
      geographicRestrictions: {
        allowedCountries: this.allowedCountries
      },
      effectiveDate: this.effectiveDate,
      expiryDate: this.expiryDate,
      isEffective: this.isEffective()
    };
  }
}

module.exports = CardControl;
