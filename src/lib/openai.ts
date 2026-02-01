import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY || "dummy";

    if (!cachedClient) {
        cachedClient = new OpenAI({ apiKey });
    }
    return cachedClient;
}
