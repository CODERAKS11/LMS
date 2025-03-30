import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BookProfile = () => {
  const { bookId } = useParams(); // Get bookId from the URL
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetchBookDetails();
  }, []);

  const fetchBookDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`http://localhost:3001/api/books/${bookId}`, { headers });
      setBook(response.data);
    } catch (error) {
      console.error("Error fetching book details:", error);
      toast.error("Failed to fetch book details!");
    }
  };

  if (!book) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{book.title}</h2>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Publication Year:</strong> {book.publicationYear}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>ISBN:</strong> {book.ISBN}</p>
        <p><strong>Call Number:</strong> {book.callNumber}</p>
        <p><strong>Publisher:</strong> {book.publisher}</p>
        <p><strong>Pages:</strong> {book.pages}</p>
        <p><strong>Language:</strong> {book.language}</p>
        <p><strong>Total Copies:</strong> {book.totalCopies}</p>
        <p><strong>Available Copies:</strong> {book.availableCopies}</p>
        <p><strong>Borrow Count:</strong> {book.borrowCount}</p>
        <p><strong>Search Count:</strong> {book.searchCount}</p>
        <p><strong>Format:</strong> {book.format}</p>
        <p><strong>Category:</strong> {book.category}</p>
        <p><strong>Description:</strong> {book.description}</p>
        <p><strong>Digital Copy URL:</strong> {book.digitalCopyURL}</p>
        <p><strong>Cover Image:</strong></p>
        {book.coverImage && <img src={book.coverImage} alt={book.title} className="w-32 h-48 mt-2" />}

        {/* Borrowers Table */}
        <h3 className="text-xl font-bold mt-6">Borrowers</h3>
        {book.borrowers && book.borrowers.length > 0 ? (
          <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">User ID</th>
                <th className="border border-gray-300 px-4 py-2">Borrowed Date</th>
                <th className="border border-gray-300 px-4 py-2">Due Date</th>
                <th className="border border-gray-300 px-4 py-2">Return Date</th>
                <th className="border border-gray-300 px-4 py-2">Fine</th>
              </tr>
            </thead>
            <tbody>
              {book.borrowers.map((borrower, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{borrower.userId}</td>
                  <td className="border border-gray-300 px-4 py-2">{borrower.borrowedDate ? new Date(borrower.borrowedDate).toLocaleDateString() : "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{borrower.dueDate ? new Date(borrower.dueDate).toLocaleDateString() : "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{borrower.returnDate ? new Date(borrower.returnDate).toLocaleDateString() : "Not Returned"}</td>
                  <td className="border border-gray-300 px-4 py-2">{borrower.fine || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No borrowers yet.</p>
        )}

        {/* Reservations Table */}
        <h3 className="text-xl font-bold mt-6">Reservations</h3>
        {book.reservations && book.reservations.length > 0 ? (
          <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">User ID</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Reserved Date</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {book.reservations.map((reservation, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{reservation.userId}</td>
                  <td className="border border-gray-300 px-4 py-2">{reservation.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(reservation.reservedDate).toLocaleDateString()}</td>
                  <td className="border border-gray-300 px-4 py-2">{reservation.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reservations.</p>
        )}

        {/* Reviews Table */}
        <h3 className="text-xl font-bold mt-6">Reviews</h3>
        {book.reviews && book.reviews.length > 0 ? (
          <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">User ID</th>
                <th className="border border-gray-300 px-4 py-2">Review Text</th>
                <th className="border border-gray-300 px-4 py-2">Rating</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {book.reviews.map((review, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{review.userId}</td>
                  <td className="border border-gray-300 px-4 py-2">{review.reviewText}</td>
                  <td className="border border-gray-300 px-4 py-2">{review.rating}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(review.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reviews.</p>
        )}
      </div>
    </div>
  );
};

export default BookProfile;