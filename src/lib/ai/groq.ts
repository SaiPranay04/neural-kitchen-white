import "server-only";
import { log } from "@/lib/log";

export async function callGroqJson(system: string, user: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.startsWith("your-")) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      log("ai", "groq_http_error", { status: res.status, body: body.slice(0, 200) });
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    log("ai", "groq_fail", { error: String(e) });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
