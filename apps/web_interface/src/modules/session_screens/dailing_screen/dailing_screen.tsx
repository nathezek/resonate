import { useEffect, useRef } from "react";
import { useSession } from "../../../stores/session_store";
import { IconPhone } from "@tabler/icons-react";

const DialingScreen = () => {
    const { start_session, end_session } = useSession();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Play the ringing sound
        if (audioRef.current) {
            audioRef.current.play();
        }

        // After 5 seconds, start the session
        const timeout = setTimeout(() => {
            start_session();
        }, 10000);

        return () => {
            clearTimeout(timeout);
            // Stop the sound if component unmounts early
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [start_session]);

    return (
        <div className="dialing_screen text-xl w-full h-screen flex flex-col items-center justify-center">
            {/* Hidden audio element */}
            <audio ref={audioRef} src="/ringtones/nothing_p1.mp3" />

            {/* Status Text */}
            <h1 className="">Calling Ress...</h1>
            <p className="text-base opacity-70 mt-1 mb-4">
                Connecting to your study session
            </p>
            <button
                onClick={end_session}
                className="bg-neutral-200 text-neutral-800 my-4 h-10 rounded-xl flex items-center justify-center w-28"
            >
                <IconPhone size={22} className="rotate-135" />
            </button>
        </div>
    );
};

export default DialingScreen;
