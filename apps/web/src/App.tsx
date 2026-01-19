import { AnimatePresence, motion } from "motion/react";
import Navbar from "./components/main/navbar";

// state imports
import { useState } from "react";

function App() {
    const [session, setSession] = useState<boolean>(false);
    const handleToggle = () => setSession((prev) => !prev);
    return (
        <main className="flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {session ? (
                    <Navbar key="navbar-unique" toggleSession={handleToggle} />
                ) : (
                    <motion.div
                        key="start-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="cursor-pointer"
                        onClick={() => setSession(true)}
                    >
                        Start Session
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default App;
