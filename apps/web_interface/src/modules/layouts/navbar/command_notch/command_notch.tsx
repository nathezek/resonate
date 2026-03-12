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
import { useAudio } from "../../../../stores/audio_store";

export const CommandNotch = () => {
    const {
        session_status,
        is_session_paused,
        is_voice_mode_enabled,
        set_voice_mode,
        toggle_session_pause,
        end_session,
    } = useSession();

    const { is_keyboard_enabled, enable_keyboard, disable_keyboard } = useKeyboard();

    const handle_keyboard_click = () => {
        set_voice_mode(false);
        enable_keyboard();
        useAudio.getState().stopListening();
    };

    const handle_mic_click = () => {
        set_voice_mode(true);
        disable_keyboard();
        useAudio.getState().startListening();
    };
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
                    <button onClick={handle_keyboard_click}>
                        {is_keyboard_enabled ? (
                            <IconKeyboard size={22} className="text-blue-500" />
                        ) : (
                            <IconKeyboardOff size={22} />
                        )}
                    </button>
                    <span className="opacity-40">|</span>
                    <button onClick={handle_mic_click}>
                        {is_voice_mode_enabled ? (
                            <IconMicrophone size={18} className="text-blue-500" />
                        ) : (
                            <IconMicrophoneOff size={18} />
                        )}
                    </button>
                </div>

                {/*---- Center ----*/}
                <MicVisualizer
                    isActive={
                        (session_status === "active" && is_voice_mode_enabled) &&
                        !is_session_paused
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
