import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAudioStore } from "../../../stores/audio_store";

export const MicVisualizer = ({ isActive }: { isActive: boolean }) => {
    const [frequencies, setFrequencies] = useState<number[]>([0, 0, 0, 0, 0, 0]);
    const streamer = useAudioStore((state) => state.streamer);

    useEffect(() => {
        if (!isActive || !streamer) {
            setFrequencies([0, 0, 0, 0, 0, 0]);
            return;
        }

        const interval = setInterval(() => {
            const freqData = streamer.getFrequencyData();
            if (freqData) {
                setFrequencies(freqData);
            }
        }, 50); // Update 20 times per second

        return () => clearInterval(interval);
    }, [isActive, streamer]);

    return (
        <div className="flex items-center gap-[3px] h-8">
            {frequencies.map((height, index) => (
                <motion.div
                    key={index}
                    className={`w-[3px] rounded-full ${isActive ? "bg-neutral-400" : "bg-neutral-600"
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
