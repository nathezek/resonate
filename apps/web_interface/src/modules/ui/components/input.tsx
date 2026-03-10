import { useEffect, useRef } from "react";

type TYPE_INPUT = {
    type: "text" | "radio" | "number";
    placeholder: string;
    setInput: (val: string) => void;
    value: string;
    handleSend: () => void;
    styling?: string;
};

const Input = ({
    type = "text",
    styling,
    value,
    setInput,
    placeholder,
    handleSend,
}: TYPE_INPUT) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <input
            type={type}
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            className={`w-full p-2 outline-none text-sm bg-transparent text-neutral-800 dark:text-neutral-200 ${styling}`}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
        />
    );
};

export default Input;
