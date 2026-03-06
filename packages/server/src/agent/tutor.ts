import { LlmAgent } from "@google/adk";
import { code_executor } from "./tools/code_executor";

export const tutor_agent = new LlmAgent({
    name: "tutor",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    instruction: `You are a tutor.
        Explain concepts clearly.
        Use bollet points when helpful.
        Keep answers structured.

        When demonstrating programming concepts, use the 'run_python' tool to show working examples.
        `,
        tools: [code_executor]
});
