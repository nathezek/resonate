import { useChat, type AGENT_CONTENT } from "../../stores/chat_store";
import ShikiHighlighter from "react-shiki";

const ToolPanel = () => {
    const { messages } = useChat();

    const tool_content: AGENT_CONTENT[] = [];

    messages.forEach((message) => {
        if (message.role === "agent") {
            message.agent_content.forEach((content) => {
                if (
                    content.type === "tool_function_call" ||
                    content.type === "tool_function_result"
                ) {
                    tool_content.push(content);
                }
            });
        }
    });

    if (tool_content.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-400">
                <span>Tools will appear here...</span>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto space-y-4">
            <h3>Tool Output</h3>
            {tool_content.map((content, index) => (
                <ToolItem key={index} content={content} />
            ))}
        </div>
    );
};

export default ToolPanel;

const ToolItem = ({ content }: { content: AGENT_CONTENT }) => {
    if (content.type === "tool_function_call") {
        const code = content.args?.code;

        return (
            <div className="rounded-lg overflow-hidden border border-neutral-700">
                <div className="bg-neutral-700 text-neutral-200 px-3 py-2 text-sm flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    <span>Running {content.tool}</span>
                </div>
                <div className="bg-neutral-900">
                    {code ? (
                        <ShikiHighlighter
                            theme="catppuccin-mocha"
                            language="python"
                        >
                            {code}
                        </ShikiHighlighter>
                    ) : (
                        <pre className="p-3 text-sm text-neutral-300 overflow-x-auto">
                            {JSON.stringify(content.args, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        );
    }

    if (content.type === "tool_function_result") {
        const result = content.result;

        if (!result) {
            return (
                <div className="text-neutral-400 p-3">
                    Waiting for result...
                </div>
            );
        }

        return (
            <div className="rounded-lg overflow-hidden border border-neutral-700">
                <div
                    className={`px-3 py-2 text-sm flex items-center gap-2 ${
                        result.success
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                    }`}
                >
                    <span>{result.success ? "✅" : "❌"}</span>
                    <span>{content.tool} output</span>
                </div>
                <div className="bg-neutral-900 p-3">
                    <pre className="text-sm text-neutral-200 whitespace-pre-wrap overflow-x-auto">
                        {result.success
                            ? result.output
                            : `Error: ${result.error}`}
                    </pre>
                </div>
            </div>
        );
    }

    return null;
};
