import { FunctionTool } from "@google/adk";
import { z } from "zod";
import { spawn } from "node:child_process";

export const code_executor = new FunctionTool({
    name: "run_python",
    description: "Executes Python code and returns the output. Use this when you need to run code or demonstrate a programming concept with working examples.",

    parameters: z.object({
        code: z.string().describe("The Python code to execute."),
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
