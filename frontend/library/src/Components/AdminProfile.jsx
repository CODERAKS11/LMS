import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// 🔥 Components
const Button = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>{children}</div>
);

const Input = ({ type = "text", placeholder, value, onChange, className = "" }) => (
  <input
    type={type}
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
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    callNumber: "",
    totalCopies: 0,
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default role
    studentId: "",
    department: "",
    phone: "",
  });

  // ✅ Fetch Data on Component Mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [bookRes, userRes] = await Promise.all([
        axios.get("http://localhost:3001/books", { headers }),
        axios.get("http://localhost:3001/api/users", { headers }),
      ]);

      setBooks(bookRes.data);
      setUsers(userRes.data);
      toast.success("Data fetched successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add Book
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
    } catch (error) {
      console.error("Add Book Error:", error.response);
      toast.error("Failed to add book!");
    }
  };

  // ✅ Add User
  const handleAddUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized: Please log in.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/users/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User added successfully!");
      fetchData();
    } catch (error) {
      console.error("Add User Error:", error.response);
      toast.error("Failed to add user!");
    }
  };

  // ✅ Delete User with Token Authorization
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Unauthorized: Please log in.");
        return;
      }

      console.log("Token being sent:", token);  // ✅ Verify token being sent

      await axios.delete(`http://localhost:3001/api/users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Delete User Error:", error.response);  // ✅ Improved error logging

      if (error.response && error.response.status === 401) {
        toast.error("Unauthorized: Invalid token.");
      } else {
        toast.error("Failed to delete user!");
      }
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="manage-books">
        <TabsTrigger value="manage-books">📚 Manage Books</TabsTrigger>
        <TabsTrigger value="manage-users">👥 Manage Users</TabsTrigger>

        <div value="manage-books">
          <Card>
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <Input name="title" placeholder="Title" onChange={handleInputChange} />
            <Input name="author" placeholder="Author" onChange={handleInputChange} />
            <Input name="genre" placeholder="Genre" onChange={handleInputChange} />
            <Input name="callNumber" placeholder="Call Number" onChange={handleInputChange} />
            <Input name="totalCopies" type="number" placeholder="Total Copies" onChange={handleInputChange} />
            <Button onClick={handleAddBook}>Add Book</Button>
          </Card>

          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Copies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>{book.totalCopies}</td>
                  <td>
                    <Button onClick={() => handleDeleteUser(book._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div value="manage-users">
          <Card>
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <Input name="name" placeholder="Name" onChange={handleUserInputChange} />
            <Input name="email" placeholder="Email" onChange={handleUserInputChange} />
            <Input name="password" type="password" placeholder="Password" onChange={handleUserInputChange} />
            <Button onClick={handleAddUser}>Add User</Button>
          </Card>

          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Button onClick={() => handleDeleteUser(user._id)}>Delete</Button>
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
