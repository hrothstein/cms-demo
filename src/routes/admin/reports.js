const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', checkPermission('GENERATE_REPORTS'), async (req, res) => {
  try {
    // Get basic counts
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_customers,
        (SELECT COUNT(*) FROM cards) as total_cards,
        (SELECT COUNT(*) FROM cards WHERE card_status = 'ACTIVE') as active_cards,
        (SELECT COUNT(*) FROM cards WHERE card_status = 'LOCKED') as locked_cards,
        (SELECT COUNT(*) FROM transactions WHERE transaction_date >= CURRENT_DATE) as transactions_today,
        (SELECT COUNT(*) FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days') as transactions_this_week,
        (SELECT COUNT(*) FROM transactions WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days') as transactions_this_month,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transaction_date >= CURRENT_DATE) as transaction_volume_today,
        (SELECT COUNT(*) FROM disputes WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')) as open_disputes,
        (SELECT COUNT(*) FROM alerts WHERE status IN ('NEW', 'READ')) as unresolved_alerts,
        (SELECT COUNT(*) FROM alerts WHERE severity = 'CRITICAL' AND status IN ('NEW', 'READ')) as critical_alerts
    `;

    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        totalCustomers: parseInt(stats.total_customers || 0),
        totalCards: parseInt(stats.total_cards || 0),
        activeCards: parseInt(stats.active_cards || 0),
        lockedCards: parseInt(stats.locked_cards || 0),
        transactionsToday: parseInt(stats.transactions_today || 0),
        transactionsThisWeek: parseInt(stats.transactions_this_week || 0),
        transactionsThisMonth: parseInt(stats.transactions_this_month || 0),
        transactionVolumeToday: parseFloat(stats.transaction_volume_today || 0),
        openDisputes: parseInt(stats.open_disputes || 0),
        unresolvedAlerts: parseInt(stats.unresolved_alerts || 0),
        criticalAlerts: parseInt(stats.critical_alerts || 0)
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching dashboard statistics'
      }
    });
  }
});

// Generate custom report
router.post('/generate', checkPermission('GENERATE_REPORTS'), auditLogs.reportGenerate, async (req, res) => {
  try {
    const { 
      reportType = 'TRANSACTIONS',
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      groupBy = 'CATEGORY',
      filters = {}
    } = req.body;

    let reportData = {};
    let reportQuery = '';

    switch (reportType) {
      case 'TRANSACTIONS':
        reportData = await generateTransactionReport(startDate, endDate, groupBy, filters);
        break;
      case 'DISPUTES':
        reportData = await generateDisputeReport(startDate, endDate, groupBy, filters);
        break;
      case 'FRAUD':
        reportData = await generateFraudReport(startDate, endDate, groupBy, filters);
        break;
      case 'CARDS':
        reportData = await generateCardReport(startDate, endDate, groupBy, filters);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REPORT_TYPE',
            message: 'Invalid report type'
          }
        });
    }

    const reportId = `RPT-${Date.now()}`;

    res.json({
      success: true,
      data: {
        reportId,
        reportType,
        startDate,
        endDate,
        groupBy,
        generatedAt: new Date().toISOString(),
        generatedBy: req.admin.username,
        summary: reportData.summary,
        data: reportData.data
      }
    });
  } catch (error) {
    console.error('Admin report generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while generating the report'
      }
    });
  }
});

// Helper function to generate transaction report
async function generateTransactionReport(startDate, endDate, groupBy, filters) {
  let groupByClause = '';
  let selectFields = '';

  switch (groupBy) {
    case 'CATEGORY':
      groupByClause = 'GROUP BY t.merchant_category';
      selectFields = 't.merchant_category as group_name, COUNT(*) as count, SUM(t.amount) as total_amount, AVG(t.amount) as avg_amount';
      break;
    case 'STATUS':
      groupByClause = 'GROUP BY t.status';
      selectFields = 't.status as group_name, COUNT(*) as count, SUM(t.amount) as total_amount, AVG(t.amount) as avg_amount';
      break;
    case 'CARD_TYPE':
      groupByClause = 'GROUP BY c.card_type';
      selectFields = 'c.card_type as group_name, COUNT(*) as count, SUM(t.amount) as total_amount, AVG(t.amount) as avg_amount';
      break;
    default:
      groupByClause = '';
      selectFields = 'COUNT(*) as count, SUM(t.amount) as total_amount, AVG(t.amount) as avg_amount';
  }

  // Build filter conditions
  let filterConditions = [`t.transaction_date >= $1`, `t.transaction_date <= $2`];
  let queryParams = [startDate, endDate];
  let paramCount = 2;

  if (filters.minAmount) {
    paramCount++;
    filterConditions.push(`t.amount >= $${paramCount}`);
    queryParams.push(parseFloat(filters.minAmount));
  }

  if (filters.maxAmount) {
    paramCount++;
    filterConditions.push(`t.amount <= $${paramCount}`);
    queryParams.push(parseFloat(filters.maxAmount));
  }

  if (filters.status) {
    paramCount++;
    filterConditions.push(`t.status = $${paramCount}`);
    queryParams.push(filters.status);
  }

  const whereClause = `WHERE ${filterConditions.join(' AND ')}`;

  const query = `
    SELECT ${selectFields}
    FROM transactions t
    JOIN cards c ON t.card_id = c.card_id
    ${whereClause}
    ${groupByClause}
    ORDER BY ${groupBy === 'CATEGORY' ? 'total_amount' : 'count'} DESC
  `;

  const result = await query(query, queryParams);

  // Get summary
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_transactions,
      SUM(amount) as total_amount,
      AVG(amount) as average_amount,
      COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
      COUNT(CASE WHEN status = 'DECLINED' THEN 1 END) as declined_count,
      COUNT(CASE WHEN fraud_flag = true THEN 1 END) as fraud_count
    FROM transactions t
    JOIN cards c ON t.card_id = c.card_id
    ${whereClause}
  `;

  const summaryResult = await query(summaryQuery, queryParams);
  const summary = summaryResult.rows[0];

  return {
    data: result.rows,
    summary: {
      totalTransactions: parseInt(summary.total_transactions || 0),
      totalAmount: parseFloat(summary.total_amount || 0),
      averageAmount: parseFloat(summary.average_amount || 0),
      approvedCount: parseInt(summary.approved_count || 0),
      declinedCount: parseInt(summary.declined_count || 0),
      fraudCount: parseInt(summary.fraud_count || 0)
    }
  };
}

// Helper function to generate dispute report
async function generateDisputeReport(startDate, endDate, groupBy, filters) {
  let groupByClause = '';
  let selectFields = '';

  switch (groupBy) {
    case 'STATUS':
      groupByClause = 'GROUP BY d.status';
      selectFields = 'd.status as group_name, COUNT(*) as count, SUM(d.dispute_amount) as total_amount, AVG(d.dispute_amount) as avg_amount';
      break;
    case 'REASON':
      groupByClause = 'GROUP BY d.dispute_reason';
      selectFields = 'd.dispute_reason as group_name, COUNT(*) as count, SUM(d.dispute_amount) as total_amount, AVG(d.dispute_amount) as avg_amount';
      break;
    default:
      groupByClause = '';
      selectFields = 'COUNT(*) as count, SUM(d.dispute_amount) as total_amount, AVG(d.dispute_amount) as avg_amount';
  }

  const whereClause = `WHERE d.dispute_date >= $1 AND d.dispute_date <= $2`;

  const query = `
    SELECT ${selectFields}
    FROM disputes d
    ${whereClause}
    ${groupByClause}
    ORDER BY ${groupBy === 'STATUS' ? 'count' : 'total_amount'} DESC
  `;

  const result = await query(query, [startDate, endDate]);

  // Get summary
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_disputes,
      SUM(dispute_amount) as total_amount,
      AVG(dispute_amount) as average_amount,
      COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_count,
      COUNT(CASE WHEN status = 'DENIED' THEN 1 END) as denied_count,
      COUNT(CASE WHEN status IN ('SUBMITTED', 'UNDER_REVIEW') THEN 1 END) as open_count
    FROM disputes d
    ${whereClause}
  `;

  const summaryResult = await query(summaryQuery, [startDate, endDate]);
  const summary = summaryResult.rows[0];

  return {
    data: result.rows,
    summary: {
      totalDisputes: parseInt(summary.total_disputes || 0),
      totalAmount: parseFloat(summary.total_amount || 0),
      averageAmount: parseFloat(summary.average_amount || 0),
      resolvedCount: parseInt(summary.resolved_count || 0),
      deniedCount: parseInt(summary.denied_count || 0),
      openCount: parseInt(summary.open_count || 0)
    }
  };
}

// Helper function to generate fraud report
async function generateFraudReport(startDate, endDate, groupBy, filters) {
  const whereClause = `WHERE t.transaction_date >= $1 AND t.transaction_date <= $2 AND t.fraud_flag = true`;

  const query = `
    SELECT 
      t.merchant_category as group_name,
      COUNT(*) as count,
      SUM(t.amount) as total_amount,
      AVG(t.fraud_score) as avg_fraud_score,
      MAX(t.fraud_score) as max_fraud_score
    FROM transactions t
    ${whereClause}
    GROUP BY t.merchant_category
    ORDER BY total_amount DESC
  `;

  const result = await query(query, [startDate, endDate]);

  // Get summary
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_fraud_transactions,
      SUM(amount) as total_amount,
      AVG(fraud_score) as average_fraud_score,
      COUNT(DISTINCT customer_id) as affected_customers,
      COUNT(DISTINCT card_id) as affected_cards
    FROM transactions t
    ${whereClause}
  `;

  const summaryResult = await query(summaryQuery, [startDate, endDate]);
  const summary = summaryResult.rows[0];

  return {
    data: result.rows,
    summary: {
      totalFraudTransactions: parseInt(summary.total_fraud_transactions || 0),
      totalAmount: parseFloat(summary.total_amount || 0),
      averageFraudScore: parseFloat(summary.average_fraud_score || 0),
      affectedCustomers: parseInt(summary.affected_customers || 0),
      affectedCards: parseInt(summary.affected_cards || 0)
    }
  };
}

// Helper function to generate card report
async function generateCardReport(startDate, endDate, groupBy, filters) {
  let groupByClause = '';
  let selectFields = '';

  switch (groupBy) {
    case 'STATUS':
      groupByClause = 'GROUP BY c.card_status';
      selectFields = 'c.card_status as group_name, COUNT(*) as count';
      break;
    case 'TYPE':
      groupByClause = 'GROUP BY c.card_type';
      selectFields = 'c.card_type as group_name, COUNT(*) as count';
      break;
    case 'BRAND':
      groupByClause = 'GROUP BY c.card_brand';
      selectFields = 'c.card_brand as group_name, COUNT(*) as count';
      break;
    default:
      groupByClause = '';
      selectFields = 'COUNT(*) as count';
  }

  const whereClause = `WHERE c.created_at >= $1 AND c.created_at <= $2`;

  const query = `
    SELECT ${selectFields}
    FROM cards c
    ${whereClause}
    ${groupByClause}
    ORDER BY count DESC
  `;

  const result = await query(query, [startDate, endDate]);

  // Get summary
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_cards,
      COUNT(CASE WHEN card_status = 'ACTIVE' THEN 1 END) as active_cards,
      COUNT(CASE WHEN card_status = 'LOCKED' THEN 1 END) as locked_cards,
      COUNT(CASE WHEN card_status = 'CLOSED' THEN 1 END) as closed_cards
    FROM cards c
    ${whereClause}
  `;

  const summaryResult = await query(summaryQuery, [startDate, endDate]);
  const summary = summaryResult.rows[0];

  return {
    data: result.rows,
    summary: {
      totalCards: parseInt(summary.total_cards || 0),
      activeCards: parseInt(summary.active_cards || 0),
      lockedCards: parseInt(summary.locked_cards || 0),
      closedCards: parseInt(summary.closed_cards || 0)
    }
  };
}

module.exports = router;
