import "server-only";
import { callGroqJson } from "@/lib/ai/groq";
import { callGeminiJson } from "@/lib/ai/gemini";
import { log } from "@/lib/log";

/** Groq first (you have a key), then Gemini, then null → deterministic fallback. */
export async function callAiJson(
  system: string,
  user: string
): Promise<{ text: string | null; provider: "groq" | "gemini" | "none" }> {
  const groq = await callGroqJson(system, user);
  if (groq) {
    log("ai", "provider", { provider: "groq" });
    return { text: groq, provider: "groq" };
  }

  const gemini = await callGeminiJson(system, user);
  if (gemini) {
    log("ai", "provider", { provider: "gemini" });
    return { text: gemini, provider: "gemini" };
  }

  log("ai", "provider", { provider: "none" });
  return { text: null, provider: "none" };
}
