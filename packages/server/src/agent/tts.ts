import { GoogleGenAI } from "@google/genai";

export async function generateAudioFromText(text: string): Promise<Buffer> {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    console.log(`[TTS] Generating audio for text: "${text.substring(0, 50)}..."`);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: "Read the following text out loud: " + text },
                    ],
                },
            ],
            config: {
                responseModalities: ["AUDIO"],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates returned from Gemini TTS");
        }

        const candidate = response.candidates[0];

        let audioBase64 = null;
        let mimeType = "unknown";

        if (!candidate || !candidate.content || !candidate.content.parts) {
            throw new Error("No valid content found in Gemini response candidate");
        }

        // Find the inline data part containing the audio payload
        for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
                audioBase64 = part.inlineData.data;
                mimeType = part.inlineData.mimeType || "unknown";
                break;
            }
        }

        if (!audioBase64) {
            throw new Error("No inline audio data found in Gemini response");
        }

        console.log(`[TTS] Audio generated successfully. MimeType: ${mimeType}`);
        const rawBuffer = Buffer.from(audioBase64, "base64");
        
        if (mimeType.includes("audio/pcm") || mimeType.includes("audio/L16") || mimeType === "unknown") {
            console.log("[TTS] Wrapping raw PCM into WAV format.");
            // Generate WAV wrapper for 24000Hz 16-bit Mono (Gemini Standard)
            const sampleRate = 24000;
            const numChannels = 1;
            const bitDepth = 16;
            
            const header = Buffer.alloc(44);
            header.write('RIFF', 0);
            header.writeUInt32LE(36 + rawBuffer.length, 4);
            header.write('WAVE', 8);
            header.write('fmt ', 12);
            header.writeUInt32LE(16, 16);
            header.writeUInt16LE(1, 20);
            header.writeUInt16LE(numChannels, 22);
            header.writeUInt32LE(sampleRate, 24);
            header.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28);
            header.writeUInt16LE(numChannels * (bitDepth / 8), 32);
            header.writeUInt16LE(bitDepth, 34);
            header.write('data', 36);
            header.writeUInt32LE(rawBuffer.length, 40);
            
            return Buffer.concat([header, rawBuffer]);
        }

        return rawBuffer;
    } catch (error) {
        console.error("[TTS] Failed to generate audio:", error);
        throw error;
    }
}
