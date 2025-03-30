import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// 🔥 Reusable Components
const Button = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const Input = ({ type = "text", placeholder, name, value, onChange, className = "" }) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`border p-2 rounded w-full ${className}`}
  />
);

const Table = ({ children, className = "" }) => (
  <table className={`min-w-full bg-white border ${className}`}>{children}</table>
);

const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div>
      <div className="flex gap-4 border-b pb-2 mb-4">
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
    className={`px-4 py-2 rounded ${activeTab === value ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    {children}
  </button>
);

const AdminProfile = () => {
  const navigate = useNavigate();
  const handleViewProfile = (userId) => {
    navigate(`/user-profile/${userId}`); // Navigate to the user profile page
  };
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editBook, setEditBook] = useState(null); // State for editing a book
  const [editUser, setEditUser] = useState(null); // State for editing a user
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    publicationYear: "",
    genre: "",
    ISBN: "",
    callNumber: "",
    publisher: "",
    pages: "",
    language: "",
    totalCopies: "",
    availableCopies: "",
    isAvailable: true,
    searchCount: "",
    borrowCount: "",
    format: "",
    category: "",
    digitalCopyURL: "",
    description: "",
    coverImage: "",
    summary: "",
    rating: "",
  });


  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
    studentId: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const bookRes = await axios.get("http://localhost:3001/books", { headers });
      setBooks(bookRes.data);
      toast.success("Books fetched successfully!");
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to fetch books!");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const userRes = await axios.get("http://localhost:3001/api/admin/users", { headers });
      setUsers(userRes.data);
      toast.success("Users fetched successfully!");
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBook = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized: Please log in.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/admin/add-book", newBook, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Book added successfully!");
      fetchData();
      setShowAddBookForm(false);
      setNewBook({
        title: "",
        author: "",
        publicationYear: "",
        genre: "",
        ISBN: "",
        callNumber: "",
        publisher: "",
        pages: "",
        language: "",
        totalCopies: "",
        availableCopies: "",
        isAvailable: true,
        searchCount: "",
        borrowCount: "",
        format: "",
        category: "",
        digitalCopyURL: "",
        description: "",
        coverImage: "",
        summary: "",
        rating: "",
      });
    } catch (error) {
      console.error("Add Book Error:", error);
      toast.error("Failed to add book!");
    }
  };



  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post("http://localhost:3001/api/users/register", newUser, { headers });
      toast.success("User added successfully!");
      fetchUsers();
      setShowAddUserForm(false);
    } catch (error) {
      console.error("Add User Error:", error);
      toast.error("Failed to add user!");
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:3001/api/admin/delete-book/${bookId}`, { headers });
      toast.success("Book deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Delete Book Error:", error);
      toast.error("Failed to delete book!");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:3001/api/admin/delete-user/${userId}`, { headers });
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Delete User Error:", error);
      toast.error("Failed to delete user!");
    }
  };

  const handleEditBook = (book) => {
    setEditBook(book);
    setNewBook(book);
    setShowAddBookForm(true);
  };

  const handleUpdateBook = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`http://localhost:3001/api/admin/update-book/${editBook._id}`, newBook, { headers });
      fetchData();
      setShowAddBookForm(false);
      setEditBook(null);
    } catch (error) {
      console.error("Update Book Error:", error);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setNewUser(user);
    setShowAddUserForm(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`http://localhost:3001/api/admin/update-user/${editUser._id}`, newUser, { headers });
      fetchUsers();
      setShowAddUserForm(false);
      setEditUser(null);
    } catch (error) {
      console.error("Update User Error:", error);
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="manage-books">
        <TabsTrigger value="manage-books">📚 Manage Books</TabsTrigger>
        <TabsTrigger value="manage-users">👥 Manage Users</TabsTrigger>

        {/* Manage Books */}
        <div value="manage-books">
          <Card>
            <Button onClick={() => setShowAddBookForm((prev) => !prev)}>
              {showAddBookForm ? "Hide Form" : "Add Book"}
            </Button>

            {showAddBookForm && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Add New Book</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="title" placeholder="Title" value={newBook.title} onChange={handleInputChange} />
                  <Input name="author" placeholder="Author" value={newBook.author} onChange={handleInputChange} />
                  <Input name="publicationYear" type="number" placeholder="Publication Year" value={newBook.publicationYear} onChange={handleInputChange} />
                  <Input name="genre" placeholder="Genre" value={newBook.genre} onChange={handleInputChange} />
                  <Input name="ISBN" placeholder="ISBN" value={newBook.ISBN} onChange={handleInputChange} />
                  <Input name="callNumber" placeholder="Call Number" value={newBook.callNumber} onChange={handleInputChange} />
                  <Input name="publisher" placeholder="Publisher" value={newBook.publisher} onChange={handleInputChange} />
                  <Input name="pages" type="number" placeholder="Pages" value={newBook.pages} onChange={handleInputChange} />
                  <Input name="language" placeholder="Language" value={newBook.language} onChange={handleInputChange} />
                  <Input name="totalCopies" type="number" placeholder="Total Copies" value={newBook.totalCopies} onChange={handleInputChange} />
                </div>
                <Button onClick={editBook ? handleUpdateBook : handleAddBook}>
                  {editBook ? "Update Book" : "Submit User"}
                </Button>
              </div>
            )}
          </Card>

          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    <Button onClick={() => handleDeleteBook(book._id)}>Delete</Button>
                    <Button onClick={() => handleEditBook(book)}>Update</Button>
                    <Button onClick={() => navigate(`/book-profile/${book._id}`)}>Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Manage Users */}
        <div value="manage-users">
          <Card>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Users</h2>
              <Button onClick={() => setShowAddUserForm((prev) => !prev)}>
                {showAddUserForm ? "Hide Form" : "Add User"}
              </Button>
            </div>

            {showAddUserForm && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Add New User</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="name" placeholder="Name" value={newUser.name} onChange={handleUserChange} />
                  <Input name="email" placeholder="Email" value={newUser.email} onChange={handleUserChange} />
                  <Input name="role" placeholder="Role" value={newUser.role} onChange={handleUserChange} />
                  <Input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleUserChange} />
                  <Input name="studentId" placeholder="Student ID" value={newUser.studentId} onChange={handleUserChange} />
                  <Input name="department" placeholder="Department" value={newUser.department} onChange={handleUserChange} />
                  <Input name="phone" placeholder="Phone" value={newUser.phone} onChange={handleUserChange} />
                </div>
                <Button onClick={editUser ? handleUpdateUser : handleAddUser}>
                  {editUser ? "Update User" : "Submit User"}
                </Button>
              </div>
            )}
          </Card>

          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Button onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                    <Button onClick={() => handleEditUser(user)}>Update</Button>
                    <Button onClick={() => handleViewProfile(user._id)}>Profile</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminProfile;