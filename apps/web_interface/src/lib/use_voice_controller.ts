import { useEffect } from "react";
import { useSpeechRecognition } from "./use_speech_recognition";
import { useChat } from "../stores/chat_store";
import { useAudio } from "../stores/audio_store";

export const useVoiceController = () => {
    // 1. Subscribe to chat store to pause/resume listening when agent responds
    useEffect(() => {
        const unsubscribe = useChat.subscribe((state, prevState) => {
            const isResponding = state.is_agent_responding;
            const previousIsResponding = prevState?.is_agent_responding;

            if (isResponding === previousIsResponding) return;

            if (isResponding) {
                useAudio.getState().pauseListening();
            } else {
                useAudio.getState().resumeListening();
            }
        });

        return unsubscribe;
    }, []);

    // 2. Wrap speech recognition inside this React component/hook context
    const speech = useSpeechRecognition({
        onInterim: (text) => useAudio.getState().handleInterim(text),
        onFinal: (text) => useAudio.getState().handleFinal(text),
        onSilenceStart: () => {
            const state = useAudio.getState();
            if (state.hasSpokenOnce && !state.isPausedByAgent) {
                state.startCountdown();
            }
        },
        onError: (err) => useAudio.setState({ error: err }),
        onEnd: () => {
            // Auto-reconnect handled in use_speech_recognition hook
        },
    });

    // 3. Keep speech instance in sync so start/pause/stop actions in the store have access to it
    useEffect(() => {
        useAudio.setState({ _speechInstance: speech });
    }, [speech]);

    return null; // This is a logic-only hook
};
