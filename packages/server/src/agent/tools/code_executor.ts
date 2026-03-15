import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { spawn } from "node:child_process";

export const code_executor = new FunctionTool({
    name: "run_python",
    description: "Runs a Python code snippet and returns stdout. Use for demos, calculations, or verifying concepts.",

    parameters: z.object({
        code: z.string().describe("Python code to execute. Must be a valid JSON-escaped string — use \\n for newlines, \\\" for quotes."),
    }),

    execute: async ({ code }) => {
        try {
            const results = await run_python(code);

            return {
                success: true,
                output: results || "No Output ⛓‍💥"
            }
        } catch(error: any) {

            return {
                success: false,
                error:  error.message || "Unknown error 🤷‍♂"
            }

        }
    },
});


// ----- HELPER FUNCTION -----
function run_python(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn("python3", ["-c", code]);

        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("close", (exitCode) => {
            if (exitCode === 0) {
                resolve(stdout.trim());
            } else {
                reject(new Error(stderr.trim() || `Process exited with code ${exitCode}`));
            }
        });

        process.on("error", (err) => {
            reject(err);
        });
    });
}
