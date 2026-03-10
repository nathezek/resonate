import { useSession } from "../../../../stores/session_store";

const StartSessionScreen = () => {
    const { start_dailing } = useSession();
    return (
        <div className="w-full h-screen text-xl tracking-tight flex flex-col items-center justify-center gap-4">
            <button onClick={start_dailing}>Start Session</button>
        </div>
    );
};

export default StartSessionScreen;
