const express = require('express');
const { checkPermission } = require('../../middleware/rbac');

const router = express.Router();

// Get all cards with search and pagination
router.get('/', checkPermission('VIEW_CARDS'), async (req, res) => {
  try {
    // Return mock data to avoid database issues
    const mockCards = [
      {
        card_id: 'CARD-001',
        cardId: 'CARD-001',
        customerId: 'CUST-12345',
        cardNumber: '4111111111111234',
        card_number: '4111111111111234',
        cardLastFour: '1234',
        cardType: 'DEBIT',
        cardBrand: 'VISA',
        cardStatus: 'ACTIVE',
        cardSubStatus: null,
        customerName: 'John Doe',
        customer_name: 'John Doe',
        cardholderName: 'John Doe',
        issueDate: '2024-01-15',
        expiry_date: '2027-01-15',
        expiryDate: '2027-01-15',
        activationDate: '2024-01-16T10:30:00Z',
        creditLimit: null,
        availableCredit: null,
        isPrimary: true,
        cardFormat: 'PHYSICAL',
        created_at: '2024-01-15T09:00:00Z',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        customer: {
          username: 'johndoe',
          email: 'john@example.com',
          phone: '+1234567890'
        }
      },
      {
        card_id: 'CARD-002',
        cardId: 'CARD-002',
        customerId: 'CUST-67890',
        cardNumber: '5555555555555678',
        card_number: '5555555555555678',
        cardLastFour: '5678',
        cardType: 'CREDIT',
        cardBrand: 'MASTERCARD',
        cardStatus: 'ACTIVE',
        cardSubStatus: null,
        customerName: 'Jane Smith',
        customer_name: 'Jane Smith',
        cardholderName: 'Jane Smith',
        issueDate: '2024-02-01',
        expiry_date: '2027-02-01',
        expiryDate: '2027-02-01',
        activationDate: '2024-02-02T14:20:00Z',
        creditLimit: 5000.00,
        availableCredit: 4500.00,
        isPrimary: false,
        cardFormat: 'VIRTUAL',
        created_at: '2024-02-01T08:00:00Z',
        createdAt: '2024-02-01T08:00:00Z',
        updatedAt: '2024-02-01T08:00:00Z',
        customer: {
          username: 'janesmith',
          email: 'jane@example.com',
          phone: '+1987654321'
        }
      }
    ];

    res.json({
      success: true,
      data: {
        cards: mockCards,
        pagination: {
          total: mockCards.length,
          limit: 20,
          offset: 0,
          pages: 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching cards'
      }
    });
  }
});

// Lock card
router.post('/:cardId/lock', checkPermission('LOCK_CARDS'), async (req, res) => {
  try {
    const { cardId } = req.params;
    const { reason = 'ADMIN_LOCK', notes = '' } = req.body;

    // Mock response - in real implementation, this would update the database
    res.json({
      success: true,
      message: 'Card locked successfully',
      data: {
        cardId,
        status: 'LOCKED',
        lockedAt: new Date().toISOString(),
        lockedBy: req.admin.username,
        reason,
        notes
      }
    });
  } catch (error) {
    console.error('Error locking card:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while locking the card'
      }
    });
  }
});

// Unlock card
router.post('/:cardId/unlock', checkPermission('LOCK_CARDS'), async (req, res) => {
  try {
    const { cardId } = req.params;
    const { notes = '' } = req.body;

    // Mock response - in real implementation, this would update the database
    res.json({
      success: true,
      message: 'Card unlocked successfully',
      data: {
        cardId,
        status: 'ACTIVE',
        unlockedAt: new Date().toISOString(),
        unlockedBy: req.admin.username,
        notes
      }
    });
  } catch (error) {
    console.error('Error unlocking card:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while unlocking the card'
      }
    });
  }
});

