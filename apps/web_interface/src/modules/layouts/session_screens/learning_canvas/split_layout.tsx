import ToolPanel from "../../../conversations/tool_panel";
import ChatHistory from "../../../conversations/chat_history";

//state imports
import { useChat } from "../../../../stores/chat_store";

const SplitLayout = () => {
    const { has_tools, is_tool_panel_open } = useChat();

    // // No tools yet — full-width chat
    // if (!has_tools) {
    //     return <ChatHistory />;
    // }

    // Tools exist but panel is closed — full-width chat + floating button
    if (!is_tool_panel_open || !has_tools) {
        return (
            <div className="flex flex-1 flex-col w-full justify-center pt-64 overflow-hidden h-full relative">
                <ChatHistory />
            </div>
        );
    }

    // Tools exist and panel is open — 50/50 split
    return (
        <div className="flex flex-1 gap-x-4 w-full pt-24 overflow-hidden h-full">
            <div className="w-1/2 h-full flex  flex-col overflow-hidden transition-all duration-300">
                <ToolPanel />
            </div>
            <div className="w-1/2 h-full flex flex-col overflow-hidden transition-all duration-300">
                <ChatHistory />
            </div>
        </div>
    );
};

export default SplitLayout;
