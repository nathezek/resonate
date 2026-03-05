import { useEffect, useRef, useState } from 'react';
import  ReactMarkdown from "react-markdown";
import './App.css';

type AGENT_MESSAGE = {
    data: string;
    type: string;
}

function App() {
    const [input, setInput] = useState('');
    // Initialize with empty strings so the UI doesn't crash on undefined
    const [agent_response, setAgentResponse] = useState<AGENT_MESSAGE>({ data: '', type: '' });
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const socket = new WebSocket("ws://localhost:3001/ws");

            socket.onopen = () => {
                console.log("✅ WS Connected");
            };

            socket.onmessage = (event) => {
                const incoming: AGENT_MESSAGE = JSON.parse(event.data);
                if (incoming.type === 'chunk') {
                    setAgentResponse((prev) => ({
                        type: 'chunk',
                        data: prev.data + incoming.data
                    }));
                } else if (incoming.type === 'response') {
                    setAgentResponse({ type: 'response', data: incoming.data });
                }
            };

            socket.onerror = (err) => console.error("❌ WS Error:", err);
            socket.onclose = () => console.log("🔌 WS Disconnected");

            ws.current = socket;
        };

        connect();

        return () => {
            // Clean up: stop the socket if the component unmounts
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const sendMessage = (e: React.SubmitEvent) => {
            e.preventDefault();
            if (!input.trim()) return;

            // Check if the socket exists AND is fully connected (readyState === 1)
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                // 1. Clear previous response so the new one starts fresh
                setAgentResponse({ data: '', type: 'loading' });

                // 2. Send the message
                ws.current.send(input);
                setInput('');
            } else {
                console.warn("⚠️ Cannot send message: WebSocket is not open yet.");
                //Show an alert to user if websocket connection is not established
                setAgentResponse({ data: 'Error: Not connected to server. Please refresh.', type: 'error' });
            }
    };

    return (
        <div className="p-8 flex flex-col items-center justify-center gap-y-4">
            <form onSubmit={sendMessage}>
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder='Ask your tutor...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
            </form>

            <h1 className="mb-4">Agent response</h1>
            <div className="whitespace-pre-wrap min-h-25 lg:w-xl text-neutral-400">
                <ReactMarkdown>
                    {agent_response.data}
               </ReactMarkdown>
                {agent_response.type === 'loading' && <span className="animate-pulse">...</span>}
            </div>
        </div>
    );
}

export default App;
