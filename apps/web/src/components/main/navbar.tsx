import {
    IconLineDotted,
    IconMicrophone,
    IconMicrophoneOff,
    IconPlayerStop,
} from "@tabler/icons-react";
import { useState } from "react";

import { motion } from "motion/react";

type T_NAVBAR = {
    toggleSession: () => void;
};

const Navbar = ({ toggleSession }: T_NAVBAR) => {
    return (
        <nav className="w-full absolute top-0 left-0 right-0 p-4 h-fit flex items-center justify-between">
            <div />
            <SessionControls onEndSession={toggleSession} />
            <Profile />
        </nav>
    );
};

export default Navbar;

// =================================== SUB-COMPONENTS ======================================= //

const SessionControls = ({ onEndSession }: { onEndSession: () => void }) => {
    const [mic, toggleMic] = useState<boolean>(false);
    const tapVariants = {
        tapped: { scale: 0.65, opacity: 0.8 }, // Adjusted opacity to 0.8; 10 is usually too high
    };
    return (
        <motion.div
            key={"session-bar"}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-64 h-12 bg-neutral-800 text-neutral-100 rounded-2xl cursor-default px-1.5 select-none flex items-center justify-between py-1.5"
        >
            <span
                className="h-full w-fit gap-x-2.5 pl-2.5 flex items-center justify-center"
                onClick={() => toggleMic(!mic)}
            >
                <motion.span whileTap={"tapped"} className="cursor-pointer">
                    {!mic ? (
                        <motion.span variants={tapVariants}>
                            <IconMicrophone size={20} />
                        </motion.span>
                    ) : (
                        <motion.span variants={tapVariants}>
                            <IconMicrophoneOff
                                size={20}
                                className="text-red-400"
                            />
                        </motion.span>
                    )}
                </motion.span>
                <span className="text-neutral-700">|</span>
                <IconLineDotted size={32} />
            </span>
            <span className="tracking-tight mono text-[0.895rem]">08:04</span>
            <span
                onClick={onEndSession}
                className="cursor-pointer h-full w-12 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-800"
            >
                <IconPlayerStop size={18} />
            </span>
        </motion.div>
    );
};

const Profile = () => {
    return <div className="w-10 h-10 bg-neutral-100 rounded-full"></div>;
};
