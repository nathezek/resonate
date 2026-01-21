import {
    IconLineDotted,
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

const SessionControls = () => {
    // Actions from stores
    const toggleMic = useAudioStore((s) => s.toggleMic);
    const togglePause = useSessionStore((s) => s.togglePause);
    const endSession = useSessionStore((s) => s.endSession);

    // Destructuring exactly what your useSessionUIState returns
    const { isPaused, isMicVisualOff, isVisualizerActive } =
        useSessionUIState();

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
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-fit lg:w-72 h-fit bg-neutral-800 fixed top-2.5 left-1/2 -translate-x-1/2 text-neutral-100 rounded-2xl px-1.5 shadow-2xl border border-neutral-700/50"
        >
            <div className="gap-x-8 h-12 flex items-center justify-between py-1.5">
                <div className="h-full select-none w-fit gap-x-2.5 pl-2.5 flex items-center justify-center">
                    {/* Pause / Play Button */}
                    <motion.div
                        whileTap="tapped"
                        variants={tapVariants}
                        onClick={togglePause}
                        className="cursor-pointer flex items-center justify-center w-6 h-8"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isPaused ? "play" : "pause"}
                                variants={iconVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.1 }}
                            >
                                {isPaused ? (
                                    <IconPlayerPlayFilled
                                        size={18}
                                        className="text-amber-400"
                                    />
                                ) : (
                                    <IconPlayerPause size={20} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    <span className="text-neutral-700">|</span>

                    {/* Mic Button - Locked when paused */}
                    <motion.div
                        variants={tapVariants}
                        whileTap={!isPaused ? "tapped" : undefined}
                        animate={{ opacity: isPaused ? 0.4 : 1 }}
                        onClick={() => !isPaused && toggleMic()}
                        className={`flex items-center justify-center h-8 ${
                            isPaused ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                // Fixed: using isMicVisualOff from your selector
                                key={isMicVisualOff ? "off" : "on"}
                                variants={iconVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.1 }}
                            >
                                {isMicVisualOff ? (
                                    <IconMicrophoneOff
                                        size={18}
                                        className="text-red-400"
                                    />
                                ) : (
                                    <IconMicrophone size={18} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    <span className="text-neutral-700">|</span>

                    {/* Visualizer - Reactive to both stores via selector */}
                    <IconLineDotted
                        size={32}
                        className={`transition-colors duration-500 ${
                            isVisualizerActive
                                ? "text-neutral-400"
                                : "text-neutral-600"
                        }`}
                    />
                </div>

                {/* Hardcoded timer for now */}
                {/* <div className="tracking-tight text-neutral-400 font-mono text-[0.895rem] h-9 flex items-center"> */}
                {/*     08:04 */}
                {/* </div> */}

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={endSession}
                    className="h-9 w-12 flex cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-white transition-colors"
                >
                    <IconPlayerStop size={18} />
                </motion.button>
            </div>

            <AnimatePresence>
                {isPaused && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                        }}
                        className="overflow-hidden"
                    >
                        <div className="pb-2 pt-1 px-1">
                            <div className="w-full border rounded-xl border-neutral-700 bg-neutral-900/50 flex justify-center text-amber-400 font-mono p-2 text-xs uppercase tracking-wider">
                                <span className="animate-pulse">
                                    Session Paused
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SessionControls;
