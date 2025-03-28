import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import SearchCatalog from './SearchCatalog';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCatalog, setShowCatalog] = useState(false);
    const [renewing, setRenewing] = useState(false);  // 🔥 To prevent multiple clicks

    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            console.error("No user ID found. Redirecting to login...");
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/users/${userId}`, {
                    timeout: 10000,
                });

                if (Array.isArray(res.data) && res.data.length > 0) {
                    setUser(res.data[0]);
                } else {
                    setUser(res.data);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data. Please try again.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, userId]);

    const handleRenew = async (bookId) => {
        
        if (renewing) return;  // Prevent multiple clicks
        setRenewing(true);

        try {
            const authToken = localStorage.getItem("authToken");  // Get the token
            const res = await axios.put(`http://localhost:3001/api/books/renew/${bookId}`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            alert(res.data.message);  // Show renewal success message
            // Refresh the user data after renewal
            const updatedUser = await axios.get(`http://localhost:3001/api/users/${userId}`);
            setUser(updatedUser.data);

        } catch (error) {
            console.error("Error renewing book:", error);
            alert(error.response?.data?.message || "Failed to renew the book.");
        } finally {
            setRenewing(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p>{error}</p>
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

    if (!user) {
        return <div className="flex justify-center items-center min-h-screen text-xl">No user data found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
                    <h2 className="text-3xl font-bold">User Profile</h2>
                    <button
                        onClick={() => setShowCatalog(!showCatalog)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                    >
                        {showCatalog ? 'Hide Catalog' : 'Search Catalog'}
                    </button>
                </div>

                {showCatalog && (
                    <div className="p-6 border-t">
                        <SearchCatalog />
                    </div>
                )}

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-lg"><strong>Name:</strong> {user.name}</p>
                            <p className="text-lg"><strong>Email:</strong> {user.email}</p>
                            <p className="text-lg"><strong>Role:</strong> {user.role}</p>
                            <p className="text-lg"><strong>Department:</strong> {user.department}</p>
                            <p className="text-lg"><strong>Phone:</strong> {user.phone}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Borrowed Books</h3>

                            {user.borrowedBooks && user.borrowedBooks.length > 0 ? (
                                <ul className="space-y-4">
                                    {user.borrowedBooks.map((book, index) => (
                                        <li key={index} className="border-b pb-4">
                                            <p><strong>Book ID:</strong> {book.bookId}</p>
                                            <p><strong>Borrowed Date:</strong> {moment(book.borrowedDate).format('DD-MM-YYYY')}</p>
                                            <p><strong>Due Date:</strong> {moment(book.dueDate).format('DD-MM-YYYY')}</p>
                                            <p><strong>Status:</strong> {book.status}</p>
                                            <p><strong>Renewals:</strong> {book.renewals}</p>
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
                                            <button
                                                onClick={() => handleRenew(book.bookId)}
                                                disabled={renewing}
                                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                {renewing ? 'Renewing...' : 'Renew Book'}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No books borrowed.</p>
                            )}
                        </div>
                    </div>
                </div>

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
