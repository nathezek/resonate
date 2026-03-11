import ToolPanel from "../../../conversations/tool_panel";
import ChatHistory from "../../../conversations/chat_history";

//state imports
import { useChat } from "../../../../stores/chat_store";

const SplitLayout = () => {
    const { has_tools } = useChat();

    if (!has_tools) {
        return <ChatHistory />;
    }

    return (
        <div className="flex flex-1 gap-x-4 w-full pt-24 overflow-hidden border h-full">
            <div className="w-1/2 h-full flex border flex-col overflow-hidden">
                <ToolPanel />
            </div>
            <div className="w-1/2 h-full flex flex-col border overflow-hidden">
                <ChatHistory />
            </div>
        </div>
    );
};

export default SplitLayout;
