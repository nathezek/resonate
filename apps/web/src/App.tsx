import { AnimatePresence, motion } from "motion/react";
import Navbar from "./modules/navbar/navbar";
import Canvas from "./modules/canvas/canvas";

// state imports
import { useState, useRef, useEffect } from "react";
// from zustand
import { useSessionStore } from "./stores/session_store";
import { useKeyboardStore } from "./stores/keyboard_store";
import { useSessionUIState } from "./utils/sesssion_selector";
import { useChatHistoryStore } from "./stores/chat_history_store";
import { useAudioStore } from "./stores/audio_store";
//icons
import { IconDots } from "@tabler/icons-react";
//components
import { InputArea } from "./modules/ui-components/TextArea.tsx";

// --------------------------------- MAIN APP -------------------------------------------- //
function App() {
    const { isActive, startSession } = useSessionStore();
    const { history, loading } = useChatHistoryStore();
    const { sendTextMessage } = useAudioStore();

    const [input, setInput] = useState("");
    const { keyboardEnabled } = useKeyboardStore();
    const { isPaused } = useSessionUIState();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, loading]);

    const handleSend = async () => {
        const currentInput = input;
        setInput(""); // Clear input immediately for UX
        sendTextMessage(currentInput);
    };
    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <AnimatePresence mode="wait">
                {isActive ? (
                    <Canvas>
                        <Navbar key="navbar-unique" />
                        <div className="p-5 max-w-3xl mx-auto w-full flex flex-col self-end h-[90vh]">
                            {/* 1. THE CHAT HISTORY AREA - Now using Store State */}
                            <div
                                ref={scrollRef}
                                className="border border-neutral-100 rounded-xl overflow-y-auto min-h-96 p-4 mb-4 bg-white flex flex-col gap-4"
                            >
                                {/* // If there is no history */}
                                {history.length === 0 && (
                                    <p className="text-neutral-400 animate-pulse text-sm text-center mt-10">
                                        Start a conversation...
                                    </p>
                                )}

                                {/* If conversation started */}
                                {history.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={` min-w-32 p-3 rounded-xl ${msg.role === "user"
                                                ? "bg-neutral-100 max-w-[80%]"
                                                : "bg-none classic-serif w-full text-lg"
                                                }`}
                                        >
                                            <span className="block font-medium text-neutral-600 mb-1 text-[10px] mono opacity-70">
                                                {msg.role === "user"
                                                    ? ""
                                                    : "gemini"}
                                            </span>
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {msg.parts[0].text}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <span className="text-xs animate-pulse px-2 py-1 rounded-md bg-neutral-200">
                                            <IconDots size={16} />
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* THE INPUT AREA */}
                            <AnimatePresence>
                                {keyboardEnabled && !isPaused && (
                                    <motion.div
                                        className="w-xl fixed bottom-4 left-1/2"
                                        key="input-area-container"
                                        initial={{
                                            opacity: 0,
                                            y: 20,
                                            x: "-50%",
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            x: "-50%",
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: 20,
                                            transition: {
                                                duration: 0.18,
                                                ease: "easeIn",
                                            },
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 24,
                                        }}
                                    >
                                        <InputArea
                                            handleSend={handleSend}
                                            input={input}
                                            setInput={setInput}
                                            loading={loading}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Canvas>
                ) : (
                    <motion.div
                        key="start-button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={startSession}
                        className="cursor-pointer"
                    >
                        Start Session
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default App;
