import "server-only";
import { log } from "@/lib/log";

/** Multimodal Gemini call — image + JSON response. */
export async function callGeminiVisionJson(
  system: string,
  imageBase64: string,
  mimeType: string
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.startsWith("your-")) return null;

  // strip data-url prefix if present
  const raw = imageBase64.includes(",")
    ? imageBase64.split(",")[1]!
    : imageBase64;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: system },
              { inlineData: { mimeType, data: raw } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      log("ai", "gemini_vision_http_error", { status: res.status });
      return null;
    }

    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text)
        .join("") ??
      null
    );
  } catch (e) {
    log("ai", "gemini_vision_fail", { error: String(e) });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
