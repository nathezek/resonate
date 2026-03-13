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

    if (is_keyboard_enabled) {
        if (!current_user_message && messages.length === 0) {
            displayText = "Start typing.... your messages will appear here.";
        }
    } else {
        displayText = current_user_message || liveTranscript;

        if (isListening && !hasSpokenOnce && !liveTranscript) {
            displayText = "Listening… start speaking";
        }

        if (idleMessageShown) {
            displayText =
                "No speech detected — tap the mic to retry or switch to keyboard";
        }

        if (isCountdownActive) {
            if (liveTranscript) {
                displayText = `${liveTranscript} (Sending in ${Math.ceil(countdownRemainingMs / 1000)}s…)`;
            } else {
                displayText = `Sending in ${Math.ceil(countdownRemainingMs / 1000)}s…`;
            }
        }
    }

    if (!displayText) return null;

    return (
        <div className="w-full h-fit p-1">
            <div className="w-full flex overflow-hidden items-center h-fit px-4 py-2 gap-x-4 rounded-xl bg-neutral-800/90 text-neutral-200 text-sm">
                <img src="/default_avatar.png" className="w-3 h-3" alt="user" />{" "}
                :<span className="line-clamp-3">{displayText}</span>
            </div>
        </div>
    );
};

export default CurrentUserMessageDisplayer;
