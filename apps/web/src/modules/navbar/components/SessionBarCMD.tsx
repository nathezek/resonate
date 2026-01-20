import {
    IconLineDotted,
    IconMicrophone,
    IconMicrophoneOff,
    IconPlayerStop,
} from "@tabler/icons-react";
import { useState } from "react";

import { AnimatePresence, motion } from "motion/react";

const SessionControls = ({ onEndSession }: { onEndSession: () => void }) => {
    const [mic, toggleMic] = useState<boolean>(false);

    const tapVariants = {
        tapped: { scale: 0.85, opacity: 0.8 },
    };

    const iconVariants = {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-64 h-12 bg-neutral-800 text-neutral-100 rounded-2xl px-1.5 flex items-center justify-between py-1.5"
        >
            <div className="h-full select-none w-fit gap-x-2.5 pl-2.5 flex items-center justify-center">
                <motion.div
                    whileTap="tapped"
                    variants={tapVariants}
                    onClick={() => toggleMic(!mic)}
                    className="cursor-pointer flex items-center justify-center w-8 h-8"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={mic ? "mic-on" : "mic-off"}
                            variants={iconVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.1 }}
                        >
                            {mic ? (
                                <IconMicrophoneOff
                                    size={20}
                                    className="text-red-400"
                                />
                            ) : (
                                <IconMicrophone size={20} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <span className="text-neutral-700">|</span>
                <IconLineDotted size={32} />
            </div>

            <span className="tracking-tight font-mono text-[0.895rem]">
                08:04
            </span>

            <motion.span
                whileTap={{ scale: 0.9 }}
                onClick={onEndSession}
                className="cursor-pointer h-full w-12 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-800"
            >
                <IconPlayerStop size={18} />
            </motion.span>
        </motion.div>
    );
};

export default SessionControls;
