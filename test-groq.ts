import { config } from "dotenv";
config();
import { Groq } from "groq-sdk";

async function main() {
    try {
        console.log("GROQ API KEY IS:", process.env.GROQ_API_KEY ? "Set" : "Not Set");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "hello" }],
            model: "llama3-70b-8192",
            temperature: 0.1,
        });
        console.log("Success:", completion.choices[0]?.message?.content);
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
