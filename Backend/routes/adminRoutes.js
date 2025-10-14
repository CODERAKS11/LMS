const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Book = require("../models/bookModel");
const adminMiddleware = require("../middlewares/adminMiddleware");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// ✅ 1️⃣ Admin: Add a New Book
router.post("/add-book",  async (req, res) => {
    try {
        const { title, author, genre, ISBN, callNumber, totalCopies } = req.body;

        if (!title || !author || !genre || !callNumber || !totalCopies) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingBook = await Book.findOne({ ISBN });
        if (existingBook) {
            return res.status(400).json({ message: "Book with this ISBN already exists" });
        }

        const newBook = new Book({
            title,
            author,
            genre,
            ISBN,
            callNumber,
            totalCopies,
            availableCopies: totalCopies,
        });

        await newBook.save();
        res.status(201).json({ message: "Book added successfully", book: newBook });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 2️⃣ Admin: Update Book Details
router.put("/update-book/:bookId",  async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const updates = req.body;

        const book = await Book.findByIdAndUpdate(bookId, updates, { new: true });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 3️⃣ Admin: Delete a Book
router.delete("/delete-book/:bookId", async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const book = await Book.findByIdAndDelete(bookId);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 4️⃣ Admin: List All Users
router.get("/users",  async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let user = await User.findById(userId)
      .populate("borrowedBooks.bookId")
      .populate("reservations.bookId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧹 Remove borrowedBooks where bookId is null
    user.borrowedBooks = user.borrowedBooks.filter(
      (book) => book.bookId !== null
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ✅ Admin: Update User Details
router.put("/update-user/:userId",  async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = req.body;

        // Prevent updating the role to "admin" if not already an admin
        if (updates.role === "admin") {
            return res.status(403).json({ message: "Cannot assign admin role" });
        }

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 5️⃣ Admin: Delete a User
router.delete("/delete-user/:userId",  async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 6️⃣ Admin: Reset User's Password
router.put("/reset-password/:userId", async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 7️⃣ Admin: View Reservations
router.get("/reservations",  async (req, res) => {
    try {
        const books = await Book.find({ reservedBy: { $exists: true, $not: { $size: 0 } } })
            .populate("reservedBy", "name email");

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 8️⃣ Admin: Override Book Renewal Limit
router.put("/override-renewal/:userId/:bookId", async (req, res) => {
    try {
        const { userId, bookId } = req.params;

        const user = await User.findById(userId);
        const book = await Book.findById(bookId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const borrowedBook = user.borrowedBooks.find(b => b.bookId.toString() === book._id.toString());
        if (!borrowedBook) {
            return res.status(400).json({ message: "Book not borrowed by this user" });
        }

        borrowedBook.renewals = 0; // Reset renewals
        await user.save();

        res.status(200).json({ message: "Renewal limit overridden successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 9️⃣ Admin: Get Most Borrowed Books Report
router.get("/report/most-borrowed",  async (req, res) => {
    try {
        const books = await Book.find().sort({ borrowCount: -1 }).limit(10);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 🔟 Admin: Get Most Searched Books Report
router.get("/report/most-searched",  async (req, res) => {
    try {
        const books = await Book.find().sort({ searchCount: -1 }).limit(10);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 1️⃣1️⃣ Admin: Generate Fine Report
router.get("/report/fines",  async (req, res) => {
    try {
        const usersWithFines = await User.find({
            "borrowedBooks.fine": { $gt: 0 }
        }).populate("borrowedBooks.bookId", "title author");

        const fineReport = usersWithFines.map(user => ({
            name: user.name,
            email: user.email,
            fines: user.borrowedBooks
                .filter(b => b.fine > 0)
                .map(b => ({
                    bookTitle: b.bookId?.title || "Unknown",
                    fine: b.fine
                }))
        }));

        res.status(200).json(fineReport);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 1️⃣2️⃣ Admin: View Borrowed Books (All Users)
router.get("/borrowed-books",  async (req, res) => {
    try {
        const users = await User.find({ "borrowedBooks.status": "borrowed" })
            .populate("borrowedBooks.bookId", "title author");

        const borrowedBooks = users.map(user => ({
            name: user.name,
            email: user.email,
            borrowedBooks: user.borrowedBooks
                ?.filter(b => b.status === "borrowed")
                .map(b => ({
                    bookTitle: b.bookId?.title || "Unknown",
                    borrowDate: b.borrowedDate,
                    dueDate: b.dueDate
                }))
        }));

        res.status(200).json(borrowedBooks);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 1️⃣ Admin: Add a New User
router.post("/add-user",  async (req, res) => {
    try {
        const { name, email, role, password, studentId, department, phone } = req.body;
        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            role,
            password: hashedPassword,
            studentId,
            department,
            phone,
        });
        await newUser.save();
        res.status(201).json({ message: "User added successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 13️⃣ Admin: Insights & Statistics Dashboard
router.get("/report/dashboard", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const borrowedBooks = await User.aggregate([
      { $unwind: "$borrowedBooks" },
      { $match: { "borrowedBooks.status": "borrowed" } },
      { $count: "count" }
    ]);
    const totalBorrowed = borrowedBooks[0]?.count || 0;

    const totalFine = await User.aggregate([
      { $unwind: "$borrowedBooks" },
      { $group: { _id: null, totalFine: { $sum: "$borrowedBooks.fine" } } }
    ]);
    const fineCollected = totalFine[0]?.totalFine || 0;

    // Most borrowed books
    const mostBorrowedBooks = await Book.find().sort({ borrowCount: -1 }).limit(5).select("title author borrowCount");

    // Top readers
    const topReaders = await User.aggregate([
      { $project: { name: 1, borrowedCount: { $size: "$borrowedBooks" } } },
      { $sort: { borrowedCount: -1 } },
      { $limit: 5 }
    ]);

    // Borrowing trend (last 6 months)
    const monthlyBorrowTrend = await User.aggregate([
      { $unwind: "$borrowedBooks" },
      {
        $group: {
          _id: { $month: "$borrowedBooks.borrowedDate" },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.status(200).json({
      totalBooks,
      totalUsers,
      totalBorrowed,
      fineCollected,
      mostBorrowedBooks,
      topReaders,
      monthlyBorrowTrend,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


module.exports = router;
