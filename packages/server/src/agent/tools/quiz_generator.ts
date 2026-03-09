import { FunctionTool } from "@google/adk";
import { z } from "zod";

export const quiz_generator = new FunctionTool({
    name: "generate_quiz",
    description: `Generates a quiz question to test the student's understanding.

Use this when:
- Student claims they understand something — test them!
- After explaining a concept — reinforce learning
- Student asks to practice
- To make learning interactive and fun

Generate ONE question at a time. Wait for the student's answer before revealing if they're correct.`,

    parameters: z.object({
        topic: z.string().describe("The topic or concept to quiz on"),
        difficulty: z
            .enum(["beginner", "intermediate", "advanced"])
            .describe("Question difficulty"),
        question_type: z
            .enum(["multiple_choice", "true_false", "short_answer"])
            .describe("Type of question to generate"),
    }),

    execute: async ({ topic, difficulty, question_type }) => {
        return {
            success: true,
            topic: topic,
            difficulty: difficulty,
            question_type: question_type,
            instruction: `Generate a ${difficulty} ${question_type.replace("_", " ")} question about "${topic}".

Present the question clearly and wait for the student's response before revealing the answer.

Be encouraging regardless of whether they get it right or wrong.`,
        };
    },
});
