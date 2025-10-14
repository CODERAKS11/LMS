const express = require('express');
const router = express.Router();

const ReadingChallenge = require('../models/ReadingChallenge');
const UserChallenge = require('../models/UserChallenge');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all active challenges
router.get('/', authMiddleware, async (req, res) => {
  try {
    const challenges = await ReadingChallenge.find({ isActive: true });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a challenge
router.post('/:challengeId/join', authMiddleware, async (req, res) => {
  try {
    const challenge = await ReadingChallenge.findById(req.params.challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const existing = await UserChallenge.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    const userChallenge = new UserChallenge({
      user: req.user.id,
      challenge: req.params.challengeId,
      progress: 0,
      completed: false
    });

    await userChallenge.save();
    
    // Populate the challenge details for response
    await userChallenge.populate('challenge');
    
    res.json({ message: 'Successfully joined challenge', userChallenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's challenges
router.get('/my-challenges', authMiddleware, async (req, res) => {
  try {
    const userChallenges = await UserChallenge.find({ user: req.user.id })
      .populate('challenge');
    res.json(userChallenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update challenge progress (call this when user borrows/returns books)
router.put('/:challengeId/progress', authMiddleware, async (req, res) => {
  try {
    const { progress, action } = req.body; // action: 'add' or 'set'
    
    const userChallenge = await UserChallenge.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    }).populate('challenge');

    if (!userChallenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Update progress based on action
    if (action === 'add') {
      userChallenge.progress += progress;
    } else if (action === 'set') {
      userChallenge.progress = progress;
    } else {
      userChallenge.progress += progress; // default to add
    }

    // Ensure progress doesn't go negative
    userChallenge.progress = Math.max(0, userChallenge.progress);

    // Check if completed
    const wasCompleted = userChallenge.completed;
    if (userChallenge.progress >= userChallenge.challenge.goal && !userChallenge.completed) {
      userChallenge.completed = true;
      userChallenge.completedAt = new Date();
      
      // Add badge reward to user (implement this based on your User model)
      if (userChallenge.challenge.badgeReward) {
        // await addBadgeToUser(req.user.id, userChallenge.challenge.badgeReward);
      }
      
      // Add points reward to user
      if (userChallenge.challenge.pointsReward > 0) {
        // await addPointsToUser(req.user.id, userChallenge.challenge.pointsReward);
      }
    } else if (userChallenge.progress < userChallenge.challenge.goal && userChallenge.completed) {
      // If progress drops below goal, mark as not completed
      userChallenge.completed = false;
      userChallenge.completedAt = null;
    }

    await userChallenge.save();
    res.json(userChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific user challenge
router.get('/:challengeId', authMiddleware, async (req, res) => {
  try {
    const userChallenge = await UserChallenge.findOne({
      user: req.user.id,
      challenge: req.params.challengeId
    }).populate('challenge');

    if (!userChallenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(userChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;