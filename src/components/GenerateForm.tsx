"use client";

import { Button } from "@/components/ui/button";
import { FormEvent, useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Copy, Play } from "lucide-react";
import { getInputError } from "@/cst/helpers";

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

type GenerateFormProps = {
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
  const [errors, setErrors] = useState<{ input?: string }>({});
  const scriptContainerRef = useRef<HTMLDivElement>(null);
  const hasCompletion = completion.trim().length > 0;



  useEffect(() => {
    if (scriptContainerRef.current && completion) {
      const container = scriptContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [completion]);

  const validateForm = () => {
    const inputError = getInputError(input);
    setErrors(inputError ? { input: inputError } : {});
    return !inputError;
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    const inputError = getInputError(value);
    setErrors(inputError ? { input: inputError } : {});
  };

  const handleMagicFill = () => {
    const randomPrompt =
      BRAINROT_PROMPTS[Math.floor(Math.random() * BRAINROT_PROMPTS.length)];
    setInput(randomPrompt);
    const inputError = getInputError(randomPrompt);
    setErrors(inputError ? { input: inputError } : {});
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

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setProgress(25);
      setCompletion("");
      setCopyStatus("idle");

      const response = await fetch("http://localhost:3001/api/generate", {
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="group/input">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-3 group-hover/input:text-zinc-300 transition-colors duration-300">
          <Sparkles size={14} /> SCRIPT PROMPT
        </label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Describe your video concept or paste your script here..."
            rows={4}
            className={`w-full bg-black/20 border px-4 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none hover:border-white/30 transition-all duration-300 rounded-sm resize-none pr-32 ${errors.input
              ? "border-red-500/50 focus:border-red-500/70 hover:border-red-500/30"
              : "border-white/10 focus:border-white/50 hover:border-white/30"
              }`}
          />
          <div className="absolute right-2 bottom-2 pb-2 flex gap-2">
            <Button
              type="button"
              onClick={handleMagicFill}
              className="bg-black/20 hover:bg-black/30 text-zinc-300 border border-white/10 px-3 py-2 text-xs rounded-sm hover:border-white/30 transition-all duration-300 flex items-center gap-2"
              disabled={isLoading}
            >
              <Sparkles size={12} />
              <span>Magic</span>
            </Button>
            <Button
              type="submit"
              className="bg-white hover:bg-zinc-200 text-black font-medium px-3 py-2 text-xs rounded-sm transition-all duration-300 flex items-center gap-2"
              disabled={isLoading || !input.trim() || Object.keys(errors).length > 0}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs text-zinc-600">
          <span>Character count: {input.trim().length}/2000</span>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Generating script...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className={`space-y-4 ${hasCompletion ? "" : "opacity-40"}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Generated Script</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCopyScript}
              className="bg-black/20 hover:bg-black/30 text-zinc-300 border border-white/10 px-3 py-2 text-xs rounded-sm hover:border-white/30 transition-all duration-300 flex items-center gap-2"
              disabled={isLoading || !hasCompletion}
            >
              <Copy size={12} />
              <span>{copyStatus === "copied" ? "Copied" : "Copy"}</span>
            </Button>
            <Button
              type="button"
              onClick={onGenerateVideo}
              className="bg-white hover:bg-zinc-200 text-black font-medium px-3 py-2 text-xs rounded-sm transition-all duration-300 flex items-center gap-2"
              disabled={isLoading || !hasCompletion}
            >
              <Play size={12} fill="currentColor" />
              <span>Generate Video</span>
            </Button>
          </div>
        </div>
        <div
          ref={scriptContainerRef}
          className="bg-black/20 border border-white/10 rounded-sm p-6 h-[400px] overflow-y-auto text-zinc-300 text-sm leading-relaxed"
        >
          {hasCompletion ? (
            <div className="prose prose-invert prose-zinc max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {completion}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs uppercase tracking-wide text-zinc-600">
              Waiting for generation...
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
