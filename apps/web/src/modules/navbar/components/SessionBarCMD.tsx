import {
    IconKeyboard,
    IconKeyboardOff,
    IconMicrophone,
    IconMicrophoneOff,
    IconPlayerPause,
    IconPlayerPlayFilled,
    IconPlayerStop,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useAudioStore } from "../../../stores/audio_store.ts";
import { useSessionStore } from "../../../stores/session_store.ts";
import { useSessionUIState } from "../../../utils/sesssion_selector.ts";
import { useKeyboardStore } from "../../../stores/keyboard_store.ts";
import TimerDisplay from "../../ui-components/TimeDisplay.tsx";
import { MicVisualizer } from "./MicVisualizer.tsx";

// --- Main Component ---

const SessionControls = () => {
    // Actions from stores
    const toggleMic = useAudioStore((state) => state.toggleMic);
    const togglePause = useSessionStore((state) => state.togglePause);
    const endSession = useSessionStore((state) => state.endSession);
    const { toggleKeyboard, keyboardEnabled } = useKeyboardStore();

    // UI Logic from selector
    const { isPaused, isMicVisualOff, isVisualizerActive } =
        useSessionUIState();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-fit lg:w-lg overflow-hidden h-fit bg-neutral-800 fixed top-2.5 left-1/2 -translate-x-1/2 text-neutral-100 rounded-2xl px-1.5"
        >
            <div className="gap-x-12 h-12 flex items-center justify-between py-1.5">
                <div className="h-full select-none w-fit gap-x-2.5 pl-2.5 flex items-center justify-center">
                    {/* Pause / Play Button */}
                    <ControlButton onClick={togglePause} activeKey={isPaused}>
                        {isPaused ? (
                            <IconPlayerPlayFilled
                                size={18}
                                className="text-amber-400 animate-pulse"
                            />
                        ) : (
                            <IconPlayerPause size={20} />
                        )}
                    </ControlButton>

                    <span className="text-neutral-700 ml-16">|</span>

                    {/* Keyboard Button */}
                    <ControlButton
                        onClick={toggleKeyboard}
                        isActive={!isPaused}
                        activeKey={keyboardEnabled}
                    >
                        {isPaused || !keyboardEnabled ? (
                            <IconKeyboardOff size={24} />
                        ) : (
                            <IconKeyboard size={24} />
                        )}
                    </ControlButton>

                    <span className="text-neutral-700">|</span>

                    {/* Mic Button - Locked when paused */}
                    <ControlButton
                        onClick={toggleMic}
                        isActive={!isPaused}
                        disabled={isPaused}
                        activeKey={isMicVisualOff}
                    >
                        {isMicVisualOff ? (
                            <IconMicrophoneOff
                                size={18}
                                className="text-red-300"
                            />
                        ) : (
                            <IconMicrophone size={18} />
                        )}
                    </ControlButton>

                    <span className="text-neutral-700">|</span>

                    {/* Visualizer - Reactive via selector */}
                    <MicVisualizer isActive={isVisualizerActive} />
                </div>
                <TimerDisplay />

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={endSession}
                    className="h-9 w-12 flex cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-white transition-colors"
                >
                    <IconPlayerStop size={18} />
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {isPaused && (
                    <motion.div
                        key="pause-status"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        className="overflow-hidden h-14"
                    >
                        <div className="pb-2 pt-1 px-1">
                            <div className="w-full rounded-lg bg-amber-500/5 flex justify-center text-amber-300 mono p-2 text-xs ">
                                <span>Session Paused</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SessionControls;

// --- Sub-component for DRY Button Logic ---

interface ControlButtonProps {
    onClick: () => void;
    isActive?: boolean; // Controls the opacity/dimming
    disabled?: boolean; // Prevents clicks (e.g., when paused)
    activeKey: string | boolean; // Unique key to trigger AnimatePresence transitions
    children: React.ReactNode;
}

const ControlButton = ({
    onClick,
    isActive = true,
    disabled = false,
    activeKey,
    children,
}: ControlButtonProps) => {
    const tapVariants = {
        tapped: { scale: 0.95, opacity: 0.7 },
    };

    const iconVariants = {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
    };

    return (
        <motion.div
            variants={tapVariants}
            whileTap={!disabled ? "tapped" : undefined}
            animate={{ opacity: !isActive ? 0.4 : 1 }}
            onClick={() => !disabled && onClick()}
            className={`flex items-center justify-center w-6 h-8 ${disabled ? "cursor-not-allowed" : "cursor-pointer"
                }`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={String(activeKey)}
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.1 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};
