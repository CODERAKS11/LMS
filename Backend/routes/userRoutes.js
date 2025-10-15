const dotenv = require("dotenv");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Book = require("../models/bookModel");
const Notification = require("../models/notificationModel");
const authMiddleware = require("../middlewares/authMiddleware.js"); // Protect routes
const adminMiddleware = require("../middlewares/adminMiddleware.js"); // Protect admin routes
const router = express.Router();
const secretKey = process.env.JWT_SECRET; // Use .env secret
// 📌 1️⃣ Register a New User (Student or Faculty)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, studentId, facultyId, department, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            studentId: role === "student" ? studentId : undefined,
            facultyId: role === "staff" ? facultyId : undefined,
            department,
            phone
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// 📌 2️⃣ Login User (Generate JWT Token)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Hardcoded Admin
    if (email === "admin@cusat.ac.in" && password === "Admin123!") {
      const token = jwt.sign({ id: "admin", role: "admin" }, secretKey, { expiresIn: "1h" });
      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: { id: "admin", name: "Admin", role: "admin" }
      });
    }

    // 🔹 Hardcoded Amarjeet Kumar
    if (email === "amarjeet@cusat.ac.in" && password === "Amarjeet123") {
      const token = jwt.sign({ id: "amarjeet_id", role: "student" }, secretKey, { expiresIn: "1h" });
      return res.status(200).json({
        message: "User login successful",
        token,
        user: { id: "amarjeet_id", name: "Amarjeet Kumar", role: "student" }
      });
    }

    // 🔹 Fallback to database lookup for all other users
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});
// 📌 3️⃣ Get User Profile (Protected)
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Filter borrowedBooks to include only books with status "borrowed"
        user.borrowedBooks = user.borrowedBooks.filter(book => book.status === "borrowed");

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// 📌 4️⃣ Borrow a Book (Protected)
router.post("/borrow/:bookId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from auth middleware
        const user = await User.findById(userId);
        const book = await Book.findById(req.params.bookId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the user has already borrowed 3 books
        const borrowedBooks = user.borrowedBooks.filter(b => b.status === "borrowed").length;
        if (borrowedBooks >= 3) {
            return res.status(400).json({ message: "You cannot borrow more than 3 books at a time" });
        }

        // Check if the book is available
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: "No copies available" });
        }

        let LoanPeriod = book.loanPeriod; // Default loan period
        if (book.borrowCount > 5) {
            LoanPeriod = 7; // High demand
        } else if (book.borrowCount > 2) {
            LoanPeriod = 10; // Medium demand
        } else {
            LoanPeriod = 14; // Low demand
        }

        // Set borrow dates
        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        dueDate.setDate(borrowDate.getDate() + LoanPeriod); // Add loanPeriod days to borrow date

        // Set borrow dates


        // Add book to user's borrowedBooks
        user.borrowedBooks.push({
            bookId: book._id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookISBN: book.isbn,
            borrowDate,
            dueDate,
            status: "borrowed",
        });

        // Update book's availableCopies and borrowCount
        book.availableCopies -= 1;
        book.borrowCount += 1;

        // Add user to book's borrowers list
        book.borrowers.push({
            userId: user._id,
            borrowedDate: borrowDate,
            dueDate: dueDate,
            returnDate: null,
            loanPeriod: LoanPeriod,
        });

        // Save changes to the database
        await user.save();
        await book.save();

        await Notification.create({
            userId: user._id,
            message: `You have borrowed "${book.title}". Due date: ${dueDate.toLocaleDateString()}`,
            type: "borrow"
        });

        res.status(200).json({
            message: "Book borrowed successfully",
            borrowedBook: { bookId: book._id, borrowDate, dueDate },
        });
    } catch (error) {
        console.error("Error in borrow endpoint:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// 📌 Return a Book from User Profile (No authentication required)
router.post("/return/:userId/:bookId", async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const bookId = req.params.bookId;

        console.log(`Return request: User ${targetUserId}, Book ${bookId}`);

        // Find user with borrowed books
        const user = await User.findById(targetUserId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Find the book
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        console.log("User borrowed books:", user.borrowedBooks);
        console.log("Looking for bookId:", bookId);

        // Find borrowed book in user's record
        const borrowedBook = user.borrowedBooks.find(
            b => {
                const bookIdStr = b.bookId ? b.bookId.toString() : null;
                const targetBookId = bookId.toString();
                return bookIdStr === targetBookId && b.status === "borrowed";
            }
        );

        if (!borrowedBook) {
            console.log("No borrowed book found with matching criteria");
            return res.status(400).json({ 
                message: "Book not currently borrowed by this user"
            });
        }

        // Find corresponding entry in book's borrowers
        const bookBorrower = book.borrowers.find(
            b => {
                const userIdStr = b.userId ? b.userId.toString() : null;
                const targetUserIdStr = user._id.toString();
                return userIdStr === targetUserIdStr && !b.isReturned;
            }
        );

        const returnDate = new Date();

        // Update user's borrowed book record
        borrowedBook.status = "returned";
        borrowedBook.returnDate = returnDate;

        // Update book's borrower record if found
        if (bookBorrower) {
            bookBorrower.returnDate = returnDate;
            bookBorrower.isReturned = true;
        }

        // Calculate fine if overdue
        let fine = 0;
        if (returnDate > borrowedBook.dueDate) {
            const daysLate = Math.ceil((returnDate - borrowedBook.dueDate) / (1000 * 60 * 60 * 24));
            fine = daysLate * 5; // ₹5 per day fine
        }

        borrowedBook.fine = fine;
        if (bookBorrower) {
            bookBorrower.fine = fine;
        }

        // Update available copies
        book.availableCopies += 1;

        // Badge & milestone logic - FIXED: Use markModified to avoid validation errors
        user.totalBooksRead = (user.totalBooksRead || 0) + 1;
        let newBadges = [];

        // Initialize arrays if they don't exist
        if (!user.badges) {
            user.badges = [];
            user.markModified('badges');
        }
        if (!user.milestones) {
            user.milestones = [];
            user.markModified('milestones');
        }

        // Convert badges to plain strings to avoid ObjectId validation
        const currentBadges = user.badges.map(b => b.toString ? b.toString() : b);
        const currentMilestones = user.milestones.map(m => m.toString ? m.toString() : m);

        if (user.totalBooksRead === 1 && !currentBadges.includes("First Book")) {
            user.badges.push("First Book");
            newBadges.push("First Book");
            user.markModified('badges');
        }
        if (user.totalBooksRead === 10 && !currentBadges.includes("Bookworm")) {
            user.badges.push("Bookworm");
            user.milestones.push("10 Books Read");
            newBadges.push("Bookworm");
            user.markModified('badges');
            user.markModified('milestones');
        }
        if (user.totalBooksRead === 25 && !currentBadges.includes("Avid Reader")) {
            user.badges.push("Avid Reader");
            user.milestones.push("25 Books Read");
            newBadges.push("Avid Reader");
            user.markModified('badges');
            user.markModified('milestones');
        }

        // Save changes with validation disabled temporarily
        await user.save({ validateBeforeSave: false });
        await book.save();

        // Re-enable validation and save properly if needed
        // await user.save();

        // Send notifications
        await Notification.create({
            userId: user._id,
            message: `You have returned "${book.title}".${fine > 0 ? ` Fine: ₹${fine}` : ''}`,
            type: "return"
        });

        for (const badge of newBadges) {
            await Notification.create({
                userId: user._id,
                message: `Congratulations! You earned a new badge: "${badge}"`,
                type: "badge"
            });
        }

        res.status(200).json({ 
            message: "Book returned successfully", 
            fine, 
            badges: user.badges, 
            milestones: user.milestones,
            returnedBook: {
                title: book.title,
                returnDate: returnDate
            }
        });

    } catch (error) {
        console.error("Return Book Error:", error);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message
        });
    }
});


