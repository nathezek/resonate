import { create } from "zustand";
import { useAudioStore } from "./audio_store.ts";
import { useKeyboardStore } from "./keyboard_store.ts";
import { useChatHistoryStore } from "./chat_history_store.ts";
import { useSessionTimeStore } from "./session_time_store.ts";

export interface SessionState {
    isActive: boolean;
    isPaused: boolean;
    wasMutedBeforePause: boolean;
    startSession: () => void;
    togglePause: () => void;
    endSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    isActive: false,
    isPaused: false,
    wasMutedBeforePause: false,

    startSession: () => {
        const audio = useAudioStore.getState();
        const keyboard = useKeyboardStore.getState();
        const timer = useSessionTimeStore.getState();

        audio.turnMicOn();
        keyboard.disableKeyboard();
        timer.resetTimer();
        timer.startTimer();

        set({ isActive: true, isPaused: false, wasMutedBeforePause: false });
    },

    togglePause: () => {
        const audio = useAudioStore.getState();
        const timer = useSessionTimeStore.getState();
        const { isPaused, wasMutedBeforePause } = get();

        if (!isPaused) {
            // --- ACTION: PAUSING ---
            const currentMicMuted = !audio.micEnabled;
            set({ wasMutedBeforePause: currentMicMuted, isPaused: true });
            audio.turnMicOff();
            timer.stopTimer();
        } else {
            // --- ACTION: RESUMING ---
            const keyboard = useKeyboardStore.getState();
            if (!wasMutedBeforePause && !keyboard.keyboardEnabled) {
                audio.turnMicOn();
            }
            timer.startTimer();
            set({ isPaused: false });
        }
    },

    endSession: () => {
        const audio = useAudioStore.getState();
        const keyboard = useKeyboardStore.getState();
        const chat = useChatHistoryStore.getState();
        const timer = useSessionTimeStore.getState();

        audio.turnMicOff();
        keyboard.disableKeyboard();
        chat.clearHistory();
        timer.resetTimer();

        set({ isActive: false, isPaused: false, wasMutedBeforePause: false });
    },
}));
