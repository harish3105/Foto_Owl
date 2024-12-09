const express = require('express');
const Database = require('../models/db');
const { authenticate, isLibrarian } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * @swagger
 * /api/borrow-requests:
 *   post:
 *     summary: Submit a borrow request
 *     tags: [Borrow Requests]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookId, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Check if book exists and is available
    const book = await Database.getBookById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.quantity < 1) {
      return res.status(400).json({ message: 'Book not available' });
    }

    const requestId = await Database.createBorrowRequest(userId, bookId, startDate, endDate);
    res.status(201).json({ message: 'Borrow request created', requestId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

/**
 * @swagger
 * /api/borrow-requests:
 *   get:
 *     summary: Get all borrow requests (Librarian only)
 *     tags: [Borrow Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, isLibrarian, async (req, res) => {
  try {
    const requests = await Database.getBorrowRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

/**
 * @swagger
 * /api/borrow-requests/{id}/approve:
 *   put:
 *     summary: Approve a borrow request (Librarian only)
 *     tags: [Borrow Requests]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/approve', authenticate, isLibrarian, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    await Database.updateBorrowRequestStatus(requestId, 'approved');
    res.json({ message: 'Request approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
});

/**
 * @swagger
 * /api/borrow-requests/{id}/deny:
 *   put:
 *     summary: Deny a borrow request (Librarian only)
 *     tags: [Borrow Requests]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/deny', authenticate, isLibrarian, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    await Database.updateBorrowRequestStatus(requestId, 'denied');
    res.json({ message: 'Request denied' });
  } catch (error) {
    res.status(500).json({ message: 'Error denying request', error: error.message });
  }
});

/**
 * @swagger
 * /api/borrow-requests/{id}/return:
 *   put:
 *     summary: Return a borrowed book
 *     tags: [Borrow Requests]
 */
router.put('/:id/return', authenticate, async (req, res) => {
  try {
    const borrowHistoryId = parseInt(req.params.id);
    await Database.returnBook(borrowHistoryId);
    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
});

/**
 * @swagger
 * /api/borrow-requests/statistics:
 *   get:
 *     summary: Get borrow statistics
 *     tags: [Borrow Requests]
 */
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const userId = req.user.role === 'librarian' ? null : req.user.id;
    const statistics = await Database.getBorrowStatistics(userId);
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

/**
 * @swagger
 * /api/borrow-requests/export-history:
 *   get:
 *     summary: Export borrow history to CSV
 *     tags: [Borrow Requests]
 */
router.get('/export-history', authenticate, async (req, res) => {
  try {
    const userId = req.user.role === 'librarian' ? null : req.user.id;
    const history = await Database.getDetailedBorrowHistory(userId);

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../temp', `borrow_history_${Date.now()}.csv`),
      header: [
        { id: 'book_title', title: 'Book Title' },
        { id: 'book_author', title: 'Author' },
        { id: 'user_email', title: 'User' },
        { id: 'borrowed_on', title: 'Borrowed Date' },
        { id: 'returned_on', title: 'Returned Date' }
      ]
    });

    await csvWriter.writeRecords(history);

    res.download(csvWriter.path, 'borrow_history.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up the temporary file
      fs.unlink(csvWriter.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting history', error: error.message });
  }
});

module.exports = router;
