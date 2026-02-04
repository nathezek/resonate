import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080/ws");

ws.on("open", () => {
    console.log("Connected to server!");
    // Send a message to keep it alive or trigger something
    ws.send(JSON.stringify({ type: "test" }));

    // Keep open for 5 seconds to allow for Gemini interaction
    setTimeout(() => {
        console.log("Closing...");
        ws.close();
        process.exit(0);
    }, 5000);
});

ws.on("close", (code, reason) => {
    console.log(`Connection closed: ${code} ${reason}`);
});

ws.on("error", (err) => {
    console.error("Connection error:", err);
});
