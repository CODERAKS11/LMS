import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('authToken');
            const userId = localStorage.getItem('user_id');  // ✅ Retrieve user_id from localStorage

            console.log('User ID from localStorage:', userId);

            if (!token || !userId) {
                console.error('No token or user ID found, redirecting to login...');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('User data:', response.data);
                setUser(response.data);
                console.log('User data set:', user);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to fetch user data.');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!user) {
        return <div>No user data found.</div>;
    }
    console.log(user[0].name)
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">User Profile</h2>

                <div><strong>Name:</strong> {user[0].name}</div>
                <div><strong>Email:</strong> {user[0].email}</div>
                <div><strong>Role:</strong> {user[0].role}</div>
                <div><strong>Department:</strong> {user[0].department}</div>
                <div><strong>Phone:</strong> {user[0].phone}</div>

                <h2 className="text-2xl font-bold mb-4">Books Borrowed</h2>
                
                <div className="mt-6">
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('user_id');
                            navigate('/login');
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
