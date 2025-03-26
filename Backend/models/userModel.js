const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Full Name of the User
    email: { type: String, required: true, unique: true }, // Unique Email ID
    password: { type: String, required: true }, // Hashed Password
    role: { 
      type: String, 
      enum: ["student", "faculty", "admin"], 
      default: "student" 
    }, // User Role in the library

    // College Details
    studentId: { type: String, unique: true, sparse: true }, // Student ID (for students)
    facultyId: { type: String, unique: true, sparse: true }, // Faculty ID (for faculty)
    department: { type: String, required: true }, // IT, CSE, ECE, etc.
    phone: { type: String, required: true }, // Contact Number

    // Borrowing Details
    borrowedBooks: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        borrowedDate: { type: Date, default: Date.now },
        dueDate: { type: Date },
        returnDate: { type: Date, default: null },
        status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
        renewals: { type: Number, default: 0 },
        fine: { type: Number, default: 0 }, // Fine amount for late return
        // ✅ New: Renewal History inside borrowedBooks
        renewalHistory: [
          {
            renewedDate: { type: Date, default: Date.now },
            newDueDate: { type: Date }
          }
        ]
      }
    ],

    // Penalty & Dues
    penaltyAmount: { type: Number, default: 0 }, // Fine for late return
    isBlacklisted: { type: Boolean, default: false }, // If user is banned from borrowing
    
    reservations: [
      {
          bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
          reservedDate: { type: Date, default: Date.now },
          status: { type: String, enum: ["Pending", "Fulfilled", "Cancelled"], default: "Pending" } // 🔹 Status of reservation
      }
    ],

    // Account Management
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for faster search
userSchema.index({ email: 1, studentId: 1, facultyId: 1 });

module.exports = mongoose.model("User", userSchema);
