import { SCRIPT_GENERATOR_PROMPT } from "@/cst/prompts";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: SCRIPT_GENERATOR_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Script generation error:", error);
    return new Response("Failed to generate script", { status: 500 });
  }
}
