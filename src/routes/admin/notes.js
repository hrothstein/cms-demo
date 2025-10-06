const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get notes for a specific reference
router.get('/:referenceType/:referenceId', checkPermission('ADD_NOTES'), async (req, res) => {
  try {
    const { referenceType, referenceId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Validate reference type
    const validTypes = ['CUSTOMER', 'CARD', 'TRANSACTION', 'DISPUTE', 'ALERT'];
    if (!validTypes.includes(referenceType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REFERENCE_TYPE',
          message: 'Invalid reference type'
        }
      });
    }

    const notesQuery = `
      SELECT 
        n.note_id,
        n.admin_id,
        au.username as admin_username,
        au.first_name as admin_first_name,
        au.last_name as admin_last_name,
        n.note_type,
        n.reference_id,
        n.note_text,
        n.is_internal,
        n.created_at,
        n.updated_at
      FROM admin_notes n
      JOIN admin_users au ON n.admin_id = au.admin_id
      WHERE n.note_type = $1 AND n.reference_id = $2
      ORDER BY n.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const notesResult = await query(notesQuery, [
      referenceType.toUpperCase(), 
      referenceId, 
      parseInt(limit), 
      parseInt(offset)
    ]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM admin_notes 
      WHERE note_type = $1 AND reference_id = $2
    `;
    
    const countResult = await query(countQuery, [referenceType.toUpperCase(), referenceId]);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: notesResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin notes list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching notes'
      }
    });
  }
});

// Add a new note
router.post('/', checkPermission('ADD_NOTES'), auditLogs.noteAdd, async (req, res) => {
  try {
    const { 
      noteType, 
      referenceId, 
      noteText, 
      isInternal = true 
    } = req.body;

    // Validate required fields
    if (!noteType || !referenceId || !noteText) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'noteType, referenceId, and noteText are required'
        }
      });
    }

    // Validate note type
    const validTypes = ['CUSTOMER', 'CARD', 'TRANSACTION', 'DISPUTE', 'ALERT'];
    if (!validTypes.includes(noteType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NOTE_TYPE',
          message: 'Invalid note type'
        }
      });
    }

    // Validate reference exists (basic check)
    let referenceExists = false;
    switch (noteType.toUpperCase()) {
      case 'CUSTOMER':
        const customerCheck = await query('SELECT customer_id FROM users WHERE customer_id = $1', [referenceId]);
        referenceExists = customerCheck.rows.length > 0;
        break;
      case 'CARD':
        const cardCheck = await query('SELECT card_id FROM cards WHERE card_id = $1', [referenceId]);
        referenceExists = cardCheck.rows.length > 0;
        break;
      case 'TRANSACTION':
        const transactionCheck = await query('SELECT transaction_id FROM transactions WHERE transaction_id = $1', [referenceId]);
        referenceExists = transactionCheck.rows.length > 0;
        break;
      case 'DISPUTE':
        const disputeCheck = await query('SELECT dispute_id FROM disputes WHERE dispute_id = $1', [referenceId]);
        referenceExists = disputeCheck.rows.length > 0;
        break;
      case 'ALERT':
        const alertCheck = await query('SELECT alert_id FROM alerts WHERE alert_id = $1', [referenceId]);
        referenceExists = alertCheck.rows.length > 0;
        break;
    }

    if (!referenceExists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REFERENCE_NOT_FOUND',
          message: 'Reference not found'
        }
      });
    }

    // Insert note
    const insertQuery = `
      INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING note_id, created_at
    `;

    const result = await query(insertQuery, [
      req.admin.adminId,
      noteType.toUpperCase(),
      referenceId,
      noteText,
      isInternal
    ]);

    const note = result.rows[0];

    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        noteId: note.note_id,
        noteType: noteType.toUpperCase(),
        referenceId,
        noteText,
        isInternal,
        createdBy: req.admin.username,
        createdAt: note.created_at
      }
    });
  } catch (error) {
    console.error('Admin note add error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while adding the note'
      }
    });
  }
});

// Update a note
router.put('/:noteId', checkPermission('ADD_NOTES'), async (req, res) => {
  try {
    const { noteId } = req.params;
    const { noteText, isInternal } = req.body;

    if (!noteText) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_NOTE_TEXT',
          message: 'noteText is required'
        }
      });
    }

    // Check if note exists and belongs to current admin or admin has permission
    const noteQuery = `
      SELECT note_id, admin_id, note_type, reference_id 
      FROM admin_notes 
      WHERE note_id = $1
    `;
    const noteResult = await query(noteQuery, [noteId]);

    if (noteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTE_NOT_FOUND',
          message: 'Note not found'
        }
      });
    }

    const note = noteResult.rows[0];

    // Check if admin can update this note (own note or admin role)
    if (note.admin_id !== req.admin.adminId && req.admin.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You can only update your own notes'
        }
      });
    }

    // Update note
    const updateQuery = `
      UPDATE admin_notes 
      SET note_text = $1, 
          is_internal = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE note_id = $3
    `;

    await query(updateQuery, [noteText, isInternal, noteId]);

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: {
        noteId,
        noteText,
        isInternal,
        updatedBy: req.admin.username,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin note update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating the note'
      }
    });
  }
});

// Delete a note
router.delete('/:noteId', checkPermission('ADD_NOTES'), async (req, res) => {
  try {
    const { noteId } = req.params;

    // Check if note exists and belongs to current admin or admin has permission
    const noteQuery = `
      SELECT note_id, admin_id 
      FROM admin_notes 
      WHERE note_id = $1
    `;
    const noteResult = await query(noteQuery, [noteId]);

    if (noteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTE_NOT_FOUND',
          message: 'Note not found'
        }
      });
    }

    const note = noteResult.rows[0];

    // Check if admin can delete this note (own note or admin role)
    if (note.admin_id !== req.admin.adminId && req.admin.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You can only delete your own notes'
        }
      });
    }

    // Delete note
    const deleteQuery = `DELETE FROM admin_notes WHERE note_id = $1`;
    await query(deleteQuery, [noteId]);

    res.json({
      success: true,
      message: 'Note deleted successfully',
      data: {
        noteId,
        deletedBy: req.admin.username,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin note delete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting the note'
      }
    });
  }
});

module.exports = router;
