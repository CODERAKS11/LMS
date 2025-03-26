const Book = require("../models/Book");
const User = require("../models/User");

// Override Renewal Limit (Admin Only)
const overrideRenewal = async (req, res) => {
    try {
        const { userId, bookId } = req.params;

        // Find user and book
        const user = await User.findById(userId);
        const book = await Book.findById(bookId);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Find the borrowed book record in the user schema
        const borrowedBook = user.borrowedBooks.find(b => 
            b.bookId.toString() === bookId && b.status === "borrowed"
        );

        if (!borrowedBook) return res.status(400).json({ message: "Book not currently borrowed" });

        // Override the renewal limit by resetting renewals count
        borrowedBook.renewals = 0;
        borrowedBook.dueDate = new Date(new Date().setDate(new Date().getDate() + 14)); // Extend due date by 14 days

        await user.save();

        res.status(200).json({ message: "Renewal limit overridden successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

module.exports = { overrideRenewal };
