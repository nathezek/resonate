import { useEffect } from "react";
import { useSpeechRecognition } from "./use_speech_recognition";
import { useChat } from "../stores/chat_store";
import { useAudio } from "../stores/audio_store";
import { useSession } from "../stores/session_store";

export const useVoiceController = () => {
    // 1. Subscribe to both chat response state and audio playback state
    useEffect(() => {
        const handleStateChange = () => {
            const isRespondingText = useChat.getState().is_agent_responding;
            const isPlayingAudio = useAudio.getState().isPlayingAgentAudio;
            const currentListening = useAudio.getState().isListening;
            const isPausedByAgent = useAudio.getState().isPausedByAgent;

            if (isRespondingText || isPlayingAudio) {
                if (currentListening && !isPausedByAgent) {
                    useAudio.getState().pauseListening();
                }
            } else {
                if (isPausedByAgent) {
                    useAudio.getState().resumeListening();
                }
            }
        };

        const unsubChat = useChat.subscribe(handleStateChange);
        const unsubAudio = useAudio.subscribe(handleStateChange);

        return () => {
            unsubChat();
            unsubAudio();
        };
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
            const audioState = useAudio.getState();
            const { session_status, is_voice_mode_enabled } = useSession.getState(); 
            
            // Auto-reconnect if the session is alive and the agent didn't pause us
            if (session_status === "active" && is_voice_mode_enabled && !audioState.isPausedByAgent) {
                setTimeout(() => {
                    const currentStatus = useSession.getState().session_status;
                    const voiceMode = useSession.getState().is_voice_mode_enabled;
                    const pausedByAgent = useAudio.getState().isPausedByAgent;
                    if (currentStatus === "active" && voiceMode && !pausedByAgent) {
                        useAudio.getState().reconnectListening();
                    }
                }, 800); // 800ms stabilization window
            }
        },
    });

    // 3. Keep speech instance in sync so start/pause/stop actions in the store have access to it
    useEffect(() => {
        useAudio.setState({ _speechInstance: speech });
    }, [speech]);

    return null; // This is a logic-only hook
};
