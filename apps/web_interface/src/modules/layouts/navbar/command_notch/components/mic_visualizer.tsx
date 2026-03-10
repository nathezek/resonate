import { motion } from "motion/react";

export const MicVisualizer = ({ isActive }: { isActive: boolean }) => {
    const frequencies = Array<number[]>([0, 0, 0, 0, 0, 0]);
    return (
        <div className="flex items-center gap-0.75 h-8">
            {frequencies.map((_, index) => (
                <motion.div
                    key={index}
                    className={`w-0.75 rounded-full ${
                        isActive ? "bg-neutral-400" : "bg-neutral-600"
                    }`}
                    animate={{
                        height: `${Math.max(4, 4 * 24)}px`,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                    }}
                />
            ))}
        </div>
    );
};
