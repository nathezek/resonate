import { useState } from "react";
import Input from "../../../ui/components/input";
import { IconArrowUp } from "@tabler/icons-react";
import { useChat } from "../../../../stores/chat_store";

type INPUT_AREA_TYPES = {
    onSend: (message: string) => void;
};

const InputArea = ({ onSend }: INPUT_AREA_TYPES) => {
    const [input, SetInput] = useState("");
    const { add_user_message, start_agent_response, is_agent_responding } =
        useChat();

    const handleSend = () => {
        // Checks
        if (!input.trim()) return;
        if (is_agent_responding) return;

        // Apply actions
        add_user_message(input);
        start_agent_response();
        onSend(input);
        SetInput("");
    };
    return (
        <div className="flex items-center gap-x-2 bg-neutral-200/95 backdrop-blur-xs w-full lg:w-xl text-neutral-700 rounded-2xl p-1.5 pl-3 h-13">
            <Input
                type="text"
                value={input}
                setInput={SetInput}
                handleSend={handleSend}
                placeholder="Seek and you shall find..."
            />
            <button
                onClick={handleSend}
                disabled={is_agent_responding}
                className={`bg-neutral-700 text-neutral-100 rounded-xl h-full w-16 flex items-center justify-center ${is_agent_responding && "cursor-not-allowed"}`}
            >
                <IconArrowUp size={18} />
            </button>
        </div>
    );
};

export default InputArea;
