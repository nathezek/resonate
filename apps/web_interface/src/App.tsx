import { useEffect, useRef } from "react";
import ThemesProvider from "./modules/themes/themes_provider";
import Navbar from "./modules/layouts/navbar/navbar";
import { useSession } from "./stores/session_store";
import LearningCanvas from "./modules/layouts/session_screens/learning_canvas/learning_canvas";
import StartSessionScreen from "./modules/layouts/session_screens/start_session_screen/start_session_screen";
import DailingScreen from "./modules/layouts/session_screens/dailing_screen/dailing_screen";
import Footer from "./modules/layouts/footer/footer";
import { useChat, type AGENT_CONTENT } from "./stores/chat_store";
import ChatHistory from "./modules/conversations/chat_history";

function App() {
    const { session_status } = useSession();

    const {
        append_agent_chunk,
        add_agent_tool_call,
        add_agent_tool_result,
        finish_agent_response,
    } = useChat();

    // WebSocket related
    const ws = useRef<WebSocket | null>(null);

    // ---- Establish WebSocket Connection ------
    useEffect(() => {
        let didCleanup = false;

        const connect = () => {
            const socket = new WebSocket("ws://localhost:3001/ws");

            socket.onopen = () => {
                // If StrictMode already ran cleanup, close this stale socket
                if (didCleanup) {
                    socket.close();
                    return;
                }
                console.log("✅ WS Connected");
            };

            socket.onmessage = (event) => {
                const incoming: AGENT_CONTENT = JSON.parse(event.data);

                if (incoming.type === "chunk") {
                    append_agent_chunk(incoming.data);
                } else if (incoming.type === "response") {
                    console.log("Received response");
                    finish_agent_response();
                } else if (incoming.type === "tool_function_call") {
                    add_agent_tool_call(incoming.tool, incoming.args);
                } else if (incoming.type === "tool_function_result") {
                    add_agent_tool_result(incoming.tool, incoming.result);
                }
            };

            socket.onerror = (err) => console.error("❌ WS Error:", err);
            socket.onclose = () => console.log("🔌 WS Disconnected");

            ws.current = socket;
        };

        connect();

        return () => {
            didCleanup = true;
            if (
                ws.current &&
                (ws.current.readyState === WebSocket.OPEN ||
                    ws.current.readyState === WebSocket.CONNECTING)
            ) {
                ws.current.close();
            }
        };
    }, [
        append_agent_chunk,
        add_agent_tool_call,
        add_agent_tool_result,
        finish_agent_response,
    ]);

    // --- Send User Messages ----
    const sendMessage = (message: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        } else {
            console.warn("⚠️ Cannot send message: WebSocket is not open yet.");
        }
    };

    return (
        <ThemesProvider>
            {session_status === "idle" && <StartSessionScreen />}
            {session_status === "dialing" && <DailingScreen />}
            {session_status === "active" && (
                <>
                    <LearningCanvas>
                        <Navbar />
                        <ChatHistory />
                        <Footer onSend={sendMessage} />
                    </LearningCanvas>
                </>
            )}
        </ThemesProvider>
    );
}

export default App;
