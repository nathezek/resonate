import { create } from "zustand";

type SESSION_STATE_TYPES = {
    // States
    has_session_started: boolean;
    is_mic_muted: boolean;
    is_session_paused: boolean;
    session_start_time: number | null;

    // Actions
    start_session: () => Promise<void>;
    end_session: () => void;
    toggle_mute: () => void;
    toggle_session_pause: () => void;
};

export const useSession = create<SESSION_STATE_TYPES>((set) => ({
    // ---- Initial States -----
    has_session_started: false,
    is_mic_muted: false,
    is_session_paused: false,
    session_start_time: null,

    // ----- Actions ------
    start_session: async () =>
        set({ has_session_started: true, session_start_time: Date.now() }),

    end_session: () =>
        set({
            has_session_started: false,
            is_mic_muted: false,
            is_session_paused: false,
            session_start_time: null,
        }),

    toggle_session_pause: () =>
        set((state) => ({ is_session_paused: !state.is_session_paused })),

    toggle_mute: () => set((state) => ({ is_mic_muted: !state.is_mic_muted })),
}));
