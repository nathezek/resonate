import { InMemoryRunner } from "@google/adk";
import { tutor_agent } from "./tutor";

const APP_NAME = "resonate";
const runner = new InMemoryRunner({
  appName: APP_NAME,
  agent: tutor_agent,
});

/**
 * ADK auto-generates UUIDs and doesn't let us pick 'session_1',
 * we use this map to link your preferred ID to the ADK's real ID.
 */
const sessionMap = new Map<string, string>();

export const run_tutor = async (user_input: string) => {
  const userId = "user_1";
  const myFriendlySessionId = "session_1";
  let adkSessionId: string;

  // 1. Resolve the real Session ID
  if (sessionMap.has(myFriendlySessionId)) {
    adkSessionId = sessionMap.get(myFriendlySessionId)!;
  } else {
    // Create it and let the ADK generate a real UUID
    const session = await runner.sessionService.createSession({
      appName: APP_NAME,
      userId: userId,
    });

    adkSessionId = session.id;
    sessionMap.set(myFriendlySessionId, adkSessionId);
    console.log(`✨ Created new ADK Session: ${adkSessionId} for ${myFriendlySessionId}`);
  }

  // 2. Format the message for the LLM
  const user_message = {
    role: "user",
    parts: [{ text: user_input }],
  };

  let final_response = "";

  try {
    // 3. Run the agent using the CAPTURED adkSessionId
    const stream = runner.runAsync({
      userId: userId,
      sessionId: adkSessionId,
      newMessage: user_message,
    });

    for await (const event of stream) {
      // The ADK emits events; this specifically extracts 'content' events
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          if ("text" in part && part.text) {
            final_response += part.text;
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Agent Execution Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now.";
  }

  return final_response;
};
