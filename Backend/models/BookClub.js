const mongoose = require('mongoose');

const bookClubSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  genre: { 
    type: String,
    trim: true
  },
  currentBook: {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    bookTitle: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  meetingSchedule: {
    frequency: { 
      type: String, 
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    },
    nextMeeting: { type: Date }
  },
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    role: { 
      type: String, 
      enum: ['admin', 'moderator', 'member'], 
      default: 'member' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  maxMembers: { 
    type: Number, 
    default: 50,
    min: 2,
    max: 100
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

// Index for better query performance
bookClubSchema.index({ isPublic: 1, createdAt: -1 });
bookClubSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('BookClub', bookClubSchema);