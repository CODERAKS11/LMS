import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// 🎨 UI Components (Consolidated and Enhanced)
const Button = ({ children, onClick, className = "", color = "blue" }) => (
  <button
    onClick={onClick}
    className={`bg-${color}-500 hover:bg-${color}-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white shadow-xl rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ type = "text", placeholder, name, value, onChange, className = "", required = false }) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-shadow duration-150 ${className}`}
  />
);

const Table = ({ children, className = "" }) => (
  <div className="overflow-x-auto mt-4">
    <table className={`min-w-full bg-white border border-gray-200 divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  </div>
);

const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div>
      <div className="flex gap-4 border-b border-gray-300 pb-2 mb-6 overflow-x-auto">
        {React.Children.map(children, (child) =>
          child.type === TabsTrigger
            ? React.cloneElement(child, { activeTab, setActiveTab })
            : null
        )}
      </div>
      {React.Children.map(children, (child) =>
        child.props.value === activeTab ? child.props.children : null
      )}
    </div>
  );
};

const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors duration-200 ${activeTab === value ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
  >
    {children}
  </button>
);

// 🎯 Admin Dashboard Component
const AdminProfile = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [mostSearched, setMostSearched] = useState([]);
  const [fineReport, setFineReport] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalFine, setTotalFine] = useState(0);

  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const initialNewBookState = {
    title: "", author: "", publicationYear: "", genre: "", ISBN: "",
    callNumber: "", publisher: "", pages: "", language: "",
    totalCopies: "", availableCopies: "", isAvailable: true,
    searchCount: 0, borrowCount: 0, format: "", category: "",
    digitalCopyURL: "", description: "", coverImage: "", summary: "", rating: 0,
  };

  const initialNewUserState = {
    name: "", email: "", role: "student", password: "",
    studentId: "", department: "", phone: "",
  };

  const [newBook, setNewBook] = useState(initialNewBookState);
  const [newUser, setNewUser] = useState(initialNewUserState);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized: Please log in.");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, []);

  // 📖 Fetch Books
  const fetchData = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const bookRes = await axios.get("http://localhost:3001/books", { headers });
      setBooks(bookRes.data);
      // toast.success("Books fetched successfully!");
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to fetch books!");
    }
  }, [getHeaders]);

  // 👥 Fetch Users
  const fetchUsers = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const userRes = await axios.get("http://localhost:3001/api/admin/users", { headers });
      setUsers(userRes.data);
      // toast.success("Users fetched successfully!");
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users!");
    }
  }, [getHeaders]);

  // 📈 Fetch Reports
  const fetchReports = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      const [borrowed, searched, fines] = await Promise.all([
        axios.get("http://localhost:3001/api/admin/report/most-borrowed", { headers }),
        axios.get("http://localhost:3001/api/admin/report/most-searched", { headers }),
        axios.get("http://localhost:3001/api/admin/report/fines", { headers }),
      ]);

      setMostBorrowed(borrowed.data);
      setMostSearched(searched.data);
      setFineReport(fines.data);

      const totalCalculatedFine = fines.data.reduce(
        (acc, user) => acc + user.fines.reduce((sum, f) => sum + (f.fine || 0), 0),
        0
      );
      setTotalFine(totalCalculatedFine);

      // Simple Leaderboard: assumes users fetched include borrowedBooks array/count
      const userRes = await axios.get("http://localhost:3001/api/admin/users", { headers });
      const currentUsers = userRes.data;

      setLeaderboard(
        currentUsers
          .map((u) => ({
            name: u.name,
            totalBorrowed: u.borrowedBooks?.length || 0, // Assuming borrowedBooks exists on user object
          }))
          .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
          .slice(0, 5)
      );

    } catch (error) {
      console.error("Error fetching reports:", error);
      // toast.error("Failed to fetch reports!");
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchReports();
  }, [fetchData, fetchUsers, fetchReports]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "totalCopies" || name === "availableCopies" ? parseInt(value) || "" : value),
    }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const resetBookForm = () => {
    setNewBook(initialNewBookState);
    setEditBook(null);
  };

  const resetUserForm = () => {
    setNewUser(initialNewUserState);
    setEditUser(null);
  };

  // ➕ Add/Update Book
  const handleAddOrUpdateBook = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      if (editBook) {
        // Update Book
        await axios.put(`http://localhost:3001/api/admin/update-book/${editBook._id}`, newBook, { headers });
        toast.success("Book updated successfully!");
      } else {
        // Add Book
        await axios.post("http://localhost:3001/api/admin/add-book", newBook, { headers });
        toast.success("Book added successfully!");
      }
      fetchData();
      setShowAddBookForm(false);
      resetBookForm();
    } catch (error) {
      console.error(editBook ? "Update Book Error:" : "Add Book Error:", error);
      toast.error(`Failed to ${editBook ? "update" : "add"} book!`);
    }
  };

  // ➕ Add/Update User
  const handleAddOrUpdateUser = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      if (editUser) {
        // Update User
        await axios.put(`http://localhost:3001/api/admin/update-user/${editUser._id}`, newUser, { headers });
        toast.success("User updated successfully!");
      } else {
        // Add User
        await axios.post("http://localhost:3001/api/admin/add-user", newUser, { headers });
        toast.success("User added successfully!");
      }
      fetchUsers();
      setShowAddUserForm(false);
      resetUserForm();
    } catch (error) {
      console.error(editUser ? "Update User Error:" : "Add User Error:", error);
      toast.error(`Failed to ${editUser ? "update" : "add"} user!`);
    }
  };

  // ✏️ Edit Book
  const handleEditBook = (book) => {
    setEditBook(book);
    setNewBook({ ...initialNewBookState, ...book, searchCount: book.searchCount || 0, borrowCount: book.borrowCount || 0, rating: book.rating || 0 }); // Pre-fill all fields, including defaults
    setShowAddBookForm(true);
  };

  // ✏️ Edit User
  const handleEditUser = (user) => {
    setEditUser(user);
    setNewUser({ ...initialNewUserState, ...user, password: "" }); // Pre-fill, but clear password for security/UX
    setShowAddUserForm(true);
  };

  // 🗑️ Delete Book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const headers = getHeaders();
    if (!headers) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/delete-book/${bookId}`, { headers });
      toast.success("Book deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Delete Book Error:", error);
      toast.error("Failed to delete book!");
    }
  };

  // 🗑️ Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const headers = getHeaders();
    if (!headers) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/delete-user/${userId}`, { headers });
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Delete User Error:", error);
      toast.error("Failed to delete user!");
    }
  };

  // ℹ️ View Profile/Details
  const handleViewProfile = (userId) => navigate(`/user-profile/${userId}`);
  const handleViewBookDetails = (bookId) => navigate(`/book-profile/${bookId}`);

  // 🔎 Filtered Lists
  const filteredBooks = Array.isArray(books)
  ? books.filter(book =>
      (book.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (book.author?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (book.ISBN || '').includes(searchQuery)
    )
  : [];


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.studentId?.includes(searchQuery)
  );


  // --- Render ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">🚀 Library Admin Panel</h1>

      <Tabs defaultValue="overview">
        <TabsTrigger value="overview">📊 Overview</TabsTrigger>
        <TabsTrigger value="manage-books">📚 Manage Books</TabsTrigger>
        <TabsTrigger value="manage-users">👥 Manage Users</TabsTrigger>

        {/* 🔹 Overview */}
        <div value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <h3 className="text-lg font-semibold text-gray-600">Total Books</h3>
              <p className="text-4xl font-extrabold text-blue-600">{books.length}</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
              <p className="text-4xl font-extrabold text-green-600">{users.length}</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-600">Total Fine</h3>
              <p className="text-4xl font-extrabold text-red-600">₹{totalFine.toFixed(2)}</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-600">Top Reader</h3>
              <p className="text-2xl font-bold text-purple-600">
                {leaderboard[0]?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-500">{leaderboard[0] ? `${leaderboard[0].totalBorrowed} books` : ""}</p>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">📈 Most Borrowed Books</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mostBorrowed} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-15} textAnchor="end" height={50} interval={0} style={{ fontSize: '12px' }} />
                  <YAxis label={{ value: 'Borrow Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value, name) => [value, "Borrowed"]} />
                  <Legend />
                  <Bar dataKey="borrowCount" fill="#3b82f6" name="Times Borrowed" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">🔍 Top 5 Most Searched Books</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={mostSearched.slice(0, 5)}
                    dataKey="searchCount"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={3}
                    labelLine={false}
                    label={({ title, percent }) => `${title}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {mostSearched.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Searches"]} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card className="mt-6">
            <h3 className="text-xl font-bold mb-4">🏆 Top Readers Leaderboard</h3>
            <Table>
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Books Borrowed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((user, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.totalBorrowed}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* 🔹 Manage Books */}
        <div value="manage-books">
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Book Management ({books.length} Total)</h2>
              <Button onClick={() => { setShowAddBookForm((prev) => !prev); if (showAddBookForm) resetBookForm(); }}>
                {showAddBookForm ? "Cancel" : "Add New Book"}
              </Button>
            </div>
            {showAddBookForm && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-bold mb-4">{editBook ? `Edit Book: ${editBook.title}` : "Add New Book"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input name="title" placeholder="Title" value={newBook.title} onChange={handleInputChange} required />
                  <Input name="author" placeholder="Author" value={newBook.author} onChange={handleInputChange} required />
                  <Input name="publicationYear" type="number" placeholder="Year" value={newBook.publicationYear} onChange={handleInputChange} />
                  <Input name="genre" placeholder="Genre" value={newBook.genre} onChange={handleInputChange} />
                  <Input name="ISBN" placeholder="ISBN" value={newBook.ISBN} onChange={handleInputChange} required />
                  <Input name="callNumber" placeholder="Call Number" value={newBook.callNumber} onChange={handleInputChange} />
                  <Input name="publisher" placeholder="Publisher" value={newBook.publisher} onChange={handleInputChange} />
                  <Input name="pages" type="number" placeholder="Pages" value={newBook.pages} onChange={handleInputChange} />
                  <Input name="language" placeholder="Language" value={newBook.language} onChange={handleInputChange} />
                  <Input name="totalCopies" type="number" placeholder="Total Copies" value={newBook.totalCopies} onChange={handleInputChange} required />
                  <Input name="availableCopies" type="number" placeholder="Available Copies (Optional)" value={newBook.availableCopies} onChange={handleInputChange} />
                  <Input name="category" placeholder="Category" value={newBook.category} onChange={handleInputChange} />
                  <Input name="format" placeholder="Format (e.g., Hardcover)" value={newBook.format} onChange={handleInputChange} />
                  <Input name="coverImage" placeholder="Cover Image URL" value={newBook.coverImage} onChange={handleInputChange} className="md:col-span-3" />
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={newBook.description}
                    onChange={handleInputChange}
                    className="border p-3 rounded-lg w-full md:col-span-3 h-20 focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={handleAddOrUpdateBook} className="md:col-span-3 mt-2">
                    {editBook ? "Update Book" : "Submit Book"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <Input
              type="text"
              placeholder="Search Books by Title, Author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <Table>
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Copies</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${book.availableCopies || 'N/A'} / ${book.totalCopies || 'N/A'}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button color="red" onClick={() => handleDeleteBook(book._id)} className="py-1 px-2 text-xs">Delete</Button>
                        <Button color="yellow" onClick={() => handleEditBook(book)} className="py-1 px-2 text-xs">Update</Button>
                        <Button color="green" onClick={() => handleViewBookDetails(book._id)} className="py-1 px-2 text-xs">Details</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {filteredBooks.length === 0 && <p className="text-center py-4 text-gray-500">No books found matching the search criteria.</p>}
          </Card>
        </div>

        {/* 🔹 Manage Users */}
        <div value="manage-users">
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">User Management ({users.length} Total)</h2>
              <Button onClick={() => { setShowAddUserForm((prev) => !prev); if (showAddUserForm) resetUserForm(); }}>
                {showAddUserForm ? "Cancel" : "Add New User"}
              </Button>
            </div>
            {showAddUserForm && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-bold mb-4">{editUser ? `Edit User: ${editUser.name}` : "Add New User"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input name="name" placeholder="Name" value={newUser.name} onChange={handleUserChange} required />
                  <Input name="email" type="email" placeholder="Email" value={newUser.email} onChange={handleUserChange} required />
                  <Input name="role" placeholder="Role (e.g., student, faculty)" value={newUser.role} onChange={handleUserChange} />
                  <Input name="password" type="password" placeholder={editUser ? "New Password (Leave blank to keep existing)" : "Password"} value={newUser.password} onChange={handleUserChange} required={!editUser} />
                  <Input name="studentId" placeholder="Student ID" value={newUser.studentId} onChange={handleUserChange} />
                  <Input name="department" placeholder="Department" value={newUser.department} onChange={handleUserChange} />
                  <Input name="phone" placeholder="Phone" value={newUser.phone} onChange={handleUserChange} />
                  <Button onClick={handleAddOrUpdateUser} className="md:col-span-3 mt-2">
                    {editUser ? "Update User" : "Submit User"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <Input
              type="text"
              placeholder="Search Users by Name, Email, or Student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <Table>
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button color="red" onClick={() => handleDeleteUser(user._id)} className="py-1 px-2 text-xs">Delete</Button>
                        <Button color="yellow" onClick={() => handleEditUser(user)} className="py-1 px-2 text-xs">Update</Button>
                        <Button color="green" onClick={() => handleViewProfile(user._id)} className="py-1 px-2 text-xs">Profile</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {filteredUsers.length === 0 && <p className="text-center py-4 text-gray-500">No users found matching the search criteria.</p>}
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminProfile;