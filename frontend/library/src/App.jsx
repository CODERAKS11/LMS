import Button from './Components/Button.jsx'
import Header from './Components/Header.jsx'
// import MyBooks from './Components/MyBooks.jsx'
import Section from './Components/Section.jsx'
import { useEffect,useState } from 'react'
import About from './Components/About.jsx'
import BookList from './Components/BookList.jsx'
import Login from './Page/Login.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import ToggleOption from './Components/ToggleOption.jsx'
import Home from './Page/Home.jsx'
import BorrowPage from './Page/BorrowPage.jsx';
import { AnimatePresence } from 'framer-motion';
import SavedBooks from './Page/SavedBooks';
import BorrowedBooks from './Page/BorrowedBooks';
import UserProfile from './Components/UserProfile.jsx'


const AppContent = () => {
  const [about, setAbout]=useState(false)
  const [myBooks, setMyBooks]=useState(false)
  // const [savedbooks, setSavedBooks]=useState([])
  

  // const handleSavedBook = (book)=>{
  //   if(!savedbooks.some((b)=>b.id === book.id)){
  //     setSavedBooks([...savedbooks,book])
  //   }
  // }
  return (
    <div className="min-h-screen flex flex-col">
      {/* <ToggleOption setAbout={setAbout} setMyBooks={setMyBooks}/> */}

      <Header setAbout={setAbout} setMyBooks={setMyBooks} />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <Home about={about} setAbout={setAbout} myBooks={myBooks} setMyBooks={setMyBooks} />
            } />
            
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/mybooks" element={<BookList />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/saved-books" element={<SavedBooks />} />
            <Route path="/borrowed-books" element={<BorrowedBooks />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App