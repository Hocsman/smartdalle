const OpenAI = require("openai");

try {
    console.log("Testing OpenAI with dummy key...");
    const client = new OpenAI({ apiKey: "dummy" });
    console.log("Success! Client created.");
} catch (e) {
    console.error("FAILED:", e.message);
}

try {
    console.log("Testing OpenAI with empty string...");
    const client = new OpenAI({ apiKey: "" });
    console.log("Success! Client created.");
} catch (e) {
    console.error("FAILED:", e.message);
}

try {
    console.log("Testing OpenAI with undefined...");
    const client = new OpenAI({ apiKey: undefined });
    console.log("Success! Client created.");
} catch (e) {
    console.error("FAILED:", e.message);
}
