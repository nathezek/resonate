import { useChat } from "../../../../../stores/chat_store";

const CurrentUserMessageDisplayer = () => {
    const { current_user_message } = useChat();

    if (!current_user_message) {
        return null;
    }

    return (
        <div className="w-full flex overflow-hidden mt-1 items-center h-fit truncate line-clamp-2 px-4 py-2 gap-x-4 rounded-b-xl rounded-t-lg bg-neutral-800/90 text-neutral-200 text-sm">
            <img src="/default_avatar.png" width={10} height={10} /> :
            <span>{current_user_message}</span>
        </div>
    );
};

export default CurrentUserMessageDisplayer;
