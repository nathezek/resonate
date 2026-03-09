import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import ShikiHighlighter from "react-shiki";
import ThemesProvider from "./modules/themes/themes_provider";
import Navbar from "./modules/navbar/navbar";
import { useSession } from "./stores/session_store";
import LearningCanvas from "./modules/learning_canvas/learning_canvas";

type TEXT_MESSAGE = {
    type: "chunk" | "response" | "loading" | "error";
    data: string;
};

type TOOL_CALL_MESSAGE = {
    type: "tool_function_call";
    tool: string;
    args: any;
};

type TOOL_RESULT_MESSAGE = {
    type: "tool_function_result";
    tool: string;
    result: any;
};

type AGENT_MESSAGE = TEXT_MESSAGE | TOOL_CALL_MESSAGE | TOOL_RESULT_MESSAGE;

const AgentResponseDisplay = ({ response }: { response: AGENT_MESSAGE }) => {
    if (response.type === "chunk" || response.type === "response") {
        return (
            <ReactMarkdown
                components={{
                    pre({ children }) {
                        // Fenced code blocks render as <pre><code className="language-x">
                        // Extract the inner code element and use SyntaxHighlighter
                        const codeChild = children as React.ReactElement<{
                            className?: string;
                            children?: React.ReactNode;
                        }>;
                        const className = codeChild?.props?.className || "";
                        const match = /language-(\w+)/.exec(className);

                        if (match) {
                            const codeString = String(
                                codeChild.props.children,
                            ).replace(/\n$/, "");
                            return (
                                <ShikiHighlighter
                                    theme={"catppuccin-mocha"}
                                    language={match[1]}
                                >
                                    {codeString}
                                </ShikiHighlighter>
                            );
                        }

                        return <pre>{children}</pre>;
                    },
                    code({ className, children, ...props }) {
                        // Inline code only — simple monospace styling
                        return (
                            <code
                                className={`${className ?? ""} inline-code`}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {response.data}
            </ReactMarkdown>
        );
    }

    if (response.type === "tool_function_call") {
        // Extract code from args if it's a code execution tool
        const code = response.args?.code;

        return (
            <div className="tool-call-block">
                <div className="my-4 p-1 rounded-md bg-neutral-700 px-3 font-medium text-sm">
                    Running...
                </div>
                <div className="bg-neutral-700 font-mono">
                    {code ? (
                        <ShikiHighlighter
                            theme={"catppuccin-mocha"}
                            language="python"
                        >
                            {code}
                        </ShikiHighlighter>
                    ) : (
                        <ShikiHighlighter
                            theme={"catppuccin-mocha"}
                            language="json"
                        >
                            {JSON.stringify(response.args, null, 2)}
                        </ShikiHighlighter>
                    )}
                </div>
            </div>
        );
    }

    if (response.type === "tool_function_result") {
        const result = response.result;

        if (!result) {
            return (
                <div className="tool-result-block">Waiting for result...</div>
            );
        }

        return (
            <div
                className={`tool-result-block ${result.success ? "success" : "error"}`}
            >
                <div className="tool-result-header">
                    {result.success ? "✅" : "❌"} {response.tool} output
                </div>
                <ShikiHighlighter theme={"catppuccin-mocha"} language="text">
                    {result.success ? result.output : `Error: ${result.error}`}
                </ShikiHighlighter>
            </div>
        );
    }

    if (response.type === "loading") {
        return <span>Let me think...</span>;
    }

    if (response.type === "error") {
        return <span>{response.data}</span>;
    }

    return null;
};

function App() {
    const [input, setInput] = useState("");
    const [agent_response, setAgentResponse] = useState<AGENT_MESSAGE[]>([]);
    const { has_session_started, start_session } = useSession();
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
                const incoming: AGENT_MESSAGE = JSON.parse(event.data);

                if (incoming.type === "chunk") {
                    setAgentResponse((prev) => {
                        const last = prev[prev.length - 1];

                        // If last message is a chunk, append to it
                        if (last && last.type === "chunk") {
                            // Check if this chunk is already in the data (dedup)
                            if (last.data.endsWith(incoming.data)) {
                                return prev; // Skip duplicated responses
                            }
                            return [
                                ...prev.slice(0, -1),
                                { ...last, data: last.data + incoming.data },
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
            didCleanup = true;
            if (
                ws.current &&
                (ws.current.readyState === WebSocket.OPEN ||
                    ws.current.readyState === WebSocket.CONNECTING)
            ) {
                ws.current.close();
            }
        };
    }, []);

    // --- Send User Messages ----
    const sendMessage = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Check if the socket exists AND is fully connected (readyState === 1)
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            // 1. Clear previous response so the new one starts fresh
            setAgentResponse([{ data: "", type: "loading" }]);

            // 2. Send the message
            ws.current.send(input);
            setInput("");
        } else {
            console.warn("⚠️ Cannot send message: WebSocket is not open yet.");
            //Show an alert to user if websocket connection is not established
            setAgentResponse([
                {
                    data: "Error: Not connected to server. Please refresh.",
                    type: "error",
                },
            ]);
        }
    };

    return (
        <ThemesProvider>
            {has_session_started ? (
                <>
                    <LearningCanvas>
                        <Navbar />
                        <div className="p-8 flex flex-col items-center justify-center gap-y-4">
                            <form onSubmit={sendMessage}>
                                <input
                                    className="border p-2 rounded"
                                    type="text"
                                    placeholder="Seek and you shall find..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Send
                                </button>
                            </form>

                            <h1 className="mb-4">Agent response</h1>
                            <div className="whitespace-pre-wrap min-h-25 lg:w-xl text-neutral-700">
                                {agent_response.map((res, idx) => (
                                    <AgentResponseDisplay
                                        key={idx}
                                        response={res}
                                    />
                                ))}
                            </div>
                        </div>
                    </LearningCanvas>
                </>
            ) : (
                <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
                    <button onClick={() => start_session()}>
                        Start Session
                    </button>
                </div>
            )}
        </ThemesProvider>
    );
}

export default App;
