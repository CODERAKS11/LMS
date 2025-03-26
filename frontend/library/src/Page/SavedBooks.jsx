import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const SavedBooks = () => {
    const [savedBooks, setSavedBooks] = useState([]);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        // Load saved books from localStorage when component mounts
        const savedBooksFromStorage = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        setSavedBooks(savedBooksFromStorage);
    }, []);

    const handleRemove = (bookTitle) => {
        const updatedBooks = savedBooks.filter(book => book !== bookTitle);
        setSavedBooks(updatedBooks);
        localStorage.setItem('savedBooks', JSON.stringify(updatedBooks));
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50 py-8"
        >
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Books</h2>
                {showMessage && (
                    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        Book removed successfully!
                    </div>
                )}
                {savedBooks.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 text-lg">No books saved yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedBooks.map((bookTitle) => (
                            <div key={bookTitle} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800">{bookTitle}</h3>
                                <button
                                    onClick={() => handleRemove(bookTitle)}
                                    className="flex items-center gap-1 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                >
                                    <span>Remove</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SavedBooks; 