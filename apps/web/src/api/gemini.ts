export async function askGemini(prompt: string) {
    try {
        // We now request our OWN server
        const response = await fetch("http://localhost:8080/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();
        return data.text; // The 'text' field we defined in Rust
    } catch (error) {
        console.error("Backend Error:", error);
        throw error;
    }
}
