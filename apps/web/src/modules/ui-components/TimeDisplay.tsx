import { useEffect } from "react";
import { useSessionTimeStore } from "../../stores/session_time_store";

const TimerDisplay = () => {
    const { isRunning, increment, getFormattedTime } = useSessionTimeStore();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (isRunning) {
            interval = setInterval(() => {
                increment();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval!);
        };
    }, [isRunning, increment]);

    return (
        <div className=" text-neutral-400 classic-serif text-[0.895rem] h-9 flex items-center justify-center">
            {getFormattedTime()}
        </div>
    );
};

export default TimerDisplay;
