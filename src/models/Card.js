const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Card Model - Simulates card data structure
 * This would typically be stored in a database
 */
class Card {
  constructor(data) {
    this.cardId = data.cardId || `CRD-${uuidv4().substring(0, 8).toUpperCase()}`;
    this.customerId = data.customerId;
    this.cardNumber = data.cardNumber; // In real system, this would be encrypted
    this.cardLastFour = data.cardNumber ? data.cardNumber.slice(-4) : null;
    this.cardType = data.cardType || 'DEBIT'; // DEBIT, CREDIT, PREPAID
    this.cardBrand = data.cardBrand || 'VISA'; // VISA, MASTERCARD, AMEX, DISCOVER
    this.cardStatus = data.cardStatus || 'ACTIVE'; // ACTIVE, LOCKED, CLOSED, PENDING, EXPIRED
    this.expiryDate = data.expiryDate || moment().add(3, 'years').format('YYYY-MM-DD');
    this.creditLimit = data.creditLimit || null;
    this.cardArtUrl = data.cardArtUrl || null;
    this.issueDate = data.issueDate || moment().format('YYYY-MM-DD');
    this.lastTransactionAmount = data.lastTransactionAmount || null;
    this.lastTransactionDate = data.lastTransactionDate || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Mask card number for API responses
  getMaskedCardNumber() {
    if (!this.cardNumber) return null;
    return `****-****-****-${this.cardLastFour}`;
  }

  // Check if card is expired
  isExpired() {
    return moment(this.expiryDate).isBefore(moment(), 'day');
  }

  // Check if card can be used for transactions
  canTransact() {
    return this.cardStatus === 'ACTIVE' && !this.isExpired();
  }

  // Update card status
  updateStatus(newStatus, reason = null) {
    const previousStatus = this.cardStatus;
    this.cardStatus = newStatus;
    this.updatedAt = new Date().toISOString();
    
    return {
      cardId: this.cardId,
      previousStatus,
      newStatus,
      reason,
      timestamp: this.updatedAt
    };
  }

  // Convert to API response format
  toApiResponse() {
    return {
      cardId: this.cardId,
      customerId: this.customerId,
      cardNumber: this.getMaskedCardNumber(),
      cardLastFour: this.cardLastFour,
      cardType: this.cardType,
      cardBrand: this.cardBrand,
      cardStatus: this.cardStatus,
      expiryDate: this.expiryDate,
      creditLimit: this.creditLimit ? {
        value: this.creditLimit,
        currency: 'USD'
      } : null,
      cardArtUrl: this.cardArtUrl,
      issueDate: this.issueDate,
      lastTransactionAmount: this.lastTransactionAmount ? {
        value: this.lastTransactionAmount,
        currency: 'USD'
      } : null,
      lastTransactionDate: this.lastTransactionDate,
      canTransact: this.canTransact(),
      isExpired: this.isExpired()
    };
  }
}

module.exports = Card;
