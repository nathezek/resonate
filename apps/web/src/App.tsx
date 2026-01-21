import { AnimatePresence, motion } from "motion/react";
import Navbar from "./modules/navbar/navbar";
import Canvas from "./modules/canvas/canvas";

// state imports
import { useState } from "react";
import { askGemini, type ChatMessage } from "./api/gemini";

function App() {
    const [session, setSession] = useState<boolean>(false);
    const handleToggle = () => setSession((prev) => !prev);

    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const [history, setHistory] = useState<ChatMessage[]>([]);

    const handleSend = async () => {
        if (!input) return;

        // 1. Create the new user message
        const newUserMsg: ChatMessage = {
            role: "user",
            parts: [{ text: input }],
        };

        // 2. Add it to a temporary array (so we can send it immediately)
        const updatedHistory = [...history, newUserMsg];

        setLoading(true);
        setInput("");

        try {
            // 3. Send the WHOLE history to Rust
            const responseText = await askGemini(updatedHistory);

            // 4. Update state with BOTH the user message and the AI's reply
            setHistory([
                ...updatedHistory,
                { role: "model", parts: [{ text: responseText }] },
            ]);
            setOutput(responseText);
        } catch (err) {
            setOutput("Error: Brain disconnected.");
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
                        <div
                            style={{
                                padding: "20px",
                                maxWidth: "800px",
                                margin: "0 auto",
                            }}
                        >
                            <h1>Gemini AI Explorer</h1>

                            {/* 1. THE CHAT HISTORY AREA */}
                            <div
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    height: "300px",
                                    overflowY: "scroll",
                                    padding: "15px",
                                    marginBottom: "20px",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {history.map((msg, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            marginBottom: "15px",
                                            textAlign:
                                                msg.role === "user"
                                                    ? "right"
                                                    : "left",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "inline-block",
                                                padding: "10px",
                                                borderRadius: "12px",
                                                maxWidth: "80%",
                                                backgroundColor:
                                                    msg.role === "user"
                                                        ? "#007bff"
                                                        : "#e9ecef",
                                                color:
                                                    msg.role === "user"
                                                        ? "white"
                                                        : "black",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            <strong>
                                                {msg.role === "user"
                                                    ? "You"
                                                    : "Gemini"}
                                                :
                                            </strong>
                                            <p style={{ margin: "5px 0 0" }}>
                                                {msg.parts[0].text}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator inside the chat flow */}
                                {loading && (
                                    <div
                                        style={{
                                            textAlign: "left",
                                            color: "#888",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        Gemini is thinking...
                                    </div>
                                )}
                            </div>

                            {/* 2. THE INPUT AREA */}
                            <div style={{ display: "flex", gap: "10px" }}>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Follow up or ask something new..."
                                    rows={2}
                                    style={{
                                        flexGrow: 1,
                                        padding: "10px",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc",
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading}
                                    style={{
                                        padding: "0 20px",
                                        cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                    }}
                                >
                                    Send
                                </button>
                            </div>

                            {/* 3. UTILITY BUTTONS */}
                            <button
                                onClick={() => setHistory([])}
                                style={{
                                    marginTop: "10px",
                                    background: "none",
                                    border: "none",
                                    color: "red",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                }}
                            >
                                Clear Conversation History
                            </button>
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
