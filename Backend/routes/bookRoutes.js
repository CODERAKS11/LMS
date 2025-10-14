const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/bookModel"); // Import your Book model
const Notification = require("../models/notificationModel");
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

// Search books by author (partial match)
router.get("/search/author", async (req, res) => {
    try {
        const { author } = req.query;
        if (!author) {
            return res.status(400).json({ message: "Please provide an author query." });
        }
        const books = await Book.find({ author: { $regex: author, $options: "i" } }).limit(50);
        if (books.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }
        await Book.updateMany(
            { author: { $regex: author, $options: "i" } },
            { $inc: { searchCount: 1 } }
        );
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Search books by ISBN (partial and flexible match)
router.get("/search/isbn", async (req, res) => {
    try {
        let { isbn } = req.query;
        if (!isbn) {
            return res.status(400).json({ message: "Please provide an ISBN query." });
        }
        // Remove spaces and hyphens from query
        isbn = isbn.replace(/[\s-]/g, "");
        // Search with regex, ignoring spaces/hyphens
        const books = await Book.find({
            ISBN: { $regex: isbn, $options: "i" }
        }).limit(50);
        if (books.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }
        await Book.updateMany(
            { ISBN: { $regex: isbn, $options: "i" } },
            { $inc: { searchCount: 1 } }
        );
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Search books by call number (partial match)
router.get("/search/callnumber", async (req, res) => {
    try {
        const { callNumber } = req.query;
        if (!callNumber) {
            return res.status(400).json({ message: "Please provide a call number query." });
        }
        const books = await Book.find({ callNumber: { $regex: callNumber, $options: "i" } }).limit(50);
        if (books.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }
        await Book.updateMany(
            { callNumber: { $regex: callNumber, $options: "i" } },
            { $inc: { searchCount: 1 } }
        );
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});


// Get details of a book by bookId
router.get("/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        // Find the book by its ID
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json(book);
    } catch (error) {
        console.error("Error fetching book details:", error);
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
        await Notification.create({
            userId: user._id,
            message: `You have renewed "${book.title}". New due date: ${borrowedBook.dueDate.toLocaleDateString()}`,
            type: "renew"
        });

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
        await Notification.create({
            userId: user._id,
            message: `You have reserved "${book.title}". We will notify you when it is available.`,
            type: "reserve"
        });

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
