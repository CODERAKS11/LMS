import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    genre: '',
    isPublic: true,
    maxMembers: 50
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:3001/api/book-clubs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClubs(res.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load book clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (clubId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`http://localhost:3001/api/book-clubs/${clubId}/discussions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscussions(res.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    }
  };

  const joinClub = async (clubId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`http://localhost:3001/api/book-clubs/${clubId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Successfully joined the book club!');
      fetchClubs(); // Refresh the list
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error(error.response?.data?.message || 'Failed to join club');
    }
  };

  const createClub = async () => {
    if (!newClub.name.trim() || !newClub.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('http://localhost:3001/api/book-clubs', newClub, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(res.data.message || 'Book club created successfully!');
      setShowCreateForm(false);
      setNewClub({ name: '', description: '', genre: '', isPublic: true, maxMembers: 50 });
      fetchClubs();
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error(error.response?.data?.message || 'Failed to create book club');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `http://localhost:3001/api/book-clubs/${selectedClub._id}/discussions`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage('');
      fetchDiscussions(selectedClub._id);
      toast.success(res.data.message || 'Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const selectClub = async (club) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`http://localhost:3001/api/book-clubs/${club._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedClub(res.data);
      fetchDiscussions(club._id);
    } catch (error) {
      console.error('Error fetching club details:', error);
      toast.error('Failed to load club details');
    }
  };

  if (selectedClub) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 text-white py-4 px-6 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedClub(null)}
                  className="text-white hover:text-gray-200 mr-4 text-lg"
                >
                  ← Back
                </button>
                <div>
                  <h2 className="text-2xl font-bold">{selectedClub.name}</h2>
                  <p className="text-green-100">{selectedClub.description}</p>
                </div>
              </div>
              <span className="bg-green-700 px-3 py-1 rounded-full text-sm">
                {selectedClub.members?.length || 0} members
              </span>
            </div>

            {/* Current Book Info */}
            {selectedClub.currentBook && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-4">
                <h3 className="font-semibold text-yellow-800">📖 Currently Reading:</h3>
                <p className="text-yellow-700">{selectedClub.currentBook.bookTitle}</p>
                {selectedClub.currentBook.endDate && (
                  <p className="text-sm text-yellow-600">
                    Discussion ends: {new Date(selectedClub.currentBook.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="border-b border-gray-200 p-4">
              <h3 className="font-semibold mb-2">👥 Members</h3>
              <div className="flex flex-wrap gap-2">
                {selectedClub.members?.map((member, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      member.role === 'admin' 
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {member.user?.name}
                    {member.role === 'admin' && ' (Admin)'}
                  </span>
                ))}
              </div>
            </div>

            {/* Discussions */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">💬 Discussions</h3>
              
              <div className="mb-6 h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {discussions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No discussions yet. Start the conversation!
                  </div>
                ) : (
                  discussions.map((discussion) => (
                    <div key={discussion._id} className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-blue-600">{discussion.user?.name}</span>
                          {discussion.isSpoiler && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">
                              ⚠️ Spoiler
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(discussion.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{discussion.message}</p>
                      {discussion.chapter && (
                        <p className="text-xs text-gray-500 mt-1">
                          Chapter {discussion.chapter}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message... (Mark spoilers appropriately)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white py-4 px-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">📖 Book Clubs</h2>
              <p className="text-green-100">Join discussions and discover new books with fellow readers!</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create Club'}
            </button>
          </div>

          {/* Create Club Form */}
          {showCreateForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold mb-4">Create New Book Club</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sci-Fi Book Club"
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Science Fiction, Mystery"
                    value={newClub.genre}
                    onChange={(e) => setNewClub({ ...newClub, genre: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe your book club's focus and goals..."
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newClub.isPublic}
                    onChange={(e) => setNewClub({ ...newClub, isPublic: e.target.checked })}
                    className="rounded focus:ring-green-500"
                  />
                  <label className="text-sm text-gray-700">Public Club (Anyone can join)</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={newClub.maxMembers}
                    onChange={(e) => setNewClub({ ...newClub, maxMembers: parseInt(e.target.value) || 50 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={createClub}
                  disabled={!newClub.name.trim() || !newClub.description.trim()}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Create Club
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Clubs List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="text-gray-500 mt-2">Loading book clubs...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {clubs.map((club) => (
                    <div key={club._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{club.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{club.description}</p>
                      
                      {club.genre && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-4 inline-block">
                          {club.genre}
                        </span>
                      )}

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">
                          👥 {club.members?.length || 0} / {club.maxMembers} members
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          club.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {club.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>

                      {club.currentBook && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-semibold text-gray-700">Current Book:</p>
                          <p className="text-sm text-gray-600">{club.currentBook.bookTitle}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => selectClub(club)}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          View Club
                        </button>
                        <button
                          onClick={() => joinClub(club._id)}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {clubs.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No book clubs available yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Be the first to create a book club!</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Create the First Club
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookClubs;