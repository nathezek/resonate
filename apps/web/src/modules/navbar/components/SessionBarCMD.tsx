import {
    IconLineDotted,
    IconMicrophone,
    IconMicrophoneOff,
    IconPlayerPause,
    IconPlayerPlayFilled,
    IconPlayerStop,
} from "@tabler/icons-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const SessionControls = ({ onEndSession }: { onEndSession: () => void }) => {
    const [mic, toggleMic] = useState<boolean>(false);
    const [pauseSession, togglePauseSession] = useState<boolean>(false);

    // Derived logic
    const isMicOff = mic || pauseSession;
    const isVisualizerActive = !pauseSession && !mic;

    const tapVariants = {
        tapped: { scale: 0.85, opacity: 0.7 },
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
            className="w-fit h-fit bg-neutral-800 fixed top-2.5 left-1/2 -translate-x-1/2 text-neutral-100 rounded-2xl px-1.5"
        >
            <div className="w-fit gap-x-8 h-12 flex items-center justify-between py-1.5">
                <div className="h-full select-none w-fit gap-x-2.5 pl-2.5 flex items-center justify-center">
                    {/* Pause/Play Button */}
                    <motion.div
                        whileTap="tapped"
                        variants={tapVariants}
                        onClick={() => togglePauseSession(!pauseSession)}
                        className="cursor-pointer flex items-center justify-center w-6 h-8"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={pauseSession ? "play" : "pause"}
                                variants={iconVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.15 }}
                            >
                                {pauseSession ? (
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

                    {/* Mic Button */}
                    <motion.div
                        variants={tapVariants}
                        whileTap={!pauseSession ? "tapped" : undefined}
                        // We move opacity into animate so it reacts to pauseSession instantly
                        animate={{ opacity: pauseSession ? 0.4 : 1 }}
                        initial={{ opacity: 1 }}
                        onClick={() => !pauseSession && toggleMic(!mic)}
                        className={`flex items-center justify-center h-8 ${
                            pauseSession
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isMicOff ? "off" : "on"}
                                variants={iconVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.15 }}
                            >
                                {isMicOff ? (
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

                    <IconLineDotted
                        size={32}
                        className={`transition-colors duration-300 ${
                            isVisualizerActive
                                ? "text-neutral-400"
                                : "text-neutral-600"
                        }`}
                    />
                </div>

                <div className="tracking-tight text-neutral-400 mono text-[0.895rem] h-9 flex items-center">
                    08:04
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onEndSession}
                    className="h-9 w-12 flex items-center justify-center cursor-pointer rounded-xl bg-neutral-100 text-neutral-800 hover:bg-white transition-colors"
                >
                    <IconPlayerStop size={18} />
                </motion.button>
            </div>

            <AnimatePresence>
                {pauseSession && (
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
                            <div className="w-full border rounded-xl border-neutral-700 bg-neutral-900/50 flex items-center justify-center text-amber-400 mono p-2 text-xs">
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
