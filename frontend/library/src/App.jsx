import Button from './Components/Button.jsx';
import Header from './Components/Header.jsx';
import Section from './Components/Section.jsx';
import { useEffect, useState } from 'react';
import About from './Components/About.jsx';
import BookList from './Components/BookList.jsx';
import Login from './Page/Login.jsx';
import AdminLogin from './Page/AdminLogin.jsx';  // ✅ Admin Login Page
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Page/Home.jsx';
import BorrowPage from './Page/BorrowPage.jsx';
import { AnimatePresence } from 'framer-motion';
import SavedBooks from './Page/SavedBooks';
import BorrowedBooks from './Page/BorrowedBooks';
import UserProfile from './Components/UserProfile.jsx';
import EachUserProfile from './Page/EachUserProfile.jsx';
import AdminProfile from './Components/AdminProfile.jsx';  // ✅ Admin Dashboard
import BookProfile from './Components/BookProfile.jsx';

const AppContent = () => {
  const [about, setAbout] = useState(false);
  const [myBooks, setMyBooks] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header setAbout={setAbout} setMyBooks={setMyBooks} />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home about={about} setAbout={setAbout} myBooks={myBooks} setMyBooks={setMyBooks} />} />
            
            {/* User and Admin Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />  {/* ✅ Admin Login Route */}
            
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin-dashboard" element={<AdminProfile />} />  {/* ✅ Admin Dashboard */}
            <Route path="/user-profile/:userId" element={<EachUserProfile />} />
            <Route path="/book-profile/:bookId" element={<BookProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/mybooks" element={<BookList />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/saved-books" element={<SavedBooks />} />
            <Route path="/borrowed-books" element={<BorrowedBooks />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
