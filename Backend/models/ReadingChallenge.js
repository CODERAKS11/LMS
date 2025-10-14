const mongoose = require('mongoose');

const readingChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['books_count', 'pages_count', 'genre_based', 'time_bound'],
    required: true 
  },
  goal: { type: Number, required: true }, // 10 books, 1000 pages, etc.
  duration: { // for time-bound challenges
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  genre: { type: String }, // for genre-based challenges
  badgeReward: { type: String },
  pointsReward: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ReadingChallenge', readingChallengeSchema);