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
import { useChat } from "../../../../stores/chat_store";
import { useAudio } from "../../../../stores/audio_store";

export const CommandNotch = () => {
    const {
        session_status,
        is_session_paused,
        is_voice_mode_enabled,
        toggle_voice_mode,
        toggle_session_pause,
        end_session,
    } = useSession();

    const { is_keyboard_enabled, toggle_keyboard } = useKeyboard();
    const { is_agent_responding } = useChat();
    const { permissionStatus, isPlayingAgentAudio } = useAudio();
    
    // Check if the agent is fully responding OR physically talking out loud
    const isAgentActive = is_agent_responding || isPlayingAgentAudio;

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
                    <button
                        onClick={toggle_keyboard}
                        disabled={is_session_paused}
                        className={is_session_paused ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {is_keyboard_enabled ? (
                            <IconKeyboard size={22} className="text-blue-500" />
                        ) : (
                            <IconKeyboardOff size={22} />
                        )}
                    </button>
                    <span className="opacity-40">|</span>
                    <button
                        onClick={toggle_voice_mode}
                        disabled={is_session_paused || isAgentActive}
                        className={
                            (is_session_paused || isAgentActive)
                                ? "cursor-not-allowed"
                                : ""
                        }
                    >
                        {(!is_voice_mode_enabled || isAgentActive || is_session_paused || permissionStatus !== "granted") ? (
                            <IconMicrophoneOff size={18} className={`${is_session_paused ? "opacity-50" : ""}`} />
                        ) : (
                            <IconMicrophone size={18} className="text-blue-500" />
                        )}
                    </button>
                </div>

                {/*---- Center ----*/}
                <div className="flex-1 flex justify-center items-center">
                    {is_session_paused ? (
                        <div className="use_ibm px-3 py-1 rounded-md bg-neutral-700 text-amber-300/90 text-xs font-medium tracking-wide">
                            Session is paused
                        </div>
                    ) : (
                        <MicVisualizer
                            isActive={
                                (session_status === "active" && is_voice_mode_enabled) &&
                                !is_session_paused && !isAgentActive && permissionStatus === "granted"
                            }
                        />
                    )}
                </div>

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

            {!is_session_paused && <CurrentUserMessageDisplayer />}
        </div>
    );
};
