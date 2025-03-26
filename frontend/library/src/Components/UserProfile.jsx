import { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // If there's no token, redirect to login page
                window.location.href = '/login';
                return;
            }

            try {
                // Fetch all users data
                const response = await axios.get('http://localhost:3001/api/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Decode the token and extract the user ID
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const loggedInUserId = decodedToken.id;

                // Find the logged-in user
                const loggedInUser = response.data.find(user => user._id === loggedInUserId);

                if (loggedInUser) {
                    setUserData(loggedInUser); // Set user data to state
                    setBorrowedBooks(loggedInUser.borrowedBooks); // Set borrowed books to state
                }

                setLoading(false); // Data is now loaded
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!userData) return <div>User not found</div>;
    console.log(userData);
    console.log(borrowedBooks);
    

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">User Profile</h2>
                <div className="mb-4">
                    <strong>Name:</strong> {userData.name}
                </div>
                <div className="mb-4">
                    <strong>Email:</strong> {userData.email}
                </div>
                <div className="mb-4">
                    <strong>Role:</strong> {userData.role}
                </div>

                {/* Display Borrowed Books */}
                <div className="mb-4">
                    <strong>Borrowed Books:</strong>
                    <ul>
                        {borrowedBooks.length > 0 ? (
                            borrowedBooks.map((book, index) => (
                                <li key={index}>
                                    

                                    {book.title} (Due Date: {new Date(book.dueDate).toLocaleDateString()})

                                </li>
                            ))
                        ) : (
                            <li>No borrowed books</li>
                        )}
                    </ul>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            window.location.href = '/login';
                        }}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
