import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReadingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChallenges();
    fetchUserChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:3001/api/reading-challenges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(res.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:3001/api/reading-challenges/my-challenges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserChallenges(res.data);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:3001/api/reading-challenges/${challengeId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Challenge joined successfully!');
      fetchUserChallenges();
      setActiveTab('my-challenges');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge');
    } finally {
      setLoading(false);
    }
  };

  // Function to update progress - call this when user borrows/returns books
  const updateChallengeProgress = async (challengeId, progress, action = 'add') => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:3001/api/reading-challenges/${challengeId}/progress`,
        { progress, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh user challenges to show updated progress
      fetchUserChallenges();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  // Example function to simulate book borrowing (for testing)
  const simulateBookBorrow = async (challengeType) => {
    try {
      // Find user's active challenges that match the type
      const relevantChallenges = userChallenges.filter(uc => 
        !uc.completed && uc.challenge.type === challengeType
      );

      for (const uc of relevantChallenges) {
        let progressToAdd = 0;
        
        if (challengeType === 'books_count') {
          progressToAdd = 1; // One book
        } else if (challengeType === 'pages_count') {
          // Simulate random pages between 50-400
          progressToAdd = Math.floor(Math.random() * 350) + 50;
        }

        if (progressToAdd > 0) {
          await updateChallengeProgress(uc.challenge._id, progressToAdd, 'add');
          toast.success(`Progress updated for ${uc.challenge.title}!`);
        }
      }
    } catch (error) {
      console.error('Error simulating book borrow:', error);
    }
  };

  const calculateProgress = (userChallenge) => {
    if (!userChallenge.challenge || userChallenge.challenge.goal === 0) return 0;
    return (userChallenge.progress / userChallenge.challenge.goal) * 100;
  };

  const getProgressText = (userChallenge) => {
    if (!userChallenge.challenge) return '';
    
    const challenge = userChallenge.challenge;
    const unit = challenge.type === 'pages_count' ? 'pages' : 'books';
    return `${userChallenge.progress} / ${challenge.goal} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white py-4 px-6">
            <h2 className="text-3xl font-bold">📚 Reading Challenges</h2>
            <p className="text-blue-100">Challenge yourself and earn rewards!</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Available Challenges
              </button>
              <button
                onClick={() => setActiveTab('my-challenges')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'my-challenges'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Challenges ({userChallenges.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Demo Controls - Remove in production */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Demo Controls</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => simulateBookBorrow('books_count')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Simulate Borrowing a Book
                </button>
                <button
                  onClick={() => simulateBookBorrow('pages_count')}
                  className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                >
                  Simulate Reading Pages
                </button>
              </div>
            </div>

            {activeTab === 'available' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {challenges.map((challenge) => (
                  <div key={challenge._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{challenge.title}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full capitalize">
                        {challenge.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{challenge.description}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Goal:</p>
                      <p className="font-semibold">
                        {challenge.goal} {challenge.type === 'pages_count' ? 'pages' : 'books'}
                      </p>
                    </div>

                    {challenge.duration && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Duration:</p>
                        <p className="text-sm">
                          {new Date(challenge.duration.startDate).toLocaleDateString()} - {' '}
                          {new Date(challenge.duration.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        {challenge.badgeReward && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            🏅 {challenge.badgeReward}
                          </span>
                        )}
                        {challenge.pointsReward > 0 && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-2">
                            ⭐ {challenge.pointsReward} points
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => joinChallenge(challenge._id)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Joining...' : 'Join Challenge'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'my-challenges' && (
              <div className="space-y-6">
                {userChallenges.map((uc) => (
                  <div key={uc._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{uc.challenge?.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{uc.challenge?.description}</p>
                      </div>
                      {uc.completed ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Completed ✅
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{getProgressText(uc)}</span>
                        <span>{Math.round(calculateProgress(uc))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(calculateProgress(uc), 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {uc.completed && uc.completedAt && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-700 text-sm">
                          🎉 Congratulations! Completed on {new Date(uc.completedAt).toLocaleDateString()}
                        </p>
                        {uc.challenge?.badgeReward && (
                          <p className="text-green-600 text-sm mt-1">
                            You earned: {uc.challenge.badgeReward} badge
                          </p>
                        )}
                        {uc.challenge?.pointsReward > 0 && (
                          <p className="text-green-600 text-sm">
                            +{uc.challenge.pointsReward} points
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {userChallenges.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't joined any challenges yet.</p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Browse Challenges
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingChallenges;