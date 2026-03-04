import { InMemoryRunner } from "@google/adk";
import { tutor_agent } from "./tutor";

export const run_tutor = async (user_input: string) => {
    const runner = new InMemoryRunner({
        appName: "tutor",
        agent: tutor_agent,
    });

    const user_message = {
        role: "user",
        parts: [{ text: user_input }],
    };

    let final_response = "";

    for await (const event of runner.runAsync({
        userId: "user_1",
        sessionId: "session_1",
        newMessage: user_message,
    })) {
        if (event.content?.parts) {
            for (const part of event.content.parts) {
                if ("text" in part && part.text) {
                    final_response += part.text;
                }
            }
        }
    }

    return final_response;
};
