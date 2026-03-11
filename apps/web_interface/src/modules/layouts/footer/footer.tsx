import { IconBoxAlignTopRightFilled } from "@tabler/icons-react";
import { useChat } from "../../../stores/chat_store";
import { useKeyboard } from "../../../stores/keyboard_store";
import InputArea from "./input_area/input_area";

type FOOTER_TYPES = {
    onSend: (message: string) => void;
};

const Footer = ({ onSend }: FOOTER_TYPES) => {
    const { is_keyboard_enabled } = useKeyboard();
    const { is_tool_panel_open, toggle_tool_panel } = useChat();
    return (
        <div className="fixed bottom-0 z-30 w-full p-4 flex items-center justify-between">
            {!is_tool_panel_open ? (
                <button
                    onClick={toggle_tool_panel}
                    className="flex items-center gap-1.5 w-14 justify-center h-10 rounded-xl bg-neutral-700 text-neutral-200 text-xs hover:bg-neutral-600 transition-colors cursor-pointer"
                >
                    <span>
                        <IconBoxAlignTopRightFilled size={18} />
                    </span>
                </button>
            ) : (
                <div className="w-14" />
            )}
            {is_keyboard_enabled && <InputArea onSend={onSend} />}

            <div className="w-14" />
        </div>
    );
};

export default Footer;
