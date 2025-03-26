import { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition"
            >
                <FaUserCircle className="text-gray-600 text-3xl" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2">
                    <div className="px-4 py-2 border-b">
                        <p className="text-gray-700 font-medium">DIVYANSHU KUMAR</p>
                        <p className="text-gray-500 text-sm">example@email.com</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