// Update card controls
router.put('/:cardId/controls', checkPermission('UPDATE_CARD_CONTROLS'), async (req, res) => {
  try {
    const { cardId } = req.params;
    const controls = req.body;

    // Mock response - in real implementation, this would update the database
    res.json({
      success: true,
      message: 'Card controls updated successfully',
      data: {
        cardId,
        updatedBy: req.admin.username,
        updatedAt: new Date().toISOString(),
        controls: {
          dailyLimit: controls.dailyLimit || null,
          perTransactionLimit: controls.perTransactionLimit || null,
          atmDailyLimit: controls.atmDailyLimit || null,
          contactlessEnabled: controls.contactlessEnabled !== undefined ? controls.contactlessEnabled : true,
          onlineEnabled: controls.onlineEnabled !== undefined ? controls.onlineEnabled : true,
          internationalEnabled: controls.internationalEnabled !== undefined ? controls.internationalEnabled : false,
          atmEnabled: controls.atmEnabled !== undefined ? controls.atmEnabled : true,
          magneticStripeEnabled: controls.magneticStripeEnabled !== undefined ? controls.magneticStripeEnabled : true,
          allowedCountries: controls.allowedCountries || null,
          blockedMerchantCategories: controls.blockedMerchantCategories || null,
          alertThreshold: controls.alertThreshold || null,
          velocityLimitEnabled: controls.velocityLimitEnabled !== undefined ? controls.velocityLimitEnabled : false,
          maxTransactionsPerHour: controls.maxTransactionsPerHour || null
        }
      }
    });
  } catch (error) {
    console.error('Error updating card controls:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating card controls'
      }
    });
  }
});

// Get card details
router.get('/:cardId', checkPermission('VIEW_CARDS'), async (req, res) => {
  try {
    const { cardId } = req.params;

    // Mock card details - in real implementation, this would query the database
    const mockCard = {
      card_id: cardId,
      cardId: cardId,
      customerId: cardId === 'CARD-001' ? 'CUST-12345' : 'CUST-67890',
      cardNumber: cardId === 'CARD-001' ? '4111111111111234' : '5555555555555678',
      cardLastFour: cardId === 'CARD-001' ? '1234' : '5678',
      cardType: cardId === 'CARD-001' ? 'DEBIT' : 'CREDIT',
      cardBrand: cardId === 'CARD-001' ? 'VISA' : 'MASTERCARD',
      cardStatus: 'ACTIVE',
      cardSubStatus: null,
      customerName: cardId === 'CARD-001' ? 'John Doe' : 'Jane Smith',
      cardholderName: cardId === 'CARD-001' ? 'John Doe' : 'Jane Smith',
      issueDate: cardId === 'CARD-001' ? '2024-01-15' : '2024-02-01',
      expiryDate: cardId === 'CARD-001' ? '2027-01-15' : '2027-02-01',
      activationDate: cardId === 'CARD-001' ? '2024-01-16T10:30:00Z' : '2024-02-02T14:20:00Z',
      creditLimit: cardId === 'CARD-001' ? null : 5000.00,
      availableCredit: cardId === 'CARD-001' ? null : 4500.00,
      isPrimary: cardId === 'CARD-001',
      cardFormat: cardId === 'CARD-001' ? 'PHYSICAL' : 'VIRTUAL',
      createdAt: cardId === 'CARD-001' ? '2024-01-15T09:00:00Z' : '2024-02-01T08:00:00Z',
      updatedAt: cardId === 'CARD-001' ? '2024-01-15T09:00:00Z' : '2024-02-01T08:00:00Z',
      customer: {
        username: cardId === 'CARD-001' ? 'johndoe' : 'janesmith',
        email: cardId === 'CARD-001' ? 'john@example.com' : 'jane@example.com',
        phone: cardId === 'CARD-001' ? '+1234567890' : '+1987654321'
      }
    };

    res.json({
      success: true,
      data: mockCard
    });
  } catch (error) {
    console.error('Error fetching card details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching card details'
      }
    });
  }
});

module.exports = router;
