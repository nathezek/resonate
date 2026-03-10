import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 6;
const IDLE = new Array(BAR_COUNT).fill(0);

export const MicVisualizer = ({ isActive }: { isActive: boolean }) => {
    const [frequencies, setFrequencies] = useState<number[]>(IDLE);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            const animate = () => {
                setFrequencies(
                    Array.from({ length: BAR_COUNT }, () => Math.random()),
                );
                rafId.current = requestAnimationFrame(animate);
            };
            rafId.current = requestAnimationFrame(animate);
        } else {
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        }
        return () => {
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, [isActive]);

    return (
        <div className="flex items-center gap-0.75 h-8">
            {(isActive ? frequencies : IDLE).map((height, index) => (
                <motion.div
                    key={index}
                    className={`w-0.75 rounded-full ${
                        isActive ? "bg-neutral-400" : "bg-neutral-600"
                    }`}
                    animate={{
                        height: `${Math.max(4, height * 24)}px`,
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
