import { Modality } from "@google/genai";

import { InMemoryRunner, StreamingMode, isFinalResponse } from "@google/adk";
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
  let sentRecovery = false;

  try {
    // 3. Run the agent with explicit SSE Streaming Configuration
    const stream = runner.runAsync({
      userId: userId,
      sessionId: adkSessionId,
      newMessage: user_message,
      runConfig: {
        streamingMode: StreamingMode.SSE,
        responseModalities: [Modality.TEXT],
      }
    });

    for await (const event of stream) {
      // Skip final events for text — they duplicate already-streamed partial content
      const isFinal = isFinalResponse(event);

      // Handle ADK errors (e.g. MALFORMED_FUNCTION_CALL) gracefully
      if ((event as any).errorCode) {
        console.warn(`⚠️ ADK Error: ${(event as any).errorCode}`, JSON.stringify({
          finishReason: (event as any).finishReason,
          invocationId: (event as any).invocationId,
        }));
        // Only send ONE recovery message per turn
        if (!final_response.trim() && !sentRecovery) {
          const recoveryMsg = "Hmm, I tripped over my own thoughts there. Let me try again — what were we working on?";
          onChunk(recoveryMsg);
          final_response += recoveryMsg;
          sentRecovery = true;
        }
        continue;
      }

      if (event.content?.parts) {
        for (const part of event.content.parts) {
          if ("text" in part && part.text) {
            final_response += part.text;
            if (!isFinal) {
              onChunk(part.text); // Only stream non-final events to the UI
            }
          }

          if ("functionCall" in part && part.functionCall) {
            const call = part.functionCall;
            console.log(`🔧 Tool called:, ${call.name}`);
            console.log(`🗳️ With arguments:, ${call.args}`)

            onChunk(JSON.stringify({
              type: "tool_function_call",
              tool: call.name,
              args: call.args
            }));
          }

          if ("functionResponse" in part && part.functionResponse) {
            const tool_function_response = part.functionResponse;

            console.log(`✅ Tool Function Response: ${tool_function_response.response}`)

            onChunk(JSON.stringify(
              {
                type: "tool_function_result",
                tool: tool_function_response.name,
                result: tool_function_response.response,
                success: true,
              }
            ));

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
