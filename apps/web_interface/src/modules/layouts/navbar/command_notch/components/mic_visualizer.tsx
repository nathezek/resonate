import { motion } from "motion/react";
import { useState } from "react";

export const MicVisualizer = ({ isActive }: { isActive: boolean }) => {
    const [frequencies, setFrequencies] = useState<number[]>([0, 0, 0, 0, 0, 0]);
   return (
        <div className="flex items-center gap-0.75 h-8">
            {frequencies.map((height, index) => (
                <motion.div
                    key={index}
                    className={`w-0.75 rounded-full ${isActive ? "bg-neutral-400" : "bg-neutral-600"
                        }`}
                    animate={{
                        height: `${Math.max(4, height * 24)}px`, // Min 4px, max 24px
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
