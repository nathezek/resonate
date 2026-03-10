import { useState } from "react";
import Input from "../../../ui/components/input";
import { IconArrowUp } from "@tabler/icons-react";

const InputArea = () => {
    const [input, SetInput] = useState("");

    const handleSend = () => {};
    return (
        <div className="flex items-center gap-x-2 bg-neutral-200/90 w-full lg:w-xl text-neutral-700 rounded-2xl p-1.5 pl-3 h-13">
            <Input
                type="text"
                value={input}
                setInput={SetInput}
                handleSend={handleSend}
                placeholder="Seek and you shall find..."
            />
            <button className="bg-neutral-700 text-neutral-100 rounded-xl h-full w-16 flex items-center justify-center">
                <IconArrowUp size={18} />
            </button>
        </div>
    );
};

export default InputArea;
