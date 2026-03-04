import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { run_tutor } from "./agent/run";

const app = Fastify({
  logger: true,  // enable built-in logging
});

console.log("🚀 Booting server...");

await app.register(websocket);

app.get("/ws", { websocket: true }, (socket, req) => {
  console.log("🔌 WebSocket connected");

  socket.on("message", async (message: Buffer) => {
    console.log("Message received:", message.toString());

    try {
      const result = await run_tutor(message.toString());

      console.log("Agent responded");

      socket.send(
        JSON.stringify({
          type: "response",
          data: result ?? "No response",
        })
      );
    } catch (err) {
      console.error("Agent failed:", err);

      socket.send(
        JSON.stringify({
          type: "error",
          data: "Agent failed",
        })
      );
    }
  });
});

try {
  await app.listen({ port: 3001 });
  console.log("✅ Server listening on http://localhost:3001");
} catch (err) {
  console.error("🔥 Failed to start server:", err);
  process.exit(1);
}
