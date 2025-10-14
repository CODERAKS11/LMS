const express = require('express');
const router = express.Router();
const BookClub = require('../models/BookClub');
const ClubDiscussion = require('../models/ClubDiscussion');
const auth = require('../middlewares/authMiddleware')
// Get all public book clubs
router.get('/',auth,  async (req, res) => {
  try {
    const clubs = await BookClub.find({ isPublic: true })
      .populate('members.user', 'name email')
      .populate('currentBook.bookId', 'title author');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new book club
router.post('/',auth, async (req, res) => {
  try {
    const { name, description, genre, isPublic, maxMembers } = req.body;
    
    const club = new BookClub({
      name,
      description,
      genre,
      isPublic: isPublic !== undefined ? isPublic : true,
      maxMembers: maxMembers || 50,
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    await club.save();
    
    // Populate the response
    await club.populate('members.user', 'name email');
    
    res.status(201).json({
      message: 'Book club created successfully',
      club: club
    });
  } catch (error) {
    console.error('Error creating book club:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create book club' 
    });
  }
});

// Join a book club
router.post('/:clubId/join',auth,  async (req, res) => {
  try {
    const club = await BookClub.findById(req.params.clubId);
    
    if (!club) {
      return res.status(404).json({ message: 'Book club not found' });
    }

    if (club.members.length >= club.maxMembers) {
      return res.status(400).json({ message: 'Book club is full' });
    }

    // Check if already a member
    const isMember = club.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this club' });
    }

    club.members.push({
      user: req.user.id,
      role: 'member'
    });

    await club.save();
    await club.populate('members.user', 'name email');
    
    res.json({ 
      message: 'Successfully joined book club',
      club: club 
    });
  } catch (error) {
    console.error('Error joining book club:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get club discussions
router.get('/:clubId/discussions',auth,  async (req, res) => {
  try {
    const discussions = await ClubDiscussion.find({ club: req.params.clubId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 messages
    
    res.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add discussion message
router.post('/:clubId/discussions', auth, async (req, res) => {
  console.log('ClubId param:', req.params.clubId);
  console.log('Request body:', req.body);
  console.log('User:', req.user);

  try {
    const { message, chapter, isSpoiler } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const discussion = new ClubDiscussion({
      club: req.params.clubId,
      user: req.user.id,
      message: message.trim(),
      chapter: chapter || null,
      isSpoiler: isSpoiler || false
    });

    await discussion.save();
    await discussion.populate('user', 'name');

    res.status(201).json({
      message: 'Message posted successfully',
      discussion
    });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(400).json({ message: error.message });
  }
});


// Get specific club details
router.get('/:clubId',auth,  async (req, res) => {
  try {
    const club = await BookClub.findById(req.params.clubId)
      .populate('members.user', 'name email')
      .populate('currentBook.bookId', 'title author coverImage');
    
    if (!club) {
      return res.status(404).json({ message: 'Book club not found' });
    }

    res.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;