const express = require('express');
const Database = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with optional search and filter
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or author
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, available } = req.query;
    let books;

    if (search) {
      books = await Database.searchBooks(search);
    } else if (available !== undefined) {
      books = await Database.getBooksByAvailability(available === 'true');
    } else {
      books = await Database.getAllBooks();
    }

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

/**
 * @swagger
 * /api/books/statistics:
 *   get:
 *     summary: Get book statistics
 *     tags: [Books]
 */
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const statistics = await Database.getBookStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
