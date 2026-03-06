import { Modality } from "@google/genai";

import { InMemoryRunner, StreamingMode } from "@google/adk";
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

export const run_tutor = async (user_input: string, onChunk: (chunk: string) => void) => {
  const userId = "user_1";
  const myFriendlySessionId = "session_1";
  let adkSessionId: string;

  // 1. Resolve the real Session ID
  adkSessionId = await session_resolver(myFriendlySessionId, userId)

  // 2. Format the message for the LLM
  const user_message = format_user_message(user_input);

  let final_response = "";

  try {
    // 3. Run the agent with explicit SSE Streaming Configuration
    const stream = runner.runAsync({
      userId: userId,
      sessionId: adkSessionId,
      newMessage: user_message,
      runConfig: {
        streamingMode: StreamingMode.SSE, // TODO: I will change this to BIDI when switching to voice mode
        responseModalities: [Modality.TEXT],
      }
    });

    for await (const event of stream) {
      // The ADK emits events; this specifically extracts 'content' events
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          if ("text" in part && part.text) {
            final_response += part.text;
            onChunk(part.text); // Send it to the UI immediately!
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Agent Execution Error:", error);
    onChunk("I'm sorry, I'm having trouble connecting to my brain right now.");
  }

  // 4. Return the final response
  return final_response;
};

// ------- HELPER FUNCTIONS ---------

// Resolves the session ID for the given friendly session ID and user ID
async function session_resolver(myFriendlySessionId: string, userId: string) {
    if (sessionMap.has(myFriendlySessionId)) {
     return sessionMap.get(myFriendlySessionId)!;
    } else {
      // Create it and let the ADK generate a real UUID
      const session = await runner.sessionService.createSession({
        appName: APP_NAME,
        userId: userId,
      });

      const newAdkSessionId = session.id;
      sessionMap.set(myFriendlySessionId, newAdkSessionId);
      console.log(`✨ Created new ADK Session: ${newAdkSessionId} for ${myFriendlySessionId}`);

        return newAdkSessionId;
    }
}

// Formats the user input into a message object for the LLM
function format_user_message(user_input: string) {
    const user_message = {
      role: "user",
      parts: [{ text: user_input }],
    };

    return user_message;
}
