import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BorrowPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const book = location.state?.book;

    if (!book) {
        navigate('/mybooks');
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        navigate('/mybooks');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50 py-8"
        >
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Borrow Book</h2>
                    
                    <div className="flex flex-col items-center gap-2 mb-6">
                        {/* Book Image */}
                        <div className="w-4">
                            <img
                                src={book.image}
                                alt={book.title}
                                className="w-full rounded-lg shadow-md"
                            />
                        </div>

                        {/* Book Details */}
                        <div className="text-center">
                            <h3 className="text-xs font-semibold text-gray-800 mb-0.5">{book.title}</h3>
                            <p className="text-[10px] text-gray-600 mb-0.5">by {book.author}</p>
                            <div className="flex gap-0.5 justify-center">
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                    {book.genre}
                                </span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                    {book.year}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Borrow Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Borrow Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Return Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student ID
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/mybooks')}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Confirm Borrow
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default BorrowPage; 