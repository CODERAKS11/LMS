const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Book = require("../models/bookModel");
const authMiddleware = require("../middlewares/authMiddleware.js"); // Protect routes
const adminMiddleware = require("../middlewares/adminMiddleware.js"); // Protect admin routes
const router = express.Router();

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

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, "secretKey", { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token, user: { id: user._id, name: user.name, role: user.role }});
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// 📌 3️⃣ Get User Profile (Protected)
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// 📌 4️⃣ Borrow a Book (Protected)
router.post("/borrow/:bookId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        const book = await Book.findById(req.params.bookId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!book) return res.status(404).json({ message: "Book not found" });
        const borrowedBooks = await Book.countDocuments({
            "borrowers.userId": userId,
            "borrowers.returnDate": null // Only count unreturned books
        });

        if (borrowedBooks >= 3) {
            return res.status(400).json({ message: "You cannot borrow more than 3 books at a time" });
        }
        if (book.availableCopies <= 0) return res.status(400).json({ message: "No copies available" });

        // Set Borrow Dates
        const borrowDate = new Date();
        const DueDate = new Date();
        DueDate.setDate(DueDate.getDate() + 14); // 14-day loan period

        user.borrowedBooks.push({ bookId: book._id, borrowDate, DueDate, status: "borrowed" });
        // Decrease available copies and increase borrow count
        book.availableCopies -= 1;
        book.borrowCount += 1;
        // Add borrower to book's borrowers list
        book.borrowers.push({
                userId: user._id, 
                borrowedDate: borrowDate,
                dueDate: DueDate,
                returnDate:  null,
                });
        await user.save();
        await book.save();

        res.status(200).json({ message: "Book borrowed successfully", borrowedBook: { bookId: book._id, borrowDate, DueDate } });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// 📌 5️⃣ Return a Book (Protected)
router.post("/return/:bookId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const book = await Book.findById(req.params.bookId);

        if (!book) return res.status(404).json({ message: "Book not found" });

        // Find the borrowed book in user's records
        const borrowedBook = user.borrowedBooks.find(b => 
            b.bookId.toString() === book._id.toString() && b.status === "borrowed"
        );

        // Find the corresponding borrowed record in the book's borrowers list
        const returnedBook = book.borrowers.find(b => 
            b.userId.toString() === user._id.toString() && b.returnDate === null
        );

        if (!borrowedBook || !returnedBook) {
            return res.status(400).json({ message: "Book not borrowed or already returned" });
        }

        // Set return date
        const returnDate = new Date();
        borrowedBook.status = "returned";
        borrowedBook.returnDate = returnDate;

        returnedBook.returnDate = returnDate;
        returnedBook.isReturned = true;

        // Calculate fine if the book is returned late
        const dueDate = borrowedBook.dueDate;
        let fine = 0;
        if (returnDate > dueDate) {
            const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
            fine = daysLate * 0.5; // ₹0.5 per day
        }

        // Update fine in user and book records
        borrowedBook.fine = fine;
        returnedBook.fine = fine;
        

        // Increase available copies of the book
        book.availableCopies += 1;

        await user.save();
        await book.save();

        res.status(200).json({ message: "Book returned successfully", fine });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
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
        res.status(200).json({ message: "Book renewed successfully", borrowedBook });
    } catch (error) {
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

module.exports = router;
