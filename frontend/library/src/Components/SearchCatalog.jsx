import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../assets/search.svg';
import Author from './dropdown compo/Author.jsx';
import Title from './dropdown compo/Title.jsx';
import ISBN from './dropdown compo/ISBN.jsx';
import Subject from './dropdown compo/Subject.jsx';
import CallNumber from './dropdown compo/CallNumber.jsx';
import axios from 'axios';

const SearchCatalog = () => {
    const [option, setOption] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);  // Initialize as an empty array
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();  // To redirect to login if not authenticated

    const handleOption = (event) => {
        setOption(event.target.value);
    };

    const handleSearch = async () => {
        if (!searchQuery) return;

        setLoading(true);
        try {
            let url = `http://localhost:3001/api/books/search?title=${searchQuery}`;
            if (option === "call number") {
                url = `http://localhost:3001/api/books/search/callnumber?callNumber=${searchQuery}`;
            }
            if (option === "isbn") {
                url = `http://localhost:3001/api/books/search/isbn?isbn=${searchQuery}`;
            }
            if (option === "author") {
                url = `http://localhost:3001/api/books/search/author?author=${searchQuery}`;
            }

            const response = await axios.get(url);

            // Log the response to verify if it's an array
            console.log(response.data);

            // Check if response is an array
            if (Array.isArray(response.data)) {
                setSearchResults(response.data); // If it's an array, set the results
            } else {
                console.error('Expected an array but got:', response.data);
                setSearchResults([]);  // Clear results if the data is not an array
            }
        } catch (error) {
            console.error('Error searching books:', error);
            setSearchResults([]);  // In case of an error, clear results
        } finally {
            setLoading(false);
        }
    };

    const handleBorrow = (bookId) => {
        // Check if the user is logged in (i.e., if there's an auth token in localStorage)
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If no token, redirect to login page
            navigate('/login');
        } else {
            // If the user is logged in, proceed with the borrowing action
            // You can call the API to borrow the book here
            axios.post(`http://localhost:3001/api/users/borrow/${bookId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                alert("Book borrowed successfully!");
            })
            .catch(error => {
                console.error('Error borrowing book:', error);
                alert("Error borrowing book.");
            });
        }
    };

    const handleReserve = (bookId) => {
        // Check if the user is logged in (i.e., if there's an auth token in localStorage)
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If no token, redirect to login page
            navigate('/login');
        } else {
            // If the user is logged in, proceed with the reservation action
            axios.post(`http://localhost:3001/api/users/reserve/${bookId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                alert("Book reserved successfully!");
            })
            .catch(error => {
                console.error('Error reserving book:', error);
                alert("Error reserving book.");
            });
        }
    };

    return (
        <>
            <div className="search">
                <h1>Search Library Catalog</h1>
                <div className="dropdowncontainer">
                    <select value={option} onChange={handleOption} className="dropdown">
                        <option>Library Catalog</option>
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="isbn">ISBN</option>
                        <option value="call number">Call Number</option>
                    </select>

                    {option === "title" && <Title />}
                    {option === "author" && <Author />}
                    {option === "isbn" && <ISBN />}
                    {option === "subject" && <Subject />}
                    {option === "callnumber" && <CallNumber />}
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search Books"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        <img src={searchIcon} alt="Search Icon" />
                    </button>
                </div>

                {loading && <p>Loading...</p>} {/* Show loading state */}

                {/* Display search results */}
                {Array.isArray(searchResults) && searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Search Results:</h3>
                        <ul>
                        {searchResults.map((book) => (
                                <li key={book._id}>
                                    <img src={book.coverImage} height="100px" width="100px" alt={book.title} />

                                    <h4>{book.title}</h4>
                                    <p>{book.author}</p>
                                    <p>{book.isbn}</p>
                                    <p>{book.callNumber}</p>

                                    {/* Show Borrow or Reserve button based on availability */}
                                    {book.availableCopies > 0 ? (
                                        <button onClick={() => handleBorrow(book._id)} className="borrow-button">
                                            Borrow
                                        </button>
                                    ) : (
                                        <button onClick={() => handleReserve(book._id)} className="reserve-button">
                                            Reserve
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Handle case when no results are found */}
                {Array.isArray(searchResults) && searchResults.length === 0 && !loading && (
                    <p>No books found.</p>
                )}
            </div>
        </>
    );
};

export default SearchCatalog;
