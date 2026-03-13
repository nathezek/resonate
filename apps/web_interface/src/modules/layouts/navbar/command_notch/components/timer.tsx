import { useEffect } from "react";
import { useSessionTimer } from "../../../../../stores/session_timer_store";

const Timer = () => {
    const { is_running, increment, get_formatted_time } = useSessionTimer();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (is_running) {
            interval = setInterval(() => {
                increment();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval!);
        };
    }, [is_running, increment]);

    return (
        <span className="text-neutral-400 text-sm mr-4">
            {get_formatted_time()}
        </span>
    );
};

export default Timer;
