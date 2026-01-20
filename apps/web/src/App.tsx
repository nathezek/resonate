import { AnimatePresence, motion } from "motion/react";
import Navbar from "./modules/navbar/navbar";

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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
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
