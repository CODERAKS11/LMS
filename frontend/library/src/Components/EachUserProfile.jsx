import React from "react";
import axios from "axios";
import moment from "moment";

const EachUserProfile = ({ user, refreshUser }) => {
  if (!user) {
    return (
      <div className="text-center text-red-500 py-10">
        User not found or no data available.
      </div>
    );
  }

  const safeBookTitle = (book) =>
    book?.bookId?.title || book?.bookTitle || "Unknown Title";

  const safeBookAuthor = (book) =>
    book?.bookId?.author || book?.bookAuthor || "Unknown Author";

  const getBookId = (book) => {
    // Try different possible ID fields
    return book?.bookId || book?._id || book?.id;
  };

  const handleReturnBook = async (book) => {
    try {
      const userId = user._id;
      const bookId = getBookId(book);

      console.log("Returning book:", {
        userId,
        bookId,
        bookData: book,
        borrowedBooks: user.borrowedBooks
      });

      if (!userId || !bookId) {
        alert("Missing user ID or book ID");
        return;
      }

      const res = await axios.post(
        `http://localhost:3001/api/users/return/${userId}/${bookId}`,
        {},
        { 
          headers: { 
            "Content-Type": "application/json"
          } 
        }
      );
      
      alert(res.data.message);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Return error details:", {
        response: err.response,
        book: book,
        user: user
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Error returning book";
      alert(`Return failed: ${errorMessage}`);
    }
  };

  const handleRenewBook = async (book) => {
    try {
      const token = localStorage.getItem("token");
      const userId = user._id;
      const bookId = getBookId(book);

      console.log("Renewing book:", {
        userId,
        bookId,
        bookData: book
      });

      const res = await axios.put(
        `http://localhost:3001/api/users/renew/${userId}/${bookId}`,
        {},
        { 
          headers: { 
            "Content-Type": "application/json"
          } 
        }
      );
      
      alert(res.data.message);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Renew error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error renewing book";
      alert(`Renew failed: ${errorMessage}`);
    }
  };

  const handleCancelReservation = async (reservation) => {
    try {
      const reservationId = reservation._id;

      const res = await axios.delete(
        `http://localhost:3001/api/users/reservations/${reservationId}`,
        { 
          headers: { 
            "Content-Type": "application/json"
          } 
        }
      );
      
      alert(res.data.message);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Cancel reservation error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error canceling reservation";
      alert(`Cancel failed: ${errorMessage}`);
    }
  };

  // Filter borrowed books
  const borrowedBooks = user.borrowedBooks?.filter((book) => book?.status === "borrowed") || [];
  const activeReservations = user.reservations?.filter((res) => res?.status === "Pending" || res?.status === "Active") || [];
  const totalFines = user.borrowedBooks?.reduce((total, book) => total + (book?.fine || 0), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 my-6">
      {/* User Header */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <strong className="text-gray-600">Email:</strong>
            <p className="text-gray-800">{user.email}</p>
          </div>
          <div>
            <strong className="text-gray-600">Role:</strong>
            <p className="text-gray-800 capitalize">{user.role}</p>
          </div>
          <div>
            <strong className="text-gray-600">Department:</strong>
            <p className="text-gray-800">{user.department || "N/A"}</p>
          </div>
          <div>
            <strong className="text-gray-600">Phone:</strong>
            <p className="text-gray-800">{user.phone || "N/A"}</p>
          </div>
          <div>
            <strong className="text-gray-600">Total Books Read:</strong>
            <p className="text-gray-800">{user.totalBooksRead || 0}</p>
          </div>
          <div>
            <strong className="text-gray-600">User ID:</strong>
            <p className="text-gray-800 text-xs font-mono">{user._id}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{borrowedBooks.length}</div>
          <div className="text-sm text-green-800">Books Borrowed</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{activeReservations.length}</div>
          <div className="text-sm text-yellow-800">Active Reservations</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">₹{totalFines}</div>
          <div className="text-sm text-red-800">Total Fines</div>
        </div>
      </div>

      {/* Badges & Milestones */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg shadow border border-yellow-200">
        <h3 className="text-xl font-semibold mb-4 text-amber-800">Reading Achievements</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold text-amber-700 mb-2">Badges Earned:</h4>
          {user.badges?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-full text-sm font-medium shadow-md border border-amber-500"
                >
                  🏅 {badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-amber-600 italic">No badges earned yet. Keep reading!</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-amber-700 mb-2">Milestones Reached:</h4>
          {user.milestones?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.milestones.map((milestone, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full text-sm font-medium shadow-md border border-green-500"
                >
                  🎯 {milestone}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-amber-600 italic">No milestones reached yet.</p>
          )}
        </div>
      </div>

      {/* Borrowed Books */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg shadow border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-blue-800">Currently Borrowed Books</h3>
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
            {borrowedBooks.length} books
          </span>
        </div>

        {borrowedBooks.length > 0 ? (
          <div className="space-y-4">
            {borrowedBooks.map((book, idx) => {
              const isOverdue = book.dueDate && new Date(book.dueDate) < new Date();
              const daysUntilDue = book.dueDate ? 
                Math.ceil((new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <div key={book?._id || idx} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-700">Title:</p>
                      <p className="text-gray-900 text-lg">{safeBookTitle(book)}</p>
                      
                      <p className="font-semibold text-gray-700 mt-2">Author:</p>
                      <p className="text-gray-800">{safeBookAuthor(book)}</p>
                      
                      <p className="font-semibold text-gray-700 mt-2">Book ID:</p>
                      <p className="text-gray-600 text-xs font-mono">{getBookId(book)}</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-gray-700">Borrowed Date:</p>
                      <p className="text-gray-800">
                        {book?.borrowDate ? moment(book.borrowDate).format("DD MMM YYYY") : "N/A"}
                      </p>
                      
                      <p className="font-semibold text-gray-700 mt-2">Due Date:</p>
                      <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                        {book?.dueDate ? moment(book.dueDate).format("DD MMM YYYY") : "N/A"}
                        {isOverdue && " ⚠️ Overdue"}
                        {!isOverdue && daysUntilDue > 0 && ` (${daysUntilDue} days left)`}
                      </p>
                      
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-600">Renewals: {book?.renewalCount || 0}/3</span>
                        <span className="text-gray-600">Status: {book?.status || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {book?.fine > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 font-semibold">
                        ⚠️ Outstanding Fine: ₹{book.fine}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleReturnBook(book)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md flex items-center gap-2"
                    >
                      📚 Return Book
                    </button>
                    <button
                      onClick={() => handleRenewBook(book)}
                      disabled={book?.renewalCount >= 3}
                      className={`px-4 py-2 rounded-lg transition-colors shadow-md flex items-center gap-2 ${
                        book?.renewalCount >= 3 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      🔄 Renew Book
                    </button>
                    {book?.renewalCount >= 3 && (
                      <span className="text-xs text-red-600 mt-1">
                        Maximum renewals reached
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No books currently borrowed</p>
            <p className="text-gray-400 text-sm mt-1">Visit the library to borrow some books!</p>
          </div>
        )}
      </div>

      {/* Reservations */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg shadow border border-purple-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-purple-800">Active Reservations</h3>
          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
            {activeReservations.length} reservations
          </span>
        </div>

        {activeReservations.length > 0 ? (
          <div className="space-y-4">
            {activeReservations.map((reservation, idx) => (
              <div key={reservation?._id || idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">Book Title:</p>
                    <p className="text-gray-900 text-lg">
                      {reservation?.bookId?.title || reservation?.bookTitle || "Unknown Book"}
                    </p>
                    
                    <p className="font-semibold text-gray-700 mt-2">Reserved Date:</p>
                    <p className="text-gray-800">
                      {reservation?.reservedDate 
                        ? moment(reservation.reservedDate).format("DD MMM YYYY") 
                        : "N/A"}
                    </p>
                    
                    <p className="font-semibold text-gray-700 mt-2">Status:</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      reservation?.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation?.status || "Pending"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleCancelReservation(reservation)}
                    className="ml-4 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No active reservations</p>
            <p className="text-gray-400 text-sm mt-1">Reserve books to see them here!</p>
          </div>
        )}
      </div>

      {/* Outstanding Fines */}
      {totalFines > 0 && (
        <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg shadow border border-red-200">
          <h3 className="text-xl font-semibold text-red-800 mb-4">Outstanding Fines</h3>
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-red-700">Total Due:</span>
              <span className="text-xl font-bold text-red-600">₹{totalFines}</span>
            </div>
            <ul className="space-y-2">
              {user.borrowedBooks
                .filter((b) => b?.fine > 0)
                .map((book, idx) => (
                  <li key={book?._id || idx} className="flex justify-between items-center py-1 border-b border-red-100 last:border-b-0">
                    <span className="text-gray-700">{safeBookTitle(book)}</span>
                    <span className="font-semibold text-red-600">₹{book.fine}</span>
                  </li>
                ))}
            </ul>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700 text-sm">
                💡 Please pay your fines at the library counter to avoid restrictions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reading History */}
      <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg shadow border border-teal-200">
        <h3 className="text-xl font-semibold text-teal-800 mb-4">Reading History</h3>
        {user.borrowedBooks?.filter(b => b.status === "returned").length > 0 ? (
          <div className="bg-white p-4 rounded-lg border border-teal-200">
            <p className="text-gray-600">
              Total books read: <strong>{user.totalBooksRead || 0}</strong>
            </p>
            <p className="text-gray-600 mt-1">
              Currently reading: <strong>{borrowedBooks.length}</strong> books
            </p>
          </div>
        ) : (
          <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No reading history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EachUserProfile;