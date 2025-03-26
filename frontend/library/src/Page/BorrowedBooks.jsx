import { motion } from "framer-motion";

const BorrowedBooks = () => {
    const borrowedBooks = [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            genre: "Classic",
            year: 1925,
            borrowDate: "2024-03-15",
            returnDate: "2024-04-15"
        },
        // Add more borrowed books here
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50 py-8"
        >
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Borrowed Books</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {borrowedBooks.map((book) => (
                        <div key={book.id} className="bg-white rounded-lg shadow-md p-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">{book.title}</h3>
                                <p className="text-sm text-gray-600">by {book.author}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {book.genre}
                                    </span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {book.year}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Borrowed: {book.borrowDate}</p>
                                    <p>Return by: {book.returnDate}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default BorrowedBooks; 