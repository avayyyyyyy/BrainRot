import OpenAI from "openai";

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // Clean the text by removing headers and special characters
    const cleanText = text
      .replace(/^#.*$/gm, "") // Remove headers
      .replace(/[^\w\s,.?!'"()-]/g, "") // Keep only basic punctuation
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: cleanText,
    });

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();

    // Return the audio data with appropriate headers
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
