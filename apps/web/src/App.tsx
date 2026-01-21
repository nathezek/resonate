import { AnimatePresence, motion } from "motion/react";
import Navbar from "./modules/navbar/navbar";
import Canvas from "./modules/canvas/canvas";

// AI logic imports
import { askGemini, type ChatMessage } from "./api/gemini";

// state imports
import { useState, useRef, useEffect } from "react";
import { useSessionStore } from "./stores/session_store";

function App() {
    const { isActive, startSession } = useSessionStore();

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);

    // Ref to automatically scroll to the latest message
    const scrollRef = useRef<HTMLDivElement>(null);

    // Effect to scroll to bottom whenever history changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const newUserMsg: ChatMessage = {
            role: "user",
            parts: [{ text: input }],
        };

        const updatedHistory = [...history, newUserMsg];
        setHistory(updatedHistory); // Update UI immediately with user message
        setLoading(true);
        setInput("");

        try {
            const responseText = await askGemini(updatedHistory);

            setHistory([
                ...updatedHistory,
                { role: "model", parts: [{ text: responseText }] },
            ]);
        } catch (err) {
            setHistory([
                ...updatedHistory,
                {
                    role: "model",
                    parts: [
                        {
                            text: "Error: Brain disconnected. Check your connection.",
                        },
                    ],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <AnimatePresence mode="wait">
                {isActive ? (
                    <Canvas>
                        <Navbar key="navbar-unique" />
                        <div className="p-5 max-w-3xl mx-auto w-full flex flex-col h-[80vh]">
                            <h1 className="text-2xl font-bold mb-4 text-center">
                                Gemini AI Explorer
                            </h1>

                            {/* 1. THE CHAT HISTORY AREA */}
                            <div
                                ref={scrollRef}
                                className="border border-gray-200 rounded-xl overflow-y-auto p-4 mb-4 bg-white shadow-inner flex flex-col gap-4"
                            >
                                {history.length === 0 && (
                                    <p className="text-gray-400 text-center mt-10">
                                        Start a conversation...
                                    </p>
                                )}

                                {history.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                                msg.role === "user"
                                                    ? "bg-blue-600 text-white rounded-tr-none"
                                                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                                            }`}
                                        >
                                            <span className="block font-bold mb-1 text-[10px] uppercase tracking-wider opacity-70">
                                                {msg.role === "user"
                                                    ? "You"
                                                    : "Gemini"}
                                            </span>
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {msg.parts[0].text}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl rounded-tl-none animate-pulse">
                                            <span className="text-xs text-gray-400 italic">
                                                Gemini is thinking...
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. THE INPUT AREA */}
                            <div className="flex gap-2">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className={`px-6 rounded-lg font-medium transition-colors ${
                                        loading
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    Send
                                </button>
                            </div>

                            {/* 3. UTILITY BUTTONS */}
                            <button
                                onClick={() => setHistory([])}
                                className="mt-2 text-red-500 text-xs self-start hover:underline"
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
                        className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition-all"
                        onClick={startSession}
                    >
                        Start Session
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default App;
