require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedDatabase = async () => {
  try {
    // Initialize database schema
    await require('../models/schema').initializeDatabase();
    console.log('Database schema initialized');

    // Create test users
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    // Create librarian
    await db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['librarian@library.com', defaultPassword, 'librarian']
    );
    console.log('Created librarian user');

    // Create regular users
    await db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['user1@example.com', defaultPassword, 'user']
    );
    await db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['user2@example.com', defaultPassword, 'user']
    );
    console.log('Created regular users');

    // Insert sample books
    const books = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 5],
      ['To Kill a Mockingbird', 'Harper Lee', 3],
      ['1984', 'George Orwell', 4],
      ['Pride and Prejudice', 'Jane Austen', 2],
      ['The Hobbit', 'J.R.R. Tolkien', 3],
      ['Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 4],
      ['The Catcher in the Rye', 'J.D. Salinger', 2],
      ['Lord of the Flies', 'William Golding', 3],
      ['Animal Farm', 'George Orwell', 5],
      ['Brave New World', 'Aldous Huxley', 3]
    ];

    for (const [title, author, quantity] of books) {
      await db.run(
        'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)',
        [title, author, quantity]
      );
    }
    console.log('Inserted sample books');

    // Create some sample borrow requests
    const user1 = await db.get('SELECT id FROM users WHERE email = ?', ['user1@example.com']);
    const user2 = await db.get('SELECT id FROM users WHERE email = ?', ['user2@example.com']);

    // Create borrow requests for user1
    await db.run(
      'INSERT INTO borrow_requests (user_id, book_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [user1.id, 1, '2024-01-01', '2024-01-15']
    );

    await db.run(
      'INSERT INTO borrow_requests (user_id, book_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [user1.id, 3, '2024-01-10', '2024-01-25']
    );

    // Create borrow request for user2
    await db.run(
      'INSERT INTO borrow_requests (user_id, book_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [user2.id, 2, '2024-01-05', '2024-01-20']
    );

    console.log('Created sample borrow requests');

    // Add some borrow history
    await db.run(
      'INSERT INTO borrow_history (user_id, book_id) VALUES (?, ?)',
      [user1.id, 5]
    );
    await db.run(
      'UPDATE borrow_history SET returned_on = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ?',
      [user1.id, 5]
    );

    await db.run(
      'INSERT INTO borrow_history (user_id, book_id) VALUES (?, ?)',
      [user2.id, 6]
    );
    
    console.log('Added sample borrow history');
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
