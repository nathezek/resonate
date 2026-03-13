import { create } from "zustand";
import { useChat } from "./chat_store";
import { useSession } from "./session_store";

const INITIAL_IDLE_TIMEOUT_MS = 60_000; // 60 seconds
const SILENCE_COUNTDOWN_MS = 5000; // 5 seconds
const COUNTDOWN_TICK_MS = 1000; // update every second

type AudioState = {
    // Core state
    liveTranscript: string;
    interimTranscript: string;
    hasSpokenOnce: boolean;
    isListening: boolean;
    isPausedByAgent: boolean;
    error: string | null;
    permissionStatus: "unknown" | "granted" | "denied";

    // Speech instance provided by React component
    _speechInstance: any;

    // Countdown
    isCountdownActive: boolean;
    countdownRemainingMs: number;

    // Idle timeout (only for initial silence)
    isIdleTimeoutActive: boolean;
    idleMessageShown: boolean;

    // Global WebSocket sender function provided by App.tsx
    _sendMessageHandler: ((text: string) => void) | null;

    // Actions
    setSendMessageHandler: (handler: (text: string) => void) => void;
    startListening: () => void;
    pauseListening: () => void;
    resumeListening: () => void;
    stopListening: () => void;
    resetAll: () => void;
    handleInterim: (text: string) => void;
    handleFinal: (text: string) => void;
    startCountdown: () => void;
    cancelCountdown: () => void;
    tickCountdown: () => void;
};

export const useAudio = create<AudioState>((set, get) => {
    let countdownInterval: number | null = null;
    let idleTimeoutId: number | null = null;

    // Helper to send the transcript (reuses existing chat flow)
    const sendTranscript = (text: string) => {
        if (!text.trim()) return;

        const { add_user_message, start_agent_response } = useChat.getState();
        add_user_message(text);
        start_agent_response();
        
        // Actually send it to websocket
        const handler = get()._sendMessageHandler;
        if (handler) {
            handler(text);
        }

        // Clear transcript after send
        set({
            liveTranscript: "",
            interimTranscript: "",
        });

        // Pause listening while agent responds (also handled by subscribe, but safe)
        get().pauseListening();
    };

    return {
        liveTranscript: "",
        interimTranscript: "",
        hasSpokenOnce: false,
        isListening: false,
        isPausedByAgent: false,
        error: null,
        permissionStatus: "unknown",
        _speechInstance: null,
        _sendMessageHandler: null,

        isCountdownActive: false,
        countdownRemainingMs: SILENCE_COUNTDOWN_MS,

        isIdleTimeoutActive: false,
        idleMessageShown: false,

        setSendMessageHandler: (handler) => set({ _sendMessageHandler: handler }),

        startListening: () => {
            const speech = get()._speechInstance;
            if (!speech) return;

            if (!speech.isSupported) {
                set({ error: "Speech recognition not supported" });
                return;
            }

            try {
                speech.start();
                set({
                    isListening: true,
                    error: null,
                    permissionStatus: "granted",
                    liveTranscript: "",
                    interimTranscript: "",
                    hasSpokenOnce: false,
                    isCountdownActive: false,
                });

                // Start initial idle timeout if not spoken yet
                if (!get().hasSpokenOnce && !get().idleMessageShown) {
                    set({ isIdleTimeoutActive: true });
                    idleTimeoutId = setTimeout(() => {
                        set({
                            isIdleTimeoutActive: false,
                            idleMessageShown: true,
                            isListening: false,
                        });
                        speech.stop();
                        useSession.getState().set_voice_mode(false); // Visually update UI mic icon to OFF
                    }, INITIAL_IDLE_TIMEOUT_MS);
                }
            } catch (err: any) {
                const msg =
                    err.name === "NotAllowedError"
                        ? "Microphone permission denied"
                        : err.message || "Failed to start listening";
                set({
                    error: msg,
                    permissionStatus:
                        err.name === "NotAllowedError" ? "denied" : "unknown",
                });
            }
        },

        pauseListening: () => {
            const speech = get()._speechInstance;
            if (speech) speech.pause();

            set({ 
                isPausedByAgent: true,
                isCountdownActive: false,
                hasSpokenOnce: false,
                liveTranscript: "",
                interimTranscript: "",
            });
            if (countdownInterval) clearInterval(countdownInterval);
            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
                idleTimeoutId = null;
            }
        },

        resumeListening: () => {
            const speech = get()._speechInstance;
            if (
                get().isPausedByAgent &&
                useSession.getState().session_status === "active"
            ) {
                set({ 
                    isPausedByAgent: false,
                    hasSpokenOnce: false,
                    isCountdownActive: false,
                    liveTranscript: "",
                    interimTranscript: "",
                });
                if (speech) speech.resume();
            }
        },

        stopListening: () => {
            const speech = get()._speechInstance;
            if (speech) speech.stop();

            set({ isListening: false, isPausedByAgent: false });
            if (countdownInterval) clearInterval(countdownInterval);
            set({ isCountdownActive: false });
            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
                idleTimeoutId = null;
            }
        },

        resetAll: () => {
            get().stopListening();
            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
                idleTimeoutId = null;
            }
            if (countdownInterval) clearInterval(countdownInterval);
            set({
                liveTranscript: "",
                interimTranscript: "",
                hasSpokenOnce: false,
                isCountdownActive: false,
                countdownRemainingMs: SILENCE_COUNTDOWN_MS,
                isIdleTimeoutActive: false,
                idleMessageShown: false,
                error: null,
            });
        },

        handleInterim: (text: string) => {
            if (!text.trim()) return;
            
            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
                idleTimeoutId = null;
            }

            set({ 
                interimTranscript: text, 
                liveTranscript: text,
                hasSpokenOnce: true,
                isIdleTimeoutActive: false,
                idleMessageShown: false
            });
            // Reset countdown if active
            get().cancelCountdown();
        },

        handleFinal: (text: string) => {
            if (!text.trim()) return;
            
            set({
                liveTranscript: text,
                interimTranscript: "",
                hasSpokenOnce: true,
                idleMessageShown: false,
                isIdleTimeoutActive: false,
            });

            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
                idleTimeoutId = null;
            }

            // Start normal silence countdown
            get().startCountdown();
        },

        startCountdown: () => {
            if (get().isCountdownActive || !get().hasSpokenOnce) return;

            set({
                isCountdownActive: true,
                countdownRemainingMs: SILENCE_COUNTDOWN_MS,
            });

            countdownInterval = setInterval(() => {
                set((state) => {
                    const newMs =
                        state.countdownRemainingMs - COUNTDOWN_TICK_MS;
                    if (newMs <= 0) {
                        if (countdownInterval) clearInterval(countdownInterval);
                        sendTranscript(state.liveTranscript);
                        return {
                            isCountdownActive: false,
                            countdownRemainingMs: 0,
                        };
                    }
                    return {
                        countdownRemainingMs: newMs,
                    };
                });
            }, COUNTDOWN_TICK_MS);
        },

        cancelCountdown: () => {
            if (countdownInterval) clearInterval(countdownInterval);
            set({
                isCountdownActive: false,
                countdownRemainingMs: SILENCE_COUNTDOWN_MS,
            });
        },

        tickCountdown: () => {},
    };
});
