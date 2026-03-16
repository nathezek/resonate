import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { run_tutor } from "./agent/run";
import { generateAudioFromText } from "./agent/tts";

const app = Fastify({
    logger: true,
});

console.log("🚀 Booting server...");

await app.register(websocket);

app.get("/ws", { websocket: true }, (socket, req) => {
    console.log("🔌 WebSocket connected");

    socket.on("message", async (message: Buffer) => {
        const userInput = message.toString();
        // Ignore empty messages, they might cause the TTS model to throw
        if (!userInput.trim()) return;

        console.log("Message received:", userInput);

        try {
            let textBuffer = "";
            let ttsPromiseChain = Promise.resolve();

            const processSentence = (sentence: string) => {
                if (!sentence.trim()) return;
                ttsPromiseChain = ttsPromiseChain.then(async () => {
                    try {
                        const audioBuffer = await generateAudioFromText(sentence);
                        socket.send(audioBuffer);
                        console.log("🔊 Sequence audio payload sent to client.");
                    } catch (ttsErr: any) {
                        console.error("❌ TTS generation sequence failed:", ttsErr);
                        socket.send(
                            JSON.stringify({
                                type: "error",
                                data: "Failed to generate audio playback",
                            })
                        );
                    }
                });
            };

            // 1. Call run_tutor with the streaming callback
            const fullResult = await run_tutor(userInput, (chunk) => {
                if (chunk.startsWith("{") && chunk.includes('"type"')) {
                    socket.send(chunk);
                } else {
                    // Strip emojis and weird symbols before sending to TTS buffer
                    let textForAudio = chunk.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
                    
                    // Strip markdown asterisks, quotes, hashes, and backticks so Deepgram doesn't pronounce them out loud
                    textForAudio = textForAudio.replace(/[*_~"#`]/g, '');

                    textBuffer += textForAudio;
                    
                    // Regex looking for sentence terminators (. ! ? \n) followed by a space, or newlines
                    const sentenceEndRegex = /([.!?]+[\s]+|\n+)/;
                    let match;

                    while ((match = textBuffer.match(sentenceEndRegex))) {
                        const splitIndex = match.index! + match[0].length;
                        const sentence = textBuffer.slice(0, splitIndex).trim();
                        textBuffer = textBuffer.slice(splitIndex);
                        
                        processSentence(sentence);
                    }

                    socket.send(
                        JSON.stringify({
                            type: "chunk",
                            data: chunk,
                        }),
                    );
                }
            });

            // flush any remaining buffered text
            if (textBuffer.trim()) {
                processSentence(textBuffer.trim());
            }

            console.log("Agent finished streaming text. Waiting for final TTS generation to complete...");
            
            // Wait for all queued audio requests to finish generating before fully closing the turn
            await ttsPromiseChain;

            console.log("✅ Turn fully complete. Text and sequence audio delivered.");

            // 3. Send the final response message
            socket.send(
                JSON.stringify({
                    type: "response",
                    data: fullResult ?? "No response",
                }),
            );
        } catch (err) {
            console.error("❌ Agent failed:", err);

            socket.send(
                JSON.stringify({
                    type: "error",
                    data: "Agent failed",
                }),
            );
        }
    });

    socket.on("close", () => {
        console.log("🔌 WebSocket disconnected");
    });
});

try {
    await app.listen({ port: 3001 });
    console.log("✅ Server listening on http://localhost:3001 🥂");
} catch (err) {
    console.error("🔥 Failed to start server:", err);
    process.exit(1);
}
