import { useEffect, useRef, useState } from 'react';
import  ReactMarkdown from "react-markdown";
import './App.css';

type TEXT_MESSAGE = {
    type: 'chunk' | 'response' | 'loading' | 'error'
    data: string
}

type TOOL_CALL_MESSAGE = {
    type: 'tool_function_call',
    tool: string,
    args: any
}

type TOOL_RESULT_MESSAGE = {
    type: 'tool_function_result',
    tool: string,
    result: any,
}

type AGENT_MESSAGE = TEXT_MESSAGE | TOOL_CALL_MESSAGE | TOOL_RESULT_MESSAGE;


const AgentResponseDisplay = ({ response }: { response: AGENT_MESSAGE }) => {
    if (response.type === "chunk" || response.type === "response") {
        return (
            <ReactMarkdown>
                {response.data}
            </ReactMarkdown>
        )
    }

    if (response.type === "tool_function_call") {
        return (
            <div>
                <h4>Running { response.tool}</h4>
                <pre>
                    {JSON.stringify(response.args, null, 2)}
                </pre>
            </div>
        )
    }

    if (response.type === "tool_function_result") {
        const result = response.result;

        if (!result) {
                return <div>Waiting for result...</div>;
        }

        return (
            <div className='border border-green-600/40'>
                <h4>{ response.tool} output:</h4>
                {result.success ? (
                    <pre>
                        {result.output}
                    </pre>
                ) : (
                        <pre>
                            Error: {result.error}
                        </pre>
                )}
            </div>
        )
    }

    if (response.type === "loading") {
        return (
            <span>Let me think...</span>
        )
    }

    if (response.type === "error") {
        return (
            <span>{ response.data}</span>
        )
    }

    return null;
}



function App() {
    const [input, setInput] = useState('');
    // Initialize with empty strings so the UI doesn't crash on undefined
    const [agent_response, setAgentResponse] = useState<AGENT_MESSAGE[]>([]);
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
                    setAgentResponse((prev) => {
                        const last = prev[prev.length - 1];

                        // If last message is a chunk, append to it
                        if (last && last.type === "chunk") {
                            // Check if this chunk is already in the data (dedup)
                            if (last.data.includes(incoming.data)) {
                                return prev; // Skip duplicate
                            }
                            return [
                                ...prev.slice(0, -1),
                                { ...last, data: last.data + incoming.data }
                            ];
                        }

                        return [...prev, incoming];
                    });
                } else if (incoming.type === "response") {
                    console.log("Received response");
                    return;
                } else if (incoming.type === "tool_function_call") {
                    setAgentResponse((prev) => [...prev, incoming]);
                } else if (incoming.type === "tool_function_result") {
                    setAgentResponse((prev) => [...prev, incoming]);
                }
            };

            socket.onerror = (err) => console.error("❌ WS Error:", err);
            socket.onclose = () => console.log("🔌 WS Disconnected");

            ws.current = socket;
        };

        connect();

        return () => {
            // Clean up: stop the socket if the component unmounts
            if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
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
                setAgentResponse([{ data: '', type: 'loading' }]);

                // 2. Send the message
                ws.current.send(input);
                setInput('');
            } else {
                console.warn("⚠️ Cannot send message: WebSocket is not open yet.");
                //Show an alert to user if websocket connection is not established
                setAgentResponse([{ data: 'Error: Not connected to server. Please refresh.', type: 'error' }]);
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
                {agent_response.map((res, idx) => (
                    <AgentResponseDisplay  key={idx} response={res}/>
                ))}
            </div>
        </div>
    );
}

export default App;