//To get details of borrowed books
router.post("/return", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const borrowedBook = user.borrowedBooks.filter(b => b.status === "borrowed");

        if (!borrowedBook) return res.status(400).json({ message: "Book not borrowed" });

        res.status(200).json(borrowedBook);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.get("/most-searched", async (req, res) => {
    try {
        const books = await Book.find().sort({ searchCount: -1 }).limit(10);
        //sort({ searchCount: -1 }) sorts the books in descending order 
        // based on the searchCount field. The limit(10) method limits the results to the top 10 books.
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.get("/most-borrowed", async (req, res) => {
    try {
        const books = await Book.find().sort({ borrowCount: -1 }).limit(10);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Renew a borrowed book
router.put("/renew/:bookId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const book = await Book.findById(req.params.bookId);

        if (!book) return res.status(404).json({ message: "Book not found" });
        
        const borrowedBook = user.borrowedBooks.find(b => b.bookId.toString() === book._id.toString() && b.status === "borrowed");
        if (!borrowedBook) return res.status(400).json({ message: "Book not borrowed" });

        if (borrowedBook.renewalCount >= 3) {
            return res.status(403).json({ message: "Maximum renewals reached. Visit the library to renew further." });
        }

        borrowedBook.renewalCount += 1;
        borrowedBook.dueDate = new Date(new Date(borrowedBook.dueDate).setDate(new Date(borrowedBook.dueDate).getDate() + 7));
        user.renewalHistory.push({ bookId: book._id, renewedDate: new Date(), newDueDate: borrowedBook.dueDate });

        await user.save();

        await Notification.create({
            userId: user._id,
            message: `You have renewed "${book.title}". New due date: ${borrowedBook.dueDate.toLocaleDateString()}`,
            type: "renew"
        });

        res.status(200).json({ message: "Book renewed successfully", borrowedBook });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Reserve a book
router.post("/reserve/:bookId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const book = await Book.findById(req.params.bookId);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Add reservation to the book
        book.reservations.push({
            userId: user._id,
            email: user.email,
            reservedDate: new Date(),
            status: "Pending"
        });

        // Add reservation to the user
        user.reservations.push({
            bookId: book._id,
            bookTitle: book.title,
            reservedDate: new Date(),
            status: "Pending"
        });

        await book.save();
        await user.save();

        await Notification.create({
            userId: user._id,
            message: `You have reserved "${book.title}". We will notify you when it is available.`,
            type: "reserve"
        });

        res.status(200).json({ message: "Book reserved successfully" });
    } catch (error) {
        console.error("Error reserving book:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Get renewal history
router.get("/renewal-history", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("renewalHistory.bookId", "title author");
        res.status(200).json(user.renewalHistory);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Get user's reservations
router.get("/reservations", authMiddleware, async (req, res) => {
    try {
        const books = await Book.find({ reservedBy: req.user.id }).select("title author");
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Librarian override renewal
router.put("/override-renewal/:userId/:bookId", adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const book = await Book.findById(req.params.bookId);

        if (!book) return res.status(404).json({ message: "Book not found" });
        if (!user) return res.status(404).json({ message: "User not found" });

        const borrowedBook = user.borrowedBooks.find(b => b.bookId.toString() === book._id.toString() && b.status === "borrowed");
        if (!borrowedBook) return res.status(400).json({ message: "Book not borrowed" });

        borrowedBook.renewalCount = 0;
        await user.save();

        res.status(200).json({ message: "Renewal count overridden successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Delete a user (Admin only)
router.delete("/delete/:userId", adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        await user.remove();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post("/review/:bookId", authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.params;
        const { reviewText, rating } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 0 and 5." });
        }

        // Find the book
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Add the review to the book's reviews array
        book.reviews.push({
            userId,
            reviewText,
            rating,
            date: new Date(),
        });

        // Save the book
        await book.save();

        res.status(200).json({ message: "Review submitted successfully." });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.get("/leaderboard", async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({ totalBooksRead: -1 })
            .limit(10)
            .select("name totalBooksRead badges");
        res.status(200).json(topUsers);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const filter = {};
    filter.userId = req.user.id;

    // Optional query parameter: ?unread=true
    if (req.query.unread === "true") {
      filter.read = false;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ✅ Mark a notification as read
router.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update read status
    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});



module.exports = router;
