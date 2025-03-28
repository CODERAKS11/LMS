import { useState } from 'react';
import { MdMenu } from "react-icons/md";
import ResponsiveMenu from './ResponsiveMenu.jsx';
import soeicon from '../assets/soe icon.jpeg';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineMenu, AiOutlineUser } from "react-icons/ai";

const Header = ({ setAbout, setMyBooks }) => {
    const [resources, setResources] = useState(false);
    const [others, setOthers] = useState(false);
    const [open, setOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path, aboutState, myBooksState) => {
        setAbout(aboutState);
        setMyBooks(myBooksState);
        if (location.pathname !== path) {
            navigate(path);
        }
        setOpen(false);
        setUserDropdownOpen(false);
        setResources(false);
        setOthers(false);
    };

    const resourceOptions = [
        "E-Gateway",
        "E-Books",
        "Institutional Repository",
        "CAT Question Papers",
        "Online Learning",
        "Indian Journals",
        "E-NEWSPAPERS"
    ];

    const otherInfoOptions = [
        "Tutorial",
        "Gallery",
        "Contact"
    ];

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                    
                    {/* Logo */}
                    <div className="flex items-center">
                        <img src={soeicon} alt="SOE Icon" className="w-8 h-8" />
                        <h1 className="text-2xl font-bold text-gray-800 ml-0">SOE Library</h1>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setOpen(true)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <AiOutlineMenu size={24} />
                        </button>
                        <button
                            onClick={() => handleNavigation('/', false, false)}
                            className="text-lg font-medium italic text-gray-700 hover:text-gray-900 transition-colors bg-transparent"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => handleNavigation('/about', true, false)}
                            className="text-lg font-medium italic text-gray-700 hover:text-gray-900 transition-colors bg-transparent"
                        >
                            About
                        </button>
                        <button
                            onClick={() => handleNavigation('/mybooks', false, true)}
                            className="text-lg font-medium italic text-gray-700 hover:text-gray-900 transition-colors bg-transparent"
                        >
                            My Books
                        </button>

                        {/* Resources Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setResources(!resources)}
                                className="text-lg font-medium italic text-gray-700 hover:text-gray-900 transition-colors bg-transparent"
                            >
                                Resources
                            </button>
                            <AnimatePresence>
                                {resources && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50"
                                    >
                                        {resourceOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => console.log(`Clicked ${option}`)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Other Info Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setOthers(!others)}
                                className="text-lg font-medium italic text-gray-700 hover:text-gray-900 transition-colors bg-transparent"
                            >
                                Other Info
                            </button>
                            <AnimatePresence>
                                {others && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                                    >
                                        {otherInfoOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => console.log(`Clicked ${option}`)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Dropdown with Sign In & Admin Login */}
                        <div className="relative ml-auto">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                            >
                                <AiOutlineUser size={24} />
                            </button>
                            
                            <AnimatePresence>
                                {userDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                                    >
                                        {/* Sign In Button */}
                                        <button
                                            onClick={() => handleNavigation('/login', false, false)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign In
                                        </button>

                                        {/* Admin Login Button */}
                                        <button
                                            onClick={() => handleNavigation('/admin-login', false, false)}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                                        >
                                            Admin Login
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <ResponsiveMenu 
                open={open} 
                setOpen={setOpen} 
                setAbout={setAbout} 
                setMyBooks={setMyBooks}
                handleNavigation={handleNavigation}
            />
        </header>
    );
}

export default Header;
