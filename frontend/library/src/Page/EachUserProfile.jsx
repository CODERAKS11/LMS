import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EachUserProfile = () => {
  const { userId } = useParams(); // Get userId from the URL
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3001/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details.");
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/users/return/${user._id}/${bookId}`, // Pass the correct bookId
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Book returned successfully!");
      fetchUserDetails(); // Refresh user details
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book.");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="mb-6">
        <h2 className="text-xl font-bold">User Details</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Department:</strong> {user.department}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold">Borrowed Books</h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {user.borrowedBooks.map((book) => (
              <tr key={book.bookId._id || book.bookId}>
                <td>{book.bookTitle}</td>
                <td>{book.bookAuthor}</td>
                <td>{new Date(book.borrowedDate).toLocaleDateString()}</td>
                <td>{new Date(book.dueDate).toLocaleDateString()}</td>
                <td>{book.status}</td>
                <td>
                  {book.status === "borrowed" && (
                    <button onClick={() => handleReturnBook(book.bookId._id || book.bookId)}>Return</button>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default EachUserProfile;