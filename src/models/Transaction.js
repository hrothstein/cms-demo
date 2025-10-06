const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Transaction Model - Represents card transactions
 */
class Transaction {
  constructor(data) {
    this.transactionId = data.transactionId || `TXN-${moment().format('YYYYMMDD')}-${uuidv4().substring(0, 6).toUpperCase()}`;
    this.cardId = data.cardId;
    this.customerId = data.customerId;
    this.transactionDate = data.transactionDate || new Date().toISOString();
    this.status = data.status || 'PENDING'; // PENDING, APPROVED, DECLINED, REVERSED
    this.transactionType = data.transactionType || 'PURCHASE'; // PURCHASE, WITHDRAWAL, REFUND, FEE
    this.merchant = data.merchant || {};
    this.amount = data.amount;
    this.currency = data.currency || 'USD';
    this.location = data.location || {};
    this.fraudScore = data.fraudScore || 0;
    this.isDisputed = data.isDisputed || false;
    this.disputeId = data.disputeId || null;
    this.description = data.description || null;
    this.category = data.category || 'OTHER';
    this.categoryCode = data.categoryCode || '0000';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Check if transaction is recent (within last 30 days)
  isRecent() {
    return moment(this.transactionDate).isAfter(moment().subtract(30, 'days'));
  }

  // Check if transaction can be disputed
  canBeDisputed() {
    const transactionDate = moment(this.transactionDate);
    const disputeWindow = moment().subtract(60, 'days'); // 60-day dispute window
    return transactionDate.isAfter(disputeWindow) && !this.isDisputed && this.status === 'APPROVED';
  }

  // Mark transaction as disputed
  markAsDisputed(disputeId) {
    this.isDisputed = true;
    this.disputeId = disputeId;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Update transaction status
  updateStatus(newStatus, reason = null) {
    const previousStatus = this.status;
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    
    return {
      transactionId: this.transactionId,
      previousStatus,
      newStatus,
      reason,
      timestamp: this.updatedAt
    };
  }

  // Calculate fraud risk level
  getFraudRiskLevel() {
    if (this.fraudScore >= 0.8) return 'HIGH';
    if (this.fraudScore >= 0.5) return 'MEDIUM';
    if (this.fraudScore >= 0.2) return 'LOW';
    return 'MINIMAL';
  }

  // Convert to API response format
  toApiResponse() {
    return {
      transactionId: this.transactionId,
      cardId: this.cardId,
      customerId: this.customerId,
      transactionDate: this.transactionDate,
      status: this.status,
      transactionType: this.transactionType,
      merchant: {
        name: this.merchant.name || 'Unknown Merchant',
        category: this.category,
        categoryCode: this.categoryCode,
        merchantId: this.merchant.merchantId || null
      },
      amount: {
        value: this.amount,
        currency: this.currency
      },
      location: {
        city: this.location.city || 'Unknown',
        state: this.location.state || null,
        country: this.location.country || 'US',
        latitude: this.location.latitude || null,
        longitude: this.location.longitude || null
      },
      fraudScore: this.fraudScore,
      fraudRiskLevel: this.getFraudRiskLevel(),
      isDisputed: this.isDisputed,
      disputeId: this.disputeId,
      canBeDisputed: this.canBeDisputed(),
      description: this.description,
      isRecent: this.isRecent()
    };
  }

  // Convert to summary format (for lists)
  toSummaryResponse() {
    return {
      transactionId: this.transactionId,
      transactionDate: this.transactionDate,
      status: this.status,
      merchant: this.merchant.name || 'Unknown Merchant',
      amount: {
        value: this.amount,
        currency: this.currency
      },
      category: this.category,
      fraudRiskLevel: this.getFraudRiskLevel(),
      isDisputed: this.isDisputed
    };
  }
}

module.exports = Transaction;
