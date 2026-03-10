import { create } from "zustand";

type KEYBOARD_TYPES = {
    // STATES
    is_keyboard_enabled: boolean;

    // ACTIONS
    enable_keyboard: () => void;
    disable_keyboard: () => void;
    toggle_keyboard: () => void;
};

export const useKeyboard = create<KEYBOARD_TYPES>((set) => ({
    is_keyboard_enabled: true,

    enable_keyboard: () => set({ is_keyboard_enabled: true }),
    disable_keyboard: () => set({ is_keyboard_enabled: false }),
    toggle_keyboard: () =>
        set((state) => ({ is_keyboard_enabled: !state.is_keyboard_enabled })),
}));
