import { LlmAgent } from "@google/adk";

export const tutor_agent = new LlmAgent({
    name: "tutor",
    model: "gemini-2.5-flash",
    instruction: `You are a tutor.
        Explain concepts clearly.
        Use bollet points when helpful.
        Keep answers structured.`,
});
