const db = require('../config/database');

class Database {
  // User related queries
  static async createUser(email, hashedPassword, role) {
    const result = await db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    return result.id;
  }

  static async getUserByEmail(email) {
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  // Book related queries
  static async getAllBooks() {
    return await db.all('SELECT * FROM books');
  }

  static async getBookById(id) {
    return await db.get('SELECT * FROM books WHERE id = ?', [id]);
  }

  static async updateBookQuantity(bookId, quantity) {
    await db.run('UPDATE books SET quantity = ? WHERE id = ?', [quantity, bookId]);
  }

  // Enhanced book-related queries
  static async searchBooks(query) {
    const searchTerm = `%${query}%`;
    return await db.all(
      'SELECT * FROM books WHERE title LIKE ? OR author LIKE ?',
      [searchTerm, searchTerm]
    );
  }

  static async getBooksByAvailability(available = true) {
    return await db.all(
      'SELECT * FROM books WHERE quantity > 0 = ?',
      [available]
    );
  }

  static async getBookStatistics() {
    const totalBooks = await db.get('SELECT COUNT(*) as count FROM books');
    const availableBooks = await db.get('SELECT COUNT(*) as count FROM books WHERE quantity > 0');
    const borrowedBooks = await db.get(
      'SELECT COUNT(*) as count FROM borrow_requests WHERE status = ?',
      ['approved']
    );

    return {
      total: totalBooks.count,
      available: availableBooks.count,
      borrowed: borrowedBooks.count
    };
  }

  // Borrow request related queries
  static async createBorrowRequest(userId, bookId, startDate, endDate) {
    const result = await db.run(
      'INSERT INTO borrow_requests (user_id, book_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [userId, bookId, startDate, endDate]
    );
    return result.id;
  }

  static async getBorrowRequestById(id) {
    return await db.get('SELECT * FROM borrow_requests WHERE id = ?', [id]);
  }

  static async updateBorrowRequestStatus(requestId, status) {
    await db.run(
      'UPDATE borrow_requests SET status = ? WHERE id = ?',
      [status, requestId]
    );
  }

  static async getBorrowRequests(status = null) {
    if (status) {
      return await db.all(
        `SELECT br.*, u.email as user_email, b.title as book_title 
         FROM borrow_requests br 
         JOIN users u ON br.user_id = u.id 
         JOIN books b ON br.book_id = b.id 
         WHERE br.status = ?`,
        [status]
      );
    }
    return await db.all(
      `SELECT br.*, u.email as user_email, b.title as book_title 
       FROM borrow_requests br 
       JOIN users u ON br.user_id = u.id 
       JOIN books b ON br.book_id = b.id`
    );
  }

  static async getUserBorrowHistory(userId) {
    return await db.all(
      `SELECT bh.*, b.title as book_title 
       FROM borrow_history bh 
       JOIN books b ON bh.book_id = b.id 
       WHERE bh.user_id = ?
       ORDER BY bh.borrowed_on DESC`,
      [userId]
    );
  }

  static async addToBorrowHistory(userId, bookId) {
    const result = await db.run(
      'INSERT INTO borrow_history (user_id, book_id) VALUES (?, ?)',
      [userId, bookId]
    );
    return result.id;
  }

  static async updateReturnDate(historyId) {
    await db.run(
      'UPDATE borrow_history SET returned_on = CURRENT_TIMESTAMP WHERE id = ?',
      [historyId]
    );
  }

  static async getBorrowStatistics() {
    const totalRequests = await db.get('SELECT COUNT(*) as count FROM borrow_requests');
    const activeLoans = await db.get(
      'SELECT COUNT(*) as count FROM borrow_requests WHERE status = ?',
      ['approved']
    );
    const returnedBooks = await db.get(
      'SELECT COUNT(*) as count FROM borrow_history WHERE returned_on IS NOT NULL'
    );

    return {
      totalRequests: totalRequests.count,
      activeLoans: activeLoans.count,
      returnedBooks: returnedBooks.count
    };
  }
}

module.exports = Database;
