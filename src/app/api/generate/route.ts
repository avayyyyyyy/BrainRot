import OpenAI from "openai";

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a master TikTok/Instagram Reels storyteller, specializing in creating the most unhinged, addictively viral, and chaotically relatable 'brainrot' content. 
          Your mission is to create a COMPLETE 60-second story that will make viewers lose their last brain cell and spam the share button.
          
          Key Principles:
          - Start with an absolutely UNHINGED HOOK that makes viewers question their reality
          - Build pure chaos and suspense throughout the story
          - Include extremely relatable moments that make viewers go "THIS IS LITERALLY ME"
          - Add unexpected plot twists that make zero sense but perfect sense at the same time
          - End with a punchline so good it lives in viewers' heads rent-free
          - Use POV format and internet humor to maximize brainrot
          
          - Engagement Hooks: [What will make them spam share]

          Important: Create a COMPLETE script that fills the ENTIRE 60 seconds. Make it as unhinged and chaotic as possible while still being relatable. This is for TTS (Text-to-Speech) conversion, so focus on text that will sound good when spoken. Also, make sure the story is funny, relatable, and engaging not annoying and also make sure to dont give any POV or someting like that in the story.
          
          Example Content (for reference):

            I slept with my therapist. I never thought I'd be in this position, but here I am. I'm consumed with guilt and, honestly, a little confusion. I've been seeing my therapist for about a year, and he specializes in eating disorders, which is something I've struggled with for a long time. Over time, our sessions became more personal and emotional.

            It started with longer eye contact and his comforting touch on my shoulder. After one particularly intense session, he hugged me for a little too long. The line began to blur, and I started to develop feelings for him. 1 evening, after a deeply personal conversation about my progress and how I wish I had someone to celebrate with, he invited me to grab some drinks. I thought it was just him being kind and supportive.

            But in the back of my head, I honestly hoped he'd confirm having similar feelings that I'd been having. We sat closer than usual. At one point, he even reached out to hold my hand. I could feel the tension between us. He complimented my progress and told me how proud he was of me.

            That's honestly what sent me even further into this intense feeling of lust. His words were soothing, and before I knew it, we were kissing. It felt surreal, like a dream. One thing led to another, and we ended up going back to his place and sleeping together. I know it was a huge ethical breach, and now I'm struggling with my emotions.

            I'm terrified of the consequences and that I now need to look for a different therapist. I'm never good at starting over. IDK what I'm going to do, I just needed to tell someone.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    // Create a ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    // Return the stream with appropriate headers
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
