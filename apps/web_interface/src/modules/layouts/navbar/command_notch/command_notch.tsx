import {
    IconKeyboard,
    IconKeyboardOff,
    IconMicrophone,
    IconMicrophoneOff,
    IconPlayerPause,
    IconPlayerStop,
    IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { MicVisualizer } from "./components/mic_visualizer";
import { useSession } from "../../../../stores/session_store";
import Timer from "./components/timer";
import { useKeyboard } from "../../../../stores/keyboard_store";
import CurrentUserMessageDisplayer from "./components/current_user_message_displayer";

export const CommandNotch = () => {
    const {
        session_status,
        is_mic_muted,
        is_session_paused,
        toggle_mute,
        toggle_session_pause,
        end_session,
    } = useSession();

    const { is_keyboard_enabled, toggle_keyboard } = useKeyboard();
    return (
        <div className="w-full h-fit flex flex-col items-center bg-neutral-200 dark:bg-neutral-800 md:w-xl text-neutral-700 rounded-2xl">
            <div className="flex select-none items-center justify-between gap-x-8 w-full h-11 px-1">
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
                    <button onClick={toggle_keyboard}>
                        {is_keyboard_enabled ? (
                            <IconKeyboard size={22} />
                        ) : (
                            <IconKeyboardOff size={22} />
                        )}
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
                        (session_status === "active" && is_mic_muted) ||
                        is_session_paused
                    }
                />

                {/*----- Right ------*/}
                <div className="flex h-full items-center gap-x-4">
                    <Timer />
                    <button
                        onClick={() => end_session()}
                        className="text-neutral-100 w-14 rounded-xl flex items-center justify-center bg-neutral-700"
                    >
                        <IconPlayerStop size={18} />
                    </button>
                </div>
            </div>

            <CurrentUserMessageDisplayer />
        </div>
    );
};
