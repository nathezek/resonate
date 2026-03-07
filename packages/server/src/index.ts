import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { run_tutor } from "./agent/run";

const app = Fastify({
    logger: true,
});

console.log("🚀 Booting server...");

await app.register(websocket);

app.get("/ws", { websocket: true }, (socket, req) => {
    console.log("🔌 WebSocket connected");

    socket.on("message", async (message: Buffer) => {
        const userInput = message.toString();
        console.log("Message received:", userInput);

        try {
            // 1. Call run_tutor with the streaming callback
            const fullResult = await run_tutor(userInput, (chunk) => {
                if (chunk.startsWith("{") && chunk.includes('"type"')) {
                    socket.send(chunk);
                } else {
                    socket.send(
                        JSON.stringify({
                            type: "chunk",
                            data: chunk,
                        }),
                    );
                }
            });

            console.log("Agent finished responding");

            // 2. Send the final response message
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
