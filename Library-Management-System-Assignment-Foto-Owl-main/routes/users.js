const express = require('express');
const bcrypt = require('bcryptjs');
const Database = require('../models/db');
const { authenticate, isLibrarian } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Librarian only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, isLibrarian, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = await Database.createUser(email, hashedPassword, role);
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/history:
 *   get:
 *     summary: Get user's borrow history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/history', authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only view their own history, librarians can view any user's history
    if (req.user.role !== 'librarian' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const history = await Database.getUserBorrowHistory(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

module.exports = router;
