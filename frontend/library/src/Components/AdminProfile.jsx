import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    publicationYear: "",
    ISBN: "",
    totalCopies: "",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post("http://localhost:3001/api/admin/add-book", newBook, { headers });
      toast.success("Book added successfully!");
      fetchData();
      setShowAddBookForm(false);
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
      await axios.post("http://localhost:3001/api/admin/add-user", newUser, { headers });
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
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Input name="title" placeholder="Title" onChange={handleInputChange} />
                <Input name="author" placeholder="Author" onChange={handleInputChange} />
                <Button onClick={handleAddBook}>Submit Book</Button>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Manage Users */}
        <div value="manage-users">
          <Card>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminProfile;
