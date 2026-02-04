import { Elysia } from "elysia";
import { GeminiSession } from "./gemini";

const app = new Elysia()
    .get("/", () => "Resonate Backend Active 🟢")

    .listen(8080);

// Better Approach: Use a Map
const sessions = new Map<string, GeminiSession>();

app.ws("/ws", {
    open(ws: any) {
        console.log("Client connected:", ws.id);
        const session = new GeminiSession(ws);
        sessions.set(ws.id, session);
    },
    message(ws: any, message: any) {
        const session = sessions.get(ws.id);
        if (session) {
            session.handleClientMessage(message);
        }
    },
    close(ws: any) {
        console.log("Client disconnected:", ws.id);
        const session = sessions.get(ws.id);
        if (session) {
            session.close();
            sessions.delete(ws.id);
        }
    }
});

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
