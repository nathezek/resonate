import {
    IconKeyboard,
    IconMicrophone,
    IconPlayerPause,
    IconPlayerStop,
} from "@tabler/icons-react";
import { MicVisualizer } from "./components/mic_visualizer";
import { useSession } from "../../../stores/session_store";

export const CommandNotch = () => {
    const { has_session_started, end_session } = useSession();
    return (
        <div className="flex bg-neutral-800 dark:bg-neutral-800 select-none text-neutral-100 items-center justify-between w-full h-12 p-1.5 lg:w-xl rounded-2xl">
            <div className="flex h-full items-center gap-x-1">
                <button>
                    <IconPlayerPause size={18} />
                </button>
                <span className="opacity-40">|</span>
                <button>
                    <IconKeyboard size={22} />
                </button>
                <span className="opacity-40">|</span>
                <button>
                    <IconMicrophone size={18} />
                </button>
            </div>

            <MicVisualizer isActive={has_session_started} />

            <div className="flex h-full items-center gap-x-4">
                <span className="text-neutral-400 text-sm mr-4">03:45</span>
                <button
                    onClick={() => end_session()}
                    className="text-neutral-800 w-14 rounded-xl flex items-center justify-center bg-neutral-100"
                >
                    <IconPlayerStop size={18} />
                </button>
            </div>
        </div>
    );
};
