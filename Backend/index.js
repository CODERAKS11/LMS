//http://localhost:3001/api/books/search?title=pride
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors')
const router = express.Router();
const Book = require('./models/bookModel');
const User = require("./models/userModel");
const bookSearch = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require('./routes/adminRoutes.js');
dotenv.config({
    path: './.env'
});
app.use(cors())
app.use(express.json())

app.use('/api/admin', adminRoutes);
app.use("/api/books",bookSearch)

app.use("/api/users", userRoutes);
 
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from MongoDB
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});
app.get("/api/users/:id", async (req, res) => {
    try {
        const users = await User.find({ _id : req.params.id }); // Fetch all users from MongoDB
        res.status(200).json(users);
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

app.post('/books', async (req, res) => {
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});