"use client";

import { Button } from "@/components/ui/button";
import { FormEvent, useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Random brainrot prompts
const BRAINROT_PROMPTS = [
  "pov: explaining to my FBI agent why I googled 'how to adopt a raccoon' at 3am",
  "me trying to convince my mom that buying 17 different types of pasta is a good financial decision",
  "my last braincell explaining why I need to reorganize my entire room at 2am before an exam",
  "explaining to my therapist why following 500 cat accounts is self-care",
  "me justifying why I need to buy another plant when I've killed 27 already",
  "trying to explain to my friends why I have 74 unfinished projects but starting a new one",
  "my brain at 3am remembering that one time I said 'you too' to a waiter who said 'enjoy your meal'",
  "explaining to my boss why watching 6 hours of cooking videos is 'research'",
  "me convincing myself that starting a new Netflix series at 1am is a good idea",
  "justifying why I need to buy the same shirt in 8 different colors",
  "explaining to my dentist why I have 47 different types of coffee",
  "me at 4am calculating how much sleep I'll get if I fall asleep right now",
  "trying to explain my Spotify playlist that goes from heavy metal to Disney songs",
  "me explaining why I need to learn a new hobby when I haven't finished learning the last 12",
  "justifying why watching conspiracy theory videos about pigeons is educational",
];

interface GenerateFormProps {
  onScriptGenerated: (script: string) => void;
  onGenerateVideo: () => void;
}

export default function GenerateForm({
  onScriptGenerated,
  onGenerateVideo,
}: GenerateFormProps) {
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (scriptContainerRef.current && completion) {
      const container = scriptContainerRef.current;
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [completion]);

  const handleMagicFill = () => {
    const randomPrompt =
      BRAINROT_PROMPTS[Math.floor(Math.random() * BRAINROT_PROMPTS.length)];
    setInput(randomPrompt);
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(completion);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy script:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setProgress(25);
      setCompletion("");
      setCopyStatus("idle");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate script");
      }

      setProgress(50);

      // Read the response as a stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and append the new chunk
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setCompletion(text);

        // Update progress based on content length
        setProgress(Math.min(90, 50 + (text.length / 500) * 40)); // Approximate progress
      }

      setProgress(100);
      onScriptGenerated(text);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate script. Please try again.");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="bg-[#111111] rounded-2xl p-6 border border-[#B8860B]/20 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤯</span>
            <h2 className="text-[#E5E5E5] text-lg font-medium">
              Release your intrusive thoughts...
            </h2>
          </div>
          <Button
            type="button"
            onClick={handleMagicFill}
            className="bg-[#111111] hover:bg-[#1a1a1a] text-[#DAA520] h-10 px-4 rounded-lg border border-[#B8860B]/20 flex items-center gap-2 hover:scale-105 transition-all duration-200 hover:border-[#DAA520]/50"
            disabled={isLoading}
            title="Magic Fill"
          >
            <span className="text-base font-medium">Magic</span>
            <span className="text-xl animate-pulse">✨</span>
          </Button>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="pov: me explaining why watching 6 hours of cat videos is 'research'"
            className="w-full p-4 rounded-xl bg-[#0A0A0A] border border-[#B8860B]/20 text-[#E5E5E5] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/30"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#111111] hover:bg-[#1a1a1a] text-[#DAA520] font-medium px-4 py-1.5 h-auto text-sm rounded-lg border border-[#B8860B]/20 hover:scale-105 transition-all duration-200 hover:border-[#DAA520]/50"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "Cooking... 👨‍🍳" : "Let it cook 🔥"}
          </Button>
        </div>
        <div className="flex justify-between items-center text-sm text-[#888888]">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-[#0A0A0A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#DAA520] to-[#B8860B] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span>Brain damage: {progress}%</span>
          </div>
          <span>
            {progress === 100 ? "Brain successfully rotted" : "More rot needed"}
          </span>
        </div>

        {/* Generated Script Display */}
        {completion && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 relative z-20">
              <h3 className="text-[#DAA520] font-medium">
                Your Brainrot Script:
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCopyScript}
                  className="bg-[#111111] hover:bg-[#1a1a1a] text-[#DAA520] font-medium px-3 py-1.5 h-auto text-sm rounded-lg border border-[#B8860B]/20 flex items-center gap-2"
                  disabled={isLoading}
                >
                  <span>
                    {copyStatus === "copied" ? "Copied! ✨" : "Copy 📋"}
                  </span>
                </Button>
                <Button
                  type="button"
                  onClick={onGenerateVideo}
                  className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] hover:from-[#B8860B] hover:to-[#DAA520] text-black font-medium px-3 py-1.5 h-auto text-sm rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
                  disabled={isLoading}
                >
                  <span>Generate Video 🎬</span>
                </Button>
              </div>
            </div>
            <div className="relative z-10">
              <div
                ref={scriptContainerRef}
                className="bg-[#0A0A0A] rounded-xl border border-[#B8860B]/20 h-[400px] overflow-y-auto relative"
              >
                <div className="p-6">
                  <div className="prose prose-invert prose-gold max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {completion}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
