import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const BookList = () => {
    const navigate = useNavigate();
    const [savedBooks, setSavedBooks] = useState([]);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        // Load saved books from localStorage when component mounts
        const savedBooksFromStorage = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        setSavedBooks(savedBooksFromStorage);
    }, []);

    const handleBorrowClick = (book) => {
        navigate('/borrow', { state: { book } });
    };

    const handleSaveClick = (book) => {
        if (!savedBooks.includes(book.title)) {
            const updatedBooks = [...savedBooks, book.title];
            setSavedBooks(updatedBooks);
            localStorage.setItem('savedBooks', JSON.stringify(updatedBooks));
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 2000);
        }
    };

    const books = [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            year: 1925,
            genre: "Classic",
            image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb",
            description: "A story of decadence and excess...",
            category: "Fiction"
        },
        {
            id: 2,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            year: 1960,
            genre: "Fiction",
            image: "https://images.unsplash.com/photo-1529590003495-161262ed1d9b",
            description: "A story of racial injustice and the loss of innocence...",
            category: "Fiction"
        },
        {
            id: 3,
            title: "1984",
            author: "George Orwell",
            year: 1949,
            genre: "Dystopian",
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
            description: "A dystopian novel set in a totalitarian society...",
            category: "Dystopian"
        },
        {
            id: 4,
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
            year: 1951,
            genre: "Fiction",
            image: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
            description: "A story of teenage alienation and disillusionment...",
            category: "Fiction"
        },
        {
            id: 5,
            title: "Moby-Dick",
            author: "Herman Melville",
            year: 1851,
            genre: "Adventure",
            image: "https://images.unsplash.com/photo-1556040220-4096be9d3f52",
            description: "A story of obsession and revenge...",
            category: "Adventure"
        },
        {
            id: 6,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            year: 1813,
            genre: "Romance",
            image: "https://images.unsplash.com/photo-1521747116042-5a810fda9664",
            description: "A story of love and marriage in the English countryside...",
            category: "Romance"
        },
        {
            id: 7,
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            year: 1937,
            genre: "Fantasy",
            image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb",
            description: "A story of adventure and friendship...",
            category: "Fantasy"
        },
        {
            id: 8,
            title: "War and Peace",
            author: "Leo Tolstoy",
            year: 1869,
            genre: "Historical Fiction",
            image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1",
            description: "A story of love, war, and the Napoleonic era...",
            category: "Historical Fiction"
        },
        {
            id: 9,
            title: "Crime and Punishment",
            author: "Fyodor Dostoevsky",
            year: 1866,
            genre: "Psychological Fiction",
            image: "https://images.unsplash.com/photo-1563206767-32090f03b9f3",
            description: "A story of guilt, punishment, and redemption...",
            category: "Psychological Fiction"
        },
        {
            id: 10,
            title: "Brave New World",
            author: "Aldous Huxley",
            year: 1932,
            genre: "Science Fiction",
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
            description: "A story of a dystopian future...",
            category: "Science Fiction"
        },
        {
            id: 11,
            title: "The Lord of the Rings",
            author: "J.R.R. Tolkien",
            year: 1954,
            genre: "Fantasy",
            image: "https://images.unsplash.com/photo-1526392060635-9d6019884377",
            description: "A story of adventure and heroism...",
            category: "Fantasy"
        },
        {
            id: 12,
            title: "The Alchemist",
            author: "Paulo Coelho",
            year: 1988,
            genre: "Philosophical Fiction",
            image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
            description: "A story of following your dreams and destiny...",
            category: "Philosophical Fiction"
        },
        {
            id: 13,
            title: "Don Quixote",
            author: "Miguel de Cervantes",
            year: 1605,
            genre: "Classic",
            image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3",
            description: "A story of a man's quest for adventure and chivalry...",
            category: "Classic"
        },
        {
            id: 14,
            title: "Frankenstein",
            author: "Mary Shelley",
            year: 1818,
            genre: "Gothic Fiction",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
            description: "A story of science and its consequences...",
            category: "Gothic Fiction"
        },
        {
            id: 15,
            title: "Dracula",
            author: "Bram Stoker",
            year: 1897,
            genre: "Horror",
            image: "https://images.unsplash.com/photo-1526401485004-14f0ec9189a0",
            description: "A story of vampires and the battle between good and evil...",
            category: "Horror"
        },
    ];

    return (
        <div className='booklist'>
            {showMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    Book saved successfully!
                </div>
            )}
            {books.map((book) => (
                <div key={book.id}>
                    <img src={book.image} alt={book.title} className='book1' />
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleBorrowClick(book)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Borrow
                        </button>
                        <button
                            onClick={() => handleSaveClick(book)}
                            className={`${
                                savedBooks.includes(book.title)
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            } text-white px-4 py-2 rounded-lg transition-colors`}
                            disabled={savedBooks.includes(book.title)}
                        >
                            {savedBooks.includes(book.title) ? 'Saved' : 'Save'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookList;