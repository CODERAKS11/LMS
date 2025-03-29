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
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  
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
      const bookRes = await axios.get("http://localhost:3001/books", { headers });

      setBooks(bookRes.data);
      toast.success("Books fetched successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch books!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
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

  const handleDeleteBook = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized: Please log in.");
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/admin/delete-book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Book deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Delete Book Error:", error);
      toast.error("Failed to delete book!");
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="manage-books">
        <TabsTrigger value="manage-books">📚 Manage Books</TabsTrigger>

        <div value="manage-books">
          <Card>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Books</h2>
              <Button onClick={() => setShowAddBookForm((prev) => !prev)}>
                {showAddBookForm ? "Hide Form" : "Add Book"}
              </Button>
            </div>

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
                <Button onClick={handleAddBook} className="mt-4">Submit Book</Button>
              </div>
            )}
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
                    <Button onClick={() => handleDeleteBook(book._id)} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </Button>
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
