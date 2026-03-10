import ShikiHighlighter from "react-shiki";
import type { AGENT_CONTENT } from "../../stores/chat_store";
import ReactMarkdown from "react-markdown";

const AgentResponseDisplay = ({ response }: { response: AGENT_CONTENT }) => {
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
                                className={`${className ?? ""} bg-neutral-300 px-1 rounded-sm py-px inline-code`}
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
                <div className="my-4 p-1 rounded-md bg-neutral-300 px-3 font-medium text-sm">
                    Running...
                </div>
                <div className="font-mono">
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
                <div className="mt-4 mb-2 p-1 rounded-md bg-neutral-300 px-3 font-medium text-sm">
                    {result.success ? "✅" : "❌"} Code Output
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

export default AgentResponseDisplay;
