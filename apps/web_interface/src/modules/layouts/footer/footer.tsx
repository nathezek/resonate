import { useKeyboard } from "../../../stores/keyboard_store";
import InputArea from "./input_area/input_area";

type FOOTER_TYPES = {
    onSend: (message: string) => void;
};

const Footer = ({ onSend }: FOOTER_TYPES) => {
    const { is_keyboard_enabled } = useKeyboard();
    return (
        <div className="fixed bottom-0 w-full p-8 flex items-center justify-center">
            {is_keyboard_enabled && <InputArea onSend={onSend} />}
        </div>
    );
};

export default Footer;
