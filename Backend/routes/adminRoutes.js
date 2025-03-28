const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Book = require("../models/bookModel");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// ✅ 1️⃣ Admin: Add a New Book
router.post("/add-book", adminMiddleware, async (req, res) => {
    try {
        const { title, author, genre, callNumber, totalCopies } = req.body;

        if (!title || !author || !genre || !callNumber || !totalCopies) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingBook = await Book.findOne({ callNumber });
        if (existingBook) {
            return res.status(400).json({ message: "Book with this call number already exists" });
        }

        const newBook = new Book({
            title,
            author,
            genre,
            callNumber,
            totalCopies,
            availableCopies: totalCopies,
            searchCount: 0,
            borrowCount: 0,
            borrowers: [],
            reservedBy: []
        });

        await newBook.save();
        res.status(201).json({ message: "Book added successfully", book: newBook });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ 2️⃣ Admin: Update Book Details
router.put("/update-book/:bookId", adminMiddleware, async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const updates = req.body;

        const book = await Book.findByIdAndUpdate(bookId, updates, { new: true });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 3️⃣ Admin: Delete a Book
router.delete("/delete-book/:bookId", adminMiddleware, async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const book = await Book.findByIdAndDelete(bookId);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 4️⃣ Admin: List All Users
router.get("/users", adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 5️⃣ Admin: Delete a User
router.delete("/delete-user/:userId", adminMiddleware, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 6️⃣ Admin: Reset User's Password
router.put("/reset-password/:userId", adminMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 7️⃣ Admin: View Reservations
router.get("/reservations", adminMiddleware, async (req, res) => {
    try {
        const books = await Book.find({ reservedBy: { $exists: true, $not: { $size: 0 } } })
            .populate("reservedBy", "name email");

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 8️⃣ Admin: Override Book Renewal Limit
router.put("/override-renewal/:userId/:bookId", adminMiddleware, async (req, res) => {
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

        const borrowedBook = user.borrowedBooks?.find(b => b.bookId.toString() === book._id.toString());
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
router.get("/report/most-borrowed", adminMiddleware, async (req, res) => {
    try {
        const books = await Book.find().sort({ borrowCount: -1 }).limit(10);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 🔟 Admin: Get Most Searched Books Report
router.get("/report/most-searched", adminMiddleware, async (req, res) => {
    try {
        const books = await Book.find().sort({ searchCount: -1 }).limit(10);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 1️⃣1️⃣ Admin: Generate Fine Report
router.get("/report/fines", adminMiddleware, async (req, res) => {
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
                    bookTitle: b.bookId.title,
                    fine: b.fine
                }))
        }));

        res.status(200).json(fineReport);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// ✅ 1️⃣2️⃣ Admin: View Borrowed Books (All Users)
router.get("/borrowed-books", adminMiddleware, async (req, res) => {
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
                    borrowDate: b.borrowDate,
                    dueDate: b.dueDate
                }))
        }));

        res.status(200).json(borrowedBooks);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
