import { useAudioStore } from "../stores/audio_store.ts";
import { useSessionStore } from "../stores/session_store.ts";

export const useSessionUIState = () => {
    const micEnabled = useAudioStore((s) => s.micEnabled);
    const isPaused = useSessionStore((s) => s.isPaused);
    const isActive = useSessionStore((s) => s.isActive);

    // micEnabled = true means mic is manually ON
    // micEnabled = false means mic is manually OFF

    // UI Logic: Show "Muted" icon if mic is manually off OR session is paused
    const isMicVisualOff = !micEnabled || isPaused;

    // Visualizer is active only if session is live AND mic is manually ON
    const isVisualizerActive = !isPaused && micEnabled;

    return {
        isActive,
        isPaused,
        isMicVisualOff,
        isVisualizerActive,
    };
};
