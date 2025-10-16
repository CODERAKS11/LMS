const request = require('supertest');

// Mock all database dependencies
jest.mock('../models/userModel');
jest.mock('../models/bookModel');
jest.mock('../middlewares/authMiddleware');

const User = require('../models/userModel');
const Book = require('../models/bookModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Create test app
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Bypass authentication globally
authMiddleware.mockImplementation((req, res, next) => {
  req.user = { id: 'mockUserId', role: 'student' };
  next();
});

describe('User Routes Safe Tests (Mocks Only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------- REGISTER TESTS -----------
  describe('POST /api/users/register', () => {
    test('should register user with mock data', async () => {
      const mockUser = {
        _id: 'mockUserId123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        department: 'IT'
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.prototype.save = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'student',
          department: 'IT',
          phone: '1234567890'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    test('should reject duplicate email registration', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'student',
          department: 'IT',
          phone: '1234567890'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  // ----------- LOGIN TESTS -----------
  describe('POST /api/users/login', () => {
    test('should login user with mock data', async () => {
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'student'
      };

      User.findOne.mockResolvedValue(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      // Verify token and role in nested structure
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'student');
      expect(response.body).toHaveProperty('message', 'Login successful');
    });

    test('should reject invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  // ----------- CLEANUP -----------
  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});
