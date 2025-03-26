import Header from "../Components/Header";
import Section from "../Components/Section";
import About from "../Components/About";
import BookList from "../Components/BookList";
import { motion, AnimatePresence } from "framer-motion";

const Home = ({about, setAbout, myBooks, setMyBooks}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-hidden"
        >
            <AnimatePresence mode="wait">
                {about ? (
                    <motion.div
                        key="about"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-auto"
                    >
                        <About />
                    </motion.div>
                ) : myBooks ? (
                    <motion.div
                        key="mybooks"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-auto"
                    >
                        <BookList />
                    </motion.div>
                ) : (
                    <motion.div
                        key="section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-auto"
                    >
                        <Section />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Home;