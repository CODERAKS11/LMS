const request = require('supertest');

// Mock the database models to avoid real database operations
jest.mock('../models/bookModel');
jest.mock('../models/userModel');
jest.mock('../middlewares/authMiddleware');
jest.mock('../middlewares/adminMiddleware');

const Book = require('../models/bookModel');
const User = require('../models/userModel');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Create a test app instance
const express = require('express');
const bookRoutes = require('../routes/bookRoutes');

const app = express();
app.use(express.json());
app.use('/api/books', bookRoutes);

// Mock the middleware to bypass authentication
authMiddleware.mockImplementation((req, res, next) => next());
adminMiddleware.mockImplementation((req, res, next) => next());

describe('Book Controller Safe Tests (Mocks Only)', () => {
  beforeEach(() => {
    // Clear all mock calls between tests
    jest.clearAllMocks();
  });

  describe('GET /api/books/search', () => {
    test('should return mock books for search', async () => {
      // Mock the Book.find method
      const mockBooks = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Mock Book 1',
          author: 'Mock Author 1',
          ISBN: '1234567890'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: 'Mock Book 2',
          author: 'Mock Author 2',
          ISBN: '0987654321'
        }
      ];

      Book.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockBooks)
      });

      Book.updateMany.mockResolvedValue({});

      const response = await request(app)
        .get('/api/books/search?title=Mock')
        .expect(200);

      expect(response.body).toEqual(mockBooks);
      expect(Book.find).toHaveBeenCalledWith({
        title: { $regex: 'Mock', $options: 'i' }
      });
    });

    test('should return 400 for missing search query', async () => {
      const response = await request(app)
        .get('/api/books/search')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Please provide a search query.');
    });
  });

  describe('GET /api/books/:bookId', () => {
    test('should return mock book details', async () => {
      const mockBook = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Mock Book',
        author: 'Mock Author',
        ISBN: '1234567890',
        availableCopies: 3
      };

      Book.findById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body).toEqual(mockBook);
      expect(Book.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    test('should return 404 for non-existent book', async () => {
      Book.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/books/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Book not found');
    });
  });

  describe('Error handling', () => {
    test('should handle server errors gracefully', async () => {
      Book.find.mockReturnValue({
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/api/books/search?title=test')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Server Error');
    });
  });
});