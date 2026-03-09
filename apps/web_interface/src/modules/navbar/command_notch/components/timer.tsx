import { useEffect, useState } from "react";
import { useSession } from "../../../../stores/session_store";

const Timer = () => {
    const { session_start_time, is_session_paused } = useSession();
    const [elapsed, setElapsed] = useState("00:00");

    useEffect(() => {
        if (!session_start_time || is_session_paused) return;

        const interval = setInterval(() => {
            const seconds = Math.floor(
                (Date.now() - session_start_time) / 1000,
            );
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            setElapsed(
                `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [session_start_time, is_session_paused]);
    return <span className="text-neutral-400 text-sm mr-4">{elapsed}</span>;
};

export default Timer;
