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
        <div className="flex flex-1 gap-x-4">
            <div className="w-1/2 pt-24">
                <ToolPanel />
            </div>
            <div className="w-1/2 pt-24">
                <ChatHistory />
            </div>
        </div>
    );
};

export default SplitLayout;
