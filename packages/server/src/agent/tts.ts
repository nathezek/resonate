export async function generateAudioFromText(text: string): Promise<Buffer> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        throw new Error("DEEPGRAM_API_KEY environment variable is missing.");
    }

    console.log(`[TTS] Requesting Deepgram Aura for: "${text.substring(0, 50)}..."`);

    try {
        const response = await fetch(
            `https://api.deepgram.com/v1/speak?model=aura-2-asteria-en`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Token ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deepgram API Error (${response.status}): ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log(`[TTS] Deepgram audio generated successfully (${arrayBuffer.byteLength} bytes).`);

        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error("[TTS] Failed to generate Deepgram audio:", error);
        throw error;
    }
}
