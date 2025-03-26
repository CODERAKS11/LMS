const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/bookModel"); // Import your Book model

const authMiddleware = require("../middlewares/authMiddleware.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");

const User = require("../models/userModel.js");

const router = express.Router();

// Search books by title (partial match) and limit results
router.get("/search", async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ message: "Please provide a search query." });
        }

        // Perform case-insensitive partial search and limit results to 50
        const books = await Book.find({ title: { $regex: title, $options: "i" } })
            .limit(50); // Limits results to 50 books

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }
        await Book.updateMany(
            { title: { $regex: title, $options: "i" } },
            { $inc: { searchCount: 1 } }
        );

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Search for a book by call number
router.get("/search/:callNumber", async (req, res) => {
    try {
        const book = await Book.findOne({ callNumber: req.params.callNumber });

        if (!book) return res.status(404).json({ message: "Book not found" });

        // Increase search count for popularity tracking
        book.searchCount += 1;
        await book.save();

        res.status(200).json(book);
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
        if (!user) return res.status(404).json({ message: "User not found" });

        const borrowedBook = user.borrowedBooks.find(
            b => b.bookId.toString() === book._id.toString() && b.status === "borrowed"
        );

        if (!borrowedBook) return res.status(400).json({ message: "Book not borrowed" });

        if (borrowedBook.renewals >= 3) {
            return res.status(403).json({ message: "Maximum renewals reached. Visit the library to renew further." });
        }

        // 🔹 Check if dueDate exists, otherwise set it to today's date + 14 days
        if (!borrowedBook.dueDate) {
            borrowedBook.dueDate = new Date(); // Set to today's date
        }

        // 🔹 Extend due date by 7 days safely
        const newDueDate = new Date(borrowedBook.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);

        borrowedBook.dueDate = newDueDate; // Update due date
        borrowedBook.renewals += 1; // Increase renewal count

        // 🔹 Add renewal history entry
        borrowedBook.renewalHistory.push({
            renewedDate: new Date(),
            newDueDate: newDueDate
        });

        await user.save();

        res.status(200).json({ message: "Book renewed successfully", borrowedBook });
    } catch (error) {
        console.error("Renew Error:", error); // Log the error for debugging
        res.status(500).json({ message: "Server Error", error });
    }
});


// Reserve a book
router.post("/reserve/:bookId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const book = await Book.findById(req.params.bookId);

        if (!book) return res.status(404).json({ message: "Book not found" });

        if (book.availableCopies > 0) {
            return res.status(400).json({ message: "Book is available. No need to reserve." });
        }

        if (book.reservedBy.includes(user._id)) {
            return res.status(400).json({ message: "You have already reserved this book." });
        }

        book.reservedBy.push(user._id);
        await book.save();

        res.status(200).json({ message: "Book reserved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
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


module.exports = router;
