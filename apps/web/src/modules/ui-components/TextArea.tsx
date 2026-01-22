import { IconArrowUp, IconLoader } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

interface InputAreaProps {
    handleSend: () => void;
    input: string;
    setInput: (val: string) => void;
    loading: boolean;
}

export const InputArea = ({
    handleSend,
    input,
    setInput,
    loading,
}: InputAreaProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="flex flex-col gap-2 h-fit mt-2 text-neutral-100 w-full">
            <div className="flex w-full h-[3.15rem] gap-x-2 bg-neutral-800 rounded-2xl p-[0.395rem] pl-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder=" Type your message..."
                    ref={inputRef}
                    className="px-4 text-sm tracking-wide flex items-center flex-1 pt-0.5 outline-none bg-transparent"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <button
                    type="button" // Good practice
                    onClick={handleSend} // FIXED: This was missing!
                    disabled={loading || !input.trim()}
                    className={`px-4 rounded-xl font-medium transition-colors cursor-pointer ${
                        loading
                            ? "bg-neutral-500 cursor-not-allowed"
                            : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                    }`}
                >
                    {loading ? (
                        <IconLoader size={18} className="animate-spin" />
                    ) : (
                        <IconArrowUp size={18} />
                    )}
                </button>
            </div>
        </div>
    );
};
