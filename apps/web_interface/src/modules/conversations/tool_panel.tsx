import { useEffect, useRef } from "react";
import {
    useChat,
    type AGENT_CONTENT,
    type CHAT_MESSAGE,
    type TOOL_CALL_MESSAGE,
    type TOOL_RESULT_MESSAGE,
} from "../../stores/chat_store";
import ShikiHighlighter from "react-shiki";

const ToolPanel = () => {
    const { messages } = useChat();
    const containerRef = useRef<HTMLDivElement>(null);
    const prevToolCountRef = useRef<number>(0);

    const message_with_tool = messages.filter((message) => {
        if (message.role !== "agent") return false;

        return message.agent_content.some(
            (content) =>
                content.type === "tool_function_call" ||
                content.type === "tool_function_result",
        );
    });

    const toolCount = message_with_tool.length;
    const latestToolId =
        message_with_tool[message_with_tool.length - 1]?.id;

    // Auto-scroll to latest tool turn when new tools arrive
    useEffect(() => {
        if (toolCount > prevToolCountRef.current && latestToolId) {
            requestAnimationFrame(() => {
                const element = document.getElementById(
                    `tool-turn-${latestToolId}`,
                );

                if (element && containerRef.current) {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect =
                        containerRef.current.getBoundingClientRect();
                    const scrollOffset =
                        containerRef.current.scrollTop +
                        (elementRect.top - containerRect.top);

                    containerRef.current.scrollTo({
                        top: scrollOffset,
                        behavior: "smooth",
                    });
                }
            });
        }

        prevToolCountRef.current = toolCount;
    }, [toolCount, latestToolId]);

    if (message_with_tool.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-400">
                <span>Tools will appear here...</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-full overflow-y-auto space-y-2 flex flex-col items-start pb-[100vh]"
        >
            <h3>Tool Output</h3>
            {message_with_tool.map((message, index) => (
                <ToolTurn
                    key={index}
                    message={message}
                    turn_number={index + 1}
                />
            ))}
        </div>
    );
};

export default ToolPanel;

//  ----------------------------- Sub Components -------------------------------

type TOOL_TURN_TYPES = {
    message: CHAT_MESSAGE;
    turn_number: number;
};

const ToolTurn = ({ message, turn_number }: TOOL_TURN_TYPES) => {
    const tool_content = message.agent_content.filter(
        (content): content is TOOL_CALL_MESSAGE | TOOL_RESULT_MESSAGE =>
            content.type === "tool_function_call" ||
            content.type === "tool_function_result",
    );

    return (
        <div className="mb-4" id={`tool-turn-${message.id}`}>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-neutral-800 border-b border-neutral-700 px-3 py-2">
                <span className="text-xs font-medium text-neutral-400">
                    Turn {turn_number}
                </span>
            </div>

            {/* Tool Items */}
            <div className="space-y-2 p-2">
                {tool_content.map((content, index) => (
                    <ToolItem key={index} content={content} />
                ))}
            </div>
        </div>
    );
};

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
