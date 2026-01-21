export interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export async function askGemini(history: ChatMessage[]) {
    try {
        const response = await fetch("http://localhost:8080/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // We send the entire conversation history array
            body: JSON.stringify({ contents: history }),
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Backend Error:", error);
        throw error;
    }
}
