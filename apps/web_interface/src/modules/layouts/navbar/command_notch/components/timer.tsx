import { useEffect } from "react";
import { useSession } from "../../../../../stores/session_store";
import { useSessionTimer } from "../../../../../stores/session_timer_store";

const Timer = () => {
    const { session_start_time, is_session_paused } = useSession();
    const { is_running, increment, get_formatted_time } = useSessionTimer();

    useEffect(() => {
        if (!session_start_time || is_session_paused) return;
        let interval: ReturnType<typeof setInterval> | null = null;

        if (is_running) {
            interval = setInterval(() => {
                increment();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval!);
        };
    }, [is_running, increment, is_session_paused]);

    return (
        <span className="text-neutral-400 text-sm mr-4">
            {get_formatted_time()}
        </span>
    );
};

export default Timer;
