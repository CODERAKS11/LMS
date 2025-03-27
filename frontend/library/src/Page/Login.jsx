import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/users/login', formData);

            console.log('Login Response:', response.data);  // ✅ Log the response

            if (response.data.token && response.data.user && response.data.user.id) {
                // ✅ Store token and correct user ID in localStorage
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user_id', response.data.user.id);  // Store the correct ID

                console.log('User ID stored:', response.data.user.id);

                navigate('/profile');  // Redirect to profile page
            } else {
                console.error('User ID missing in response.');
                setError('Failed to retrieve user ID.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Invalid credentials or server error.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <h2 className="text-center text-3xl font-bold">Login</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />

                    {error && <div className="text-red-500">{error}</div>}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
