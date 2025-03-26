import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose, AiOutlinePlus, AiOutlineHome, AiOutlineBook, AiOutlineInfoCircle, AiOutlineFolder, AiOutlineSetting } from "react-icons/ai";

const ResponsiveMenu = ({ open, setOpen, setAbout, setMyBooks, handleNavigation }) => {
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [otherInfoOpen, setOtherInfoOpen] = useState(false);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed top-0 left-0 w-80 h-screen bg-[#1a1a1a] shadow-xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">Menu</h2>
                                <button 
                                    className="text-gray-300 hover:text-white transition-colors"
                                    onClick={() => setOpen(false)}
                                >
                                    <AiOutlineClose size={24} />
                                </button>
                            </div>

                            <ul className="space-y-4">
                                <li>
                                    <button
                                        onClick={() => handleNavigation('/', false, false)}
                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#2d2d2d] rounded-lg transition-colors"
                                    >
                                        <AiOutlineHome size={20} />
                                        <span>Home</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleNavigation('/mybooks', false, true)}
                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#2d2d2d] rounded-lg transition-colors"
                                    >
                                        <AiOutlineBook size={20} />
                                        <span>My Books</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleNavigation('/about', true, false)}
                                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#2d2d2d] rounded-lg transition-colors"
                                    >
                                        <AiOutlineInfoCircle size={20} />
                                        <span>About</span>
                                    </button>
                                </li>

                                {/* Resources Section */}
                                <li>
                                    <div 
                                        className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer"
                                        onClick={() => setResourcesOpen(!resourcesOpen)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <AiOutlineFolder size={20} />
                                            <span>Resources</span>
                                        </div>
                                        <AiOutlinePlus 
                                            className={`transform transition-transform ${resourcesOpen ? "rotate-45" : ""}`} 
                                            size={20}
                                        />
                                    </div>
                                    {resourcesOpen && (
                                        <ul className="ml-8 mt-2 space-y-2">
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">E-Gateway</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">E-Books</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">Institutional Repository</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">CAT Question Papers</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">Online Learning</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">Indian Journals</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">E-NEWSPAPERS</li>
                                        </ul>
                                    )}
                                </li>

                                {/* Other Info Section */}
                                <li>
                                    <div 
                                        className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer"
                                        onClick={() => setOtherInfoOpen(!otherInfoOpen)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <AiOutlineSetting size={20} />
                                            <span>Other Info</span>
                                        </div>
                                        <AiOutlinePlus 
                                            className={`transform transition-transform ${otherInfoOpen ? "rotate-45" : ""}`} 
                                            size={20}
                                        />
                                    </div>
                                    {otherInfoOpen && (
                                        <ul className="ml-8 mt-2 space-y-2">
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">Tutorial</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">Gallery</li>
                                            <li className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer">Contact</li>
                                        </ul>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ResponsiveMenu;
