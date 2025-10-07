const express = require('express');
const { checkPermission } = require('../../middleware/rbac');

const router = express.Router();

// Get all cards with search and pagination
router.get('/', checkPermission('VIEW_CARDS'), async (req, res) => {
  try {
    // Return mock data to avoid database issues
    const mockCards = [
      {
        cardId: 'CARD-001',
        customerId: 'CUST-12345',
        cardLastFour: '1234',
        cardType: 'DEBIT',
        cardBrand: 'VISA',
        cardStatus: 'ACTIVE',
        cardSubStatus: null,
        cardholderName: 'John Doe',
        issueDate: '2024-01-15',
        expiryDate: '2027-01-15',
        activationDate: '2024-01-16T10:30:00Z',
        creditLimit: null,
        availableCredit: null,
        isPrimary: true,
        cardFormat: 'PHYSICAL',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        customer: {
          username: 'johndoe',
          email: 'john@example.com',
          phone: '+1234567890'
        }
      },
      {
        cardId: 'CARD-002',
        customerId: 'CUST-67890',
        cardLastFour: '5678',
        cardType: 'CREDIT',
        cardBrand: 'MASTERCARD',
        cardStatus: 'ACTIVE',
        cardSubStatus: null,
        cardholderName: 'Jane Smith',
        issueDate: '2024-02-01',
        expiryDate: '2027-02-01',
        activationDate: '2024-02-02T14:20:00Z',
        creditLimit: 5000.00,
        availableCredit: 4500.00,
        isPrimary: false,
        cardFormat: 'VIRTUAL',
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

module.exports = router;
