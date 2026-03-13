import { useChat } from "../../../../../stores/chat_store";
import { useAudio } from "../../../../../stores/audio_store";
import { useKeyboard } from "../../../../../stores/keyboard_store";

const CurrentUserMessageDisplayer = () => {
    const { current_user_message, messages } = useChat();
    const {
        isListening,
        liveTranscript,
        hasSpokenOnce,
        isCountdownActive,
        countdownRemainingMs,
        idleMessageShown,
    } = useAudio();
    const { is_keyboard_enabled } = useKeyboard();

    let displayText = current_user_message;
    let auxiliaryStatusText = "";

    if (is_keyboard_enabled) {
        if (!current_user_message && messages.length === 0) {
            displayText = "Start typing.... your messages will appear here.";
        }
    } else {
        displayText = liveTranscript || current_user_message;

        if (isListening && !hasSpokenOnce && !liveTranscript) {
            auxiliaryStatusText = "Listening… start speaking";
        } else if (idleMessageShown) {
            auxiliaryStatusText = "No speech detected — tap the mic to retry or switch to keyboard";
        } else if (isCountdownActive) {
            auxiliaryStatusText = `Sending in ${Math.ceil(countdownRemainingMs / 1000)}s…`;
        }
    }

    if (!displayText && !auxiliaryStatusText) return null;

    return (
        <div className="w-full h-fit p-1 flex flex-col gap-1 group relative">
            {displayText && (
                <div className="w-full flex transition-all duration-300 overflow-hidden items-start h-fit px-4 py-2 gap-x-4 rounded-xl bg-neutral-800/90 text-neutral-200 text-sm hover:bg-neutral-800!">
                    <img src="/default_avatar.png" className="w-3 h-3 mt-1 shrink-0" alt="user" />{" "}
                    <div className="flex-1 w-full max-w-[calc(100%-2rem)]">
                        <span className="block w-full wrap-break-word leading-relaxed pt-0.5 line-clamp-1 group-hover:line-clamp-none group-hover:max-h-64 group-hover:overflow-y-auto transition-all duration-300">
                            {displayText}
                        </span>
                    </div>
                </div>
            )}
            
            {auxiliaryStatusText && !is_keyboard_enabled && (
                <span className={`px-4 text-xs font-semibold text-neutral-500 ${isCountdownActive ? 'animate-pulse' : ''}`}>
                     {auxiliaryStatusText}
                </span>
            )}
        </div>
    );
};

export default CurrentUserMessageDisplayer;
