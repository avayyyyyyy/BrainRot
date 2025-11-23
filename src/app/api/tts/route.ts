import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    const cleanText = text
      .replace(/^#.*$/gm, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .replace(/\n+/g, " ")
      .trim();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: cleanText,
    });

    const audioData = await response.arrayBuffer();

    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioData.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response("Failed to generate speech", { status: 500 });
  }
}
