import { useEffect, useRef, useState } from "react";
import { useSession } from "../../../stores/session_store";
import { IconPhone } from "@tabler/icons-react";

const DialingScreen = () => {
    const { start_session, end_session } = useSession();
    const ringingRef = useRef<HTMLAudioElement>(null);
    const answeringRef = useRef<HTMLAudioElement>(null);

    const [phase, setPhase] = useState<"ringing" | "answering">("ringing");

    useEffect(() => {
        const ringingAudio = ringingRef.current;
        const answeringAudio = answeringRef.current;

        // Play the ringing sound
        if (ringingAudio) {
            ringingAudio.play();
        }

        // After 10 seconds, transition to answering
        const dialTimeout = setTimeout(() => {
            if (ringingAudio) {
                ringingAudio.pause();
                ringingAudio.currentTime = 0;
            }

            if (answeringAudio) {
                answeringAudio.play();
            }

            setPhase("answering");
        }, 10000);

        return () => {
            clearTimeout(dialTimeout);

            // Use the copied variables (guaranteed to be the same)
            if (ringingAudio) {
                ringingAudio.pause();
                ringingAudio.currentTime = 0;
            }
            if (answeringAudio) {
                answeringAudio.pause();
                answeringAudio.currentTime = 0;
            }
        };
    }, []);

    const handleAnswerEnd = () => {
        start_session();
    };

    return (
        <div className="dialing_screen text-xl w-full h-screen flex flex-col items-center justify-center">
            {/* Hidden audio element */}
            <audio ref={ringingRef} src="/ringtones/nothing_p1.mp3" />
            <audio
                ref={answeringRef}
                onEnded={handleAnswerEnd}
                src="/ringtones/answering_tone.mp3"
            />

            {/* Status Text */}
            <h1 className="">Calling Ress...</h1>
            {phase === "ringing" ? (
                <p className="text-sm use_ibm opacity-70 mt-1 mb-4">
                    Connecting to your study session
                </p>
            ) : (
                <p className="text-sm use_ibm opacity-70 mt-1 mb-4">
                    Connected, Starting Session...
                </p>
            )}
            <button
                onClick={end_session}
                className="bg-red-600/80 text-red-50 use_ibm my-4 h-12 rounded-2xl text-sm flex items-center justify-center w-36"
            >
                <IconPhone size={24} className="rotate-135" />
            </button>
        </div>
    );
};

export default DialingScreen;
