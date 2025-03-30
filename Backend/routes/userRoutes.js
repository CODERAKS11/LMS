const dotenv = require("dotenv");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Book = require("../models/bookModel");
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

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: "1h" });

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

        res.status(200).json({
            message: "Book borrowed successfully",
            borrowedBook: { bookId: book._id, borrowDate, dueDate },
        });
    } catch (error) {
        console.error("Error in borrow endpoint:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// 📌 5️⃣ Return a Book (Protected)
router.post("/return/:userId/:bookId", authMiddleware, async (req, res) => {
    try {
        // const user = await User.findById(req.user.id);
        const { userId, bookId } = req.params; 
        const user = await User.findById(userId);
        const book = await Book.findById(bookId);
        console.log(user, book);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Find the borrowed book in user's records
        const borrowedBook = await user.borrowedBooks.find(b => 
            b.bookId.toString() === book._id.toString() && b.status === "borrowed"
        );
        // console.log(borrowedBook);
        // Find the corresponding borrowed record in the book's borrowers list
        const returnedBook =await book.borrowers.find(b => 
            b.userId.toString() === user._id.toString() && b.returnDate === null
        );
        // console.log(returnedBook);
        // console.log("borrowed book comp",b.bookId.toString() ,book._id.toString())
        // console.log("returned book comp",b.userId.toString(), user._id.toString())
        if (!borrowedBook || !returnedBook) {
            return res.status(400).json({ message: "Book not borrowed or already returned" });
        }

        // if (!returnedBook) {
        //     return res.status(400).json({ message: "Book already returned" });

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


module.exports = router;
