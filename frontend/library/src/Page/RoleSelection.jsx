import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');

    const handleSelect = (selectedRole) => {
        setRole(selectedRole);
        navigate(`/login?role=${selectedRole}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-3xl font-bold mb-8">Select Your Role</h2>
            <div className="flex space-x-4">
                <button
                    onClick={() => handleSelect('student')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Student
                </button>
                <button
                    onClick={() => handleSelect('staff')}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Staff
                </button>
                <button
                    onClick={() => handleSelect('librarian')}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Librarian
                </button>
            </div>
        </div>
    );
};

export default RoleSelection;
