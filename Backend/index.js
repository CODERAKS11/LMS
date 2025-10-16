// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import models and routes
const Book = require('./models/bookModel');
const User = require('./models/userModel');
const Notification = require('./models/notificationModel');
const bookSearch = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const readingChallengesRoutes = require('./routes/readingChallenges');
const bookClubsRoutes = require('./routes/bookClubs');

// ---------------------------
// ✅ API ROUTES
// ---------------------------
app.use('/api/admin', adminRoutes);
app.use('/api/books', bookSearch);
app.use('/api/reading-challenges', readingChallengesRoutes);
app.use('/api/book-clubs', bookClubsRoutes);
app.use('/api/users', userRoutes);

// ---------------------------
// ✅ Notifications Routes
// ---------------------------

// Get notifications for a user
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Add notification for borrow, return, renew
app.post("/api/notifications/user", async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    if (!userId || !message || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = new Notification({ userId, message, type });
    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Admin sends notification for new book arrivals
app.post("/api/notifications/new-book", async (req, res) => {
  try {
    const { bookTitle } = req.body;
    if (!bookTitle) return res.status(400).json({ message: "Missing book title" });

    const users = await User.find({});
    const notifications = users.map(user => ({
      userId: user._id,
      message: `New book "${bookTitle}" has arrived!`,
      type: "arrival"
    }));

    await Notification.insertMany(notifications);
    res.status(201).json({ message: "Notifications sent to all users." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ---------------------------
// ✅ User & Book APIs
// ---------------------------
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find({});
    console.log('Books retrieved successfully');
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/books-list', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const existingBook = await Book.findOne({ ISBN: newBook.ISBN });
    if (existingBook) {
      return res.status(400).json({ message: 'Book already exists' });
    }
    await newBook.save();
    console.log('Book added successfully');
    res.status(201).json(newBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ---------------------------
// ✅ Serve Frontend Build
// ---------------------------
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback route (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------------------------
// ✅ Server Start
// ---------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
