import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify'; // Added toast for better error messages
import SearchCatalog from './SearchCatalog';
import React from 'react';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCatalog, setShowCatalog] = useState(false);
    const [renewing, setRenewing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // State for Leaderboard
    const [leaderboard, setLeaderboard] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const userId = localStorage.getItem("user_id");

    const getHeaders = useCallback(() => {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        if (!token) {
            toast.error("Authentication required.");
            return null;
        }
        return { Authorization: `Bearer ${token}` };
    }, []);

    // 🔄 Fetch User Data (FIXED)
    const fetchUserData = useCallback(async () => {
        if (!userId) {
            console.error("No user ID found. Redirecting to login...");
            navigate('/login');
            return;
        }
        
        const headers = getHeaders();
        if (!headers) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`http://localhost:3001/api/users/${userId}`, {
                headers,
                timeout: 10000,
            });

            // 🔥 FIX APPLIED HERE: Safely extract the user object.
            const userData = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : res.data;
            
            if (userData && userData.name) { // Check for a non-empty user object
                setUser(userData);
            } else {
                setError("Profile data is incomplete or missing.");
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load user data. Please try again.");
            setLoading(false);
        }
    }, [navigate, userId, getHeaders]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // 🏆 Fetch Leaderboard Data
    const fetchLeaderboard = useCallback(async () => {
        const headers = getHeaders();
        if (!headers) return;
        
        setShowLeaderboard(true); 

        try {
            const userRes = await axios.get("http://localhost:3001/api/admin/users", { headers });
            const allUsers = userRes.data;

            const sortedLeaderboard = allUsers
                .map((u) => ({
                    id: u._id,
                    name: u.name,
                    role: u.role,
                    totalBorrowed: u.borrowedBooks?.length || 0,
                }))
                .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
                .slice(0, 10);

            setLeaderboard(sortedLeaderboard);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            toast.error("Failed to fetch leaderboard data.");
            setLeaderboard([]);
        }
    }, [getHeaders]);


    // 🔁 Handle Renew
    const handleRenew = async (bookId) => {
        if (renewing) return;
        setRenewing(true);

        const authToken = localStorage.getItem("authToken");
        if (!authToken) return alert("Authentication token missing.");

        try {
            const res = await axios.put(`http://localhost:3001/api/books/renew/${bookId}`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            toast.success(res.data.message);
            fetchUserData();
        } catch (error) {
            console.error("Error renewing book:", error);
            toast.error(error.response?.data?.message || "Failed to renew the book.");
        } finally {
            setRenewing(false);
        }
    };

    // ✍️ Handle Review
    const handleReview = (bookId) => {
        const reviewText = prompt("Enter your review:");
        const rating = prompt("Enter your rating (0-5):");

        if (reviewText && rating) {
            const token = localStorage.getItem("authToken");
            axios.post(
                `http://localhost:3001/api/users/review/${bookId}`,
                { reviewText, rating },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then(() => {
                toast.success("Review submitted successfully!");
                fetchUserData();
            })
            .catch((error) => {
                console.error("Error submitting review:", error);
                toast.error("Failed to submit review.");
            });
        }
    };

    // 🔔 Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get("http://localhost:3001/api/users/notifications?unread=true", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setShowNotifications(true);
        } catch (error) {
            setNotifications([]);
            setShowNotifications(true);
            console.error("Error fetching notifications:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>;
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p>{error || "No user data found."}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const borrowedBooks = Array.isArray(user.borrowedBooks) ? user.borrowedBooks : [];

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Profile Header and Buttons */}
                <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
                    <h2 className="text-3xl font-bold">User Profile</h2>
                    <div className='flex space-x-2'>
                        {/* Leaderboard Button */}
                        <button
                            onClick={fetchLeaderboard}
                            className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-600"
                        >
                            🏆 View Leaderboard
                        </button>
                        <button
                            onClick={() => setShowCatalog(!showCatalog)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                        >
                            {showCatalog ? 'Hide Catalog' : '🔍 Search Catalog'}
                        </button>
                        <button
                            onClick={fetchNotifications}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600"
                        >
                            🔔 Show Notifications
                        </button>
                    </div>
                </div>

                {showCatalog && (
                    <div className="p-6 border-t">
                        <SearchCatalog />
                    </div>
                )}

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Details (Now correctly populated) */}
                        <div>
                            <p className="text-lg"><strong>Name:</strong> {user.name}</p>
                            <p className="text-lg"><strong>Email:</strong> {user.email}</p>
                            <p className="text-lg"><strong>Role:</strong> {user.role}</p>
                            <p className="text-lg"><strong>Department:</strong> {user.department}</p>
                            <p className="text-lg"><strong>Phone:</strong> {user.phone}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Borrowed Books</h3>
                            <p className="text-lg"><strong>Total Books Borrowed:</strong> {borrowedBooks.filter(book => book.status === "borrowed").length}</p>
                            {borrowedBooks.filter(book => book.status === "borrowed").length > 0 ? (
                                <ul className="space-y-4">
                                    {borrowedBooks.filter(book => book.status === "borrowed").map((book, index) => (
                                        <li key={index} className="border-b pb-4">
                                            <p><strong>Book ID:</strong> {book.bookId}</p>
                                            <p><strong>Title:</strong> {book.bookTitle}</p>
                                            <p><strong>Author:</strong> {book.bookAuthor}</p>

                                            <p><strong>Borrowed Date:</strong> {moment(book.borrowedDate).format('DD-MM-YYYY')}</p>
                                            <p><strong>Due Date:</strong> {moment(book.dueDate).format('DD-MM-YYYY')}</p>
                                            <p><strong>Status:</strong> {book.status}</p>
                                            <p><strong>Renewals:</strong> {book.renewals}</p>
                                            <div className="mt-4">
                                                {book.review ? (
                                                    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                                                        <h4 className="text-sm font-semibold">Your Review:</h4>
                                                        <p><strong>Review:</strong> {book.review.reviewText}</p>
                                                        <p><strong>Rating:</strong> {book.review.rating}/5</p>
                                                    </div>
                                                ) : (
                                                    book.status === "returned" && (
                                                        <button
                                                            onClick={() => handleReview(book.bookId)}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
                                                        >
                                                            Review Book
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                            <div className="bg-gray-100 p-2 mt-2 rounded-md">
                                                <h4 className="text-sm font-semibold">Renewal History:</h4>
                                                {book.renewalHistory && book.renewalHistory.length > 0 ? (
                                                    book.renewalHistory.map((renew, idx) => (
                                                        <div key={idx}>
                                                            <p><strong>Renewed:</strong> {moment(renew.renewedDate).format('DD-MM-YYYY')}</p>
                                                            <p><strong>New Due Date:</strong> {moment(renew.newDueDate).format('DD-MM-YYYY')}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No renewals yet</p>
                                                )}
                                            </div>
                                            {book.status !== "returned" && (
                                                <button
                                                    onClick={() => handleRenew(book.bookId)}
                                                    disabled={renewing}
                                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    {renewing ? 'Renewing...' : 'Renew Book'}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No books currently borrowed.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow-md mt-6">
                    <h3 className="text-xl font-semibold mb-4">Reservations</h3>

                    {user.reservations && user.reservations.length > 0 ? (
                        <ul className="space-y-4">
                            {user.reservations.map((reservation, index) => (
                                <li key={index} className="border-b pb-4">
                                    <p><strong>Book Title:</strong> {reservation.bookTitle}</p>
                                    <p><strong>Reserved Date:</strong> {moment(reservation.reservedDate).format('DD-MM-YYYY')}</p>
                                    <p><strong>Status:</strong> {reservation.status}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No reservations made.</p>
                    )}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg shadow-md mt-6">
                    <h3 className="text-xl font-semibold mb-4">Reading Achievements</h3>
                    <p className="text-lg"><strong>Total Books Read:</strong> {user.totalBooksRead || 0}</p>
                    <div className="mt-2">
                        <h4 className="text-md font-semibold">Badges:</h4>
                        {user.badges && user.badges.length > 0 ? (
                            <ul className="flex flex-wrap gap-2 mt-1">
                                {user.badges.map((badge, idx) => (
                                    <li key={idx} className="px-3 py-1 bg-yellow-300 rounded-full text-sm font-medium shadow">{badge}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No badges earned yet.</p>
                        )}
                    </div>
                    <div className="mt-2">
                        <h4 className="text-md font-semibold">Milestones:</h4>
                        {user.milestones && user.milestones.length > 0 ? (
                            <ul className="flex flex-wrap gap-2 mt-1">
                                {user.milestones.map((milestone, idx) => (
                                    <li key={idx} className="px-3 py-1 bg-green-200 rounded-full text-sm font-medium shadow">{milestone}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No milestones reached yet.</p>
                        )}
                    </div>
                </div>

                {/* Notifications Modal/List */}
                {showNotifications && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                            {notifications.length > 0 ? (
                                <ul>
                                    {notifications.map((note, idx) => (
                                        <li key={idx} className="mb-3 border-b pb-2">
                                            <span className="font-medium capitalize">{note.type}:</span> {note.message}
                                            <span className="text-xs text-gray-500 ml-2">
                                                {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No notifications found.</p>
                            )}
                            <button
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => setShowNotifications(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
                
                {/* 🏆 Leaderboard Modal */}
                {showLeaderboard && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">🏆 Top 10 Readers Leaderboard</h3>
                            
                            {leaderboard.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">Loading or no data available.</p>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-purple-600 text-white sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Books Read</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {leaderboard.map((u, index) => (
                                            <tr 
                                                key={u.id} 
                                                className={`transition-colors duration-150 ${u.id === userId ? 'bg-yellow-100 font-bold' : (index % 2 === 0 ? "bg-gray-50" : "bg-white")} hover:bg-blue-50`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {index + 1 === 1 && <span className="text-yellow-600">🥇</span>}
                                                    {index + 1 === 2 && <span className="text-gray-500">🥈</span>}
                                                    {index + 1 === 3 && <span className="text-amber-700">🥉</span>}
                                                    {index + 1 > 3 ? index + 1 : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{u.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-extrabold">{u.totalBorrowed}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            
                            <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                                <p className='text-sm text-gray-700'>
                                    {leaderboard.find(u => u.id === userId) ? 
                                     `You are ranked #${leaderboard.findIndex(u => u.id === userId) + 1} on the leaderboard!` :
                                     "Your rank will appear here once your borrowing data is available."
                                    }
                                </p>
                            </div>

                            <button
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => setShowLeaderboard(false)}
                            >
                                Close Leaderboard
                            </button>
                        </div>
                    </div>
                )}


                <div className="flex justify-end p-6 border-t">
                    <button
                        onClick={() => {
                            localStorage.removeItem("authToken");
                            localStorage.removeItem("user_id");
                            navigate('/login');
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;