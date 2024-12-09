# Library Management System

A comprehensive library management system built with Node.js, Express, SQLite, and EJS.

## Features

- User Authentication (JWT)
- Role-based Access Control (Librarian/User)
- Book Management
- Borrow Request System
- Borrow History
- Statistics and Reports
- RESTful API with Swagger Documentation

## Tech Stack

- Backend: Node.js with Express
- Database: SQLite
- Template Engine: EJS
- Authentication: JWT
- Documentation: Swagger/OpenAPI
- Frontend: Bootstrap 5

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd library-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
JWT_SECRET=your-secret-key
```

4. Initialize the database and seed data:
```bash
npm run seed
```

5. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

API documentation is available at `/api-docs` endpoint when the server is running.

## Default Users

1. Librarian:
   - Email: librarian@library.com
   - Password: password123

2. Regular User:
   - Email: user1@example.com
   - Password: password123

## Features

### For Librarians
- Manage books (add, update, delete)
- Approve/deny borrow requests
- View all borrow history
- Generate reports
- View system statistics

### For Users
- Browse and search books
- Submit borrow requests
- View personal borrow history
- View available books

## API Endpoints

### Authentication
- POST `/api/auth/login`

### Users
- POST `/api/users`
- GET `/api/users/:id/history`

### Books
- GET `/api/books`
- GET `/api/books/statistics`
- GET `/api/books?search=query`
- GET `/api/books?available=true`

### Borrow Requests
- POST `/api/borrow-requests`
- GET `/api/borrow-requests`
- PUT `/api/borrow-requests/:id/approve`
- PUT `/api/borrow-requests/:id/deny`
- PUT `/api/borrow-requests/:id/return`
- GET `/api/borrow-requests/statistics`
- GET `/api/borrow-requests/export-history`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
