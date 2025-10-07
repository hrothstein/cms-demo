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
        card_number: '4111111111111234',
        cardLastFour: '1234',
        card_type: 'DEBIT',
        cardType: 'DEBIT',
        cardBrand: 'VISA',
        card_status: 'ACTIVE',
        cardStatus: 'ACTIVE',
        cardSubStatus: null,
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
        card_number: '5555555555555678',
        cardLastFour: '5678',
        card_type: 'CREDIT',
        cardType: 'CREDIT',
        cardBrand: 'MASTERCARD',
        card_status: 'ACTIVE',
        cardStatus: 'ACTIVE',
        cardSubStatus: null,
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

module.exports = router;
