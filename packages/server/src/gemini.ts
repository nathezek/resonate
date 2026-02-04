import WebSocket from "ws";

export class GeminiSession {
    private geminiWs?: WebSocket;
    private clientWs: any; // Elysia WebSocket

    constructor(clientWs: any) {
        this.clientWs = clientWs;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            clientWs.close();
            return;
        }

        const host = "generativelanguage.googleapis.com";
        const uri = `wss://${host}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

        this.geminiWs = new WebSocket(uri);

        this.setupGeminiHandlers();
    }

    private setupGeminiHandlers() {
        if (!this.geminiWs) return;
        this.geminiWs.on("open", () => {
            console.log("Connected to Gemini");
            // Initial Setup if needed (e.g., system instructions)
            this.sendInitialSetup();
        });

        this.geminiWs.on("message", async (data: any) => {
            // Forward raw message to client (frontend handles parsing)
            // Or we can parse here. For speed, forwarding raw JSON is often easiest,
            // but let's parse to ensure we only send what's needed or add logging.
            try {
                let msgStr: string;
                if (Buffer.isBuffer(data)) {
                    msgStr = data.toString('utf-8');
                } else if (Array.isArray(data)) {
                    msgStr = Buffer.concat(data).toString('utf-8');
                } else {
                    msgStr = data.toString();
                }

                // Temporary file logging for debugging
                await Bun.write("server.log", `Raw Gemini Message: ${msgStr}\n`);

                const response = JSON.parse(msgStr);
                const logMsg = `Parsed Message: ${JSON.stringify(response, null, 2)}\n`;
                console.log(logMsg);

                this.clientWs.send(JSON.stringify(response));
            } catch (e) {
                console.error("Error parsing Gemini message", e);
                await Bun.write("server.log", `Error parsing: ${e}\n`);
            }
        });

        this.geminiWs.on("close", async (code, reason) => {
            const msg = `Gemini connection closed: ${code} - ${reason.toString()}\n`;
            console.log(msg);
            await Bun.write("server.log", msg);
            this.clientWs.close();
        });

        this.geminiWs.on("error", (error: any) => {
            console.error("Gemini connection error:", error);
            this.clientWs.close();
        });
    }

    // Send initial configuration
    private sendInitialSetup() {
        const setup = {
            setup: {
                model: "models/gemini-2.5-flash-native-audio-latest",
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: "Puck", // Upbeat English voice
                            },
                        },
                    },
                },
            },
        };
        this.sendToGemini(setup);
    }

    public handleClientMessage(message: any) {
        // Message from Client (Browser) -> Send to Gemini
        // Message is likely a JSON with 'realtimeInput' or 'toolResponse'
        try {
            if (typeof message === "string") {
                this.sendToGemini(JSON.parse(message));
            } else if (typeof message === "object") {
                this.sendToGemini(message);
            }
        } catch (e) {
            console.error("Error handling client message", e);
        }
    }

    private sendToGemini(data: any) {
        if (this.geminiWs?.readyState === WebSocket.OPEN) {
            this.geminiWs.send(JSON.stringify(data));
        }
    }

    public close() {
        this.geminiWs?.close();
    }
}
