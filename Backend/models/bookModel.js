const dotenv = require('dotenv');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
dotenv.config({
    path:'./.env'
})

const url=process.env.MONGODB_URI || "mongodb+srv://amarjeetakskumar:iax9SFA2jgzWRmKh@lms.9ki4i.mongodb.net/?retryWrites=true&w=majority&appName=LMS";
console.log("connecting to MongoDB",url);

mongoose.connect(url)
.then(result => {
    console.log('connected to MongoDB');
}).catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
    process.exit(1);
});

const bookSchema = new mongoose.Schema(
    {
    title: { type: String, required: false, index: true },
    author: { type: String, required: false, index: true },
    publicationYear: { type: Number, required: false },
    genre: { type: String, required: false, index: true },
    ISBN: { type: String, unique: true, required: false },
    callNumber: { type: String, unique: true, required: false },
    publisher: { type: String, required: false },
    pages: { type: Number, required: false },
    language: { type: String, default: "English" },
    
    // Availability Tracking
    totalCopies: { type: Number, required: false, default: 1 }, // Total copies owned by the library
    availableCopies: { type: Number, required: false, default: 1 }, // Copies currently available
    isAvailable: { type: Boolean, default: true }, // True if at least one copy is available

    // Borrowing Details
    borrowers: [
        {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
        borrowedDate: { type: Date },
        dueDate: { type: Date },
        returnDate: { type: Date, default: null, required: false },
        isReturned: { type: Boolean, default: false},
        renewals: { type: Number, default: 0 },
        fine: { type: Number, default: 0 },

        }
    ],
    searchCount: { type: Number, default: 0 }, // Count how many times the book was searched
    borrowCount: { type: Number, default: 0 },  // Count how many times the book was borrowed

    // Book Format & Category
    format: { type: String, enum: ["Hardcover", "Paperback", "Ebook", "Audiobook"], required: false },
    category: { type: String, required: false }, // Helps in filtering by category
    
    // Digital Copy URL (for eBooks, if applicable)
    digitalCopyURL: { type: String, default: null }, 

    // Cover Image & Description
    description: { type: String, required: false },
    coverImage: { type: String, required: false }, // URL to the book cover image
    summary: { type: String, required: false },

    // Reviews & Ratings
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: [
        {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User model
        reviewText: { type: String },
        rating: { type: Number, min: 0, max: 5 },
        date: { type: Date, default: Date.now }
        }
    ],

    reservations: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            reservedDate: { type: Date, default: Date.now },
            status: { type: String, enum: ["Pending", "Fulfilled", "Cancelled"], default: "Pending" }
        }
    ],

    // Extra Features
    // addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false }, 
    lastUpdated: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

//Indexing for better search performance
bookSchema.index({ title: 1, author: 1 });


const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
