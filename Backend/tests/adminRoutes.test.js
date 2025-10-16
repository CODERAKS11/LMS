const request = require('supertest');

// Mock all dependencies
jest.mock('../models/userModel');
jest.mock('../models/bookModel');
jest.mock('../middlewares/adminMiddleware');

const User = require('../models/userModel');
const Book = require('../models/bookModel');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Create test app
const express = require('express');
const adminRoutes = require('../routes/adminRoutes');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

// Bypass admin middleware
adminMiddleware.mockImplementation((req, res, next) => next());

describe('Admin Routes Safe Tests (Mocks Only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    test('should return mock users list', async () => {
      const mockUsers = [
        {
          _id: 'user1',
          name: 'User One',
          email: 'user1@example.com',
          role: 'student'
        },
        {
          _id: 'user2',
          name: 'User Two',
          email: 'user2@example.com',
          role: 'faculty'
        }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      const response = await request(app)
        .get('/api/admin/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
    });
  });

  describe('POST /api/admin/add-book', () => {
    test('should add book with mock data', async () => {
      const mockBook = {
        _id: 'mockBookId',
        title: 'New Book',
        author: 'New Author',
        ISBN: '1234567890',
        totalCopies: 5,
        availableCopies: 5
      };

      Book.findOne.mockResolvedValue(null); // No existing book
      Book.prototype.save = jest.fn().mockResolvedValue(mockBook);

      const response = await request(app)
        .post('/api/admin/add-book')
        .send({
          title: 'New Book',
          author: 'New Author',
          genre: 'Fiction',
          ISBN: '1234567890',
          callNumber: 'NEW001',
          totalCopies: 5
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Book added successfully');
    });

    test('should reject duplicate ISBN', async () => {
      Book.findOne.mockResolvedValue({ ISBN: '1234567890' });

      const response = await request(app)
        .post('/api/admin/add-book')
        .send({
          title: 'Duplicate Book',
          author: 'Duplicate Author',
          genre: 'Fiction',
          ISBN: '1234567890',
          callNumber: 'DUP001',
          totalCopies: 3
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Book with this ISBN already exists');
    });
  });
});