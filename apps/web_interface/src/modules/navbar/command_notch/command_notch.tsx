import {
    IconKeyboard,
    IconMicrophone,
    IconMicrophoneOff,
    IconPlayerPause,
    IconPlayerStop,
    IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { MicVisualizer } from "./components/mic_visualizer";
import { useSession } from "../../../stores/session_store";
import Timer from "./components/timer";

export const CommandNotch = () => {
    const {
        has_session_started,
        is_mic_muted,
        is_session_paused,
        toggle_mute,
        toggle_session_pause,
        end_session,
    } = useSession();
    return (
        <div className="flex bg-neutral-800 dark:bg-neutral-800 select-none text-neutral-100 items-center justify-between w-full h-12 p-1.5 lg:w-xl rounded-2xl">
            {/*----- Left ----*/}
            <div className="flex h-full items-center gap-x-1">
                <button onClick={toggle_session_pause}>
                    {is_session_paused ? (
                        <IconPlayerPlayFilled size={18} />
                    ) : (
                        <IconPlayerPause size={18} />
                    )}
                </button>
                <span className="opacity-40">|</span>
                <button>
                    <IconKeyboard size={22} />
                </button>
                <span className="opacity-40">|</span>
                <button onClick={toggle_mute}>
                    {is_mic_muted ? (
                        <IconMicrophoneOff size={18} />
                    ) : (
                        <IconMicrophone size={18} />
                    )}
                </button>
            </div>

            {/*---- Center ----*/}
            <MicVisualizer
                isActive={
                    has_session_started && !is_mic_muted && !is_session_paused
                }
            />

            {/*----- Right ------*/}
            <div className="flex h-full items-center gap-x-4">
                <Timer />
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
