import { AnimatePresence, motion } from "motion/react";
import Navbar from "./modules/navbar/navbar";
import Canvas from "./modules/canvas/canvas";

// state imports
import { useState } from "react";
import { askGemini } from "./api/gemini";

function App() {
    const [session, setSession] = useState<boolean>(false);
    const handleToggle = () => setSession((prev) => !prev);

    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input) return;

        setLoading(true);
        setOutput("Thinking...");

        try {
            // Executing the Request-Response cycle
            const responseText = await askGemini(input);
            setOutput(responseText);
        } catch (err) {
            setOutput("Error: Could not reach the AI.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {session ? (
                    <Canvas>
                        <Navbar
                            key="navbar-unique"
                            toggleSession={handleToggle}
                        />

                        <div style={{ padding: "20px", maxWidth: "600px" }}>
                            <h1>Gemini AI Explorer</h1>

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me something..."
                                rows={4}
                                style={{ width: "100%" }}
                            />

                            <button onClick={handleSend} disabled={loading}>
                                {loading ? "Sending..." : "Send Request"}
                            </button>

                            <div
                                style={{
                                    marginTop: "20px",
                                    whiteSpace: "pre-wrap",
                                    border: "1px solid #ccc",
                                    padding: "10px",
                                }}
                            >
                                <strong>Response:</strong>
                                <p>{output}</p>
                            </div>
                        </div>
                    </Canvas>
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
