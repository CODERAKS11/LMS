const mongoose = require('mongoose');

const clubDiscussionSchema = new mongoose.Schema({
  club: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BookClub', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  },
  chapter: { 
    type: Number,
    min: 1
  },
  isSpoiler: { 
    type: Boolean, 
    default: false 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  parentMessage: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ClubDiscussion' 
  } // for replies
}, { 
  timestamps: true 
});

// Index for better query performance
clubDiscussionSchema.index({ club: 1, createdAt: -1 });
clubDiscussionSchema.index({ user: 1 });

module.exports = mongoose.model('ClubDiscussion', clubDiscussionSchema);