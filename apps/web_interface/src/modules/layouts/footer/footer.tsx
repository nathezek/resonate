import { useKeyboard } from "../../../stores/keyboard_store";
import InputArea from "./input_area/input_area";

const Footer = () => {
    const { is_keyboard_enabled } = useKeyboard();
    return (
        <div className="fixed bottom-0 w-full p-8 flex items-center justify-center">
            {is_keyboard_enabled && <InputArea />}
        </div>
    );
};

export default Footer;
