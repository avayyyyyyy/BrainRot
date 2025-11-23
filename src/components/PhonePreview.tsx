"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface PhonePreviewProps {
  script: string | null;
  generateVideoTrigger?: number;
}

export default function PhonePreview({ script, generateVideoTrigger }: PhonePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [scriptLines, setScriptLines] = useState<string[]>([]);
  const [needsAudio, setNeedsAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastProcessedTrigger = useRef<number>(0);
  const previousScript = useRef<string | null>(null);

  useEffect(() => {
    if (!script) {
      setScriptLines([]);
      setNeedsAudio(false);
      setIsPlaying(false);
      setCurrentCaption("");
      setCurrentLineIndex(0);
      setAudioUrl(null);
      previousScript.current = null;
      return;
    }

    if (script === previousScript.current) {
      return;
    }

    setScriptLines(script.split("\n").filter((line) => line.trim() !== ""));
    setNeedsAudio(true);
    setIsPlaying(false);
    setCurrentCaption("");
    setCurrentLineIndex(0);
    setAudioUrl(null);
    previousScript.current = script;
  }, [script]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    selectRandomVideo();
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current || !isPlaying || scriptLines.length === 0) return;

    const updateCaption = () => {
      const currentTime = audioRef.current?.currentTime || 0;
      const totalDuration = audioRef.current?.duration || 0;

      if (totalDuration) {
        const progress = (currentTime / totalDuration) * 0.7;
        const lineIndex = Math.floor(progress * scriptLines.length);

        if (lineIndex !== currentLineIndex && lineIndex < scriptLines.length) {
          setTimeout(() => {
            setCurrentLineIndex(lineIndex);
            const words = scriptLines[lineIndex].split(" ");
            const shortCaption = words.slice(0, 8).join(" ");
            setCurrentCaption(shortCaption);
          }, 300);
        } else {
          const line = scriptLines[lineIndex];
          const words = line.split(" ");
          const wordProgress = ((progress * scriptLines.length) % 1) * 0.7;
          const wordIndex = Math.floor(wordProgress * words.length);

          const startWord = Math.max(0, wordIndex);
          const endWord = Math.min(words.length, startWord + 8);
          const visibleWords = words.slice(startWord, endWord).join(" ");

          if (visibleWords !== currentCaption) {
            setCurrentCaption(visibleWords);
          }
        }
      }
    };

    const interval = setInterval(updateCaption, 200);
    return () => clearInterval(interval);
  }, [isPlaying, currentLineIndex, scriptLines, currentCaption]);

  const generateAudio = useCallback(async () => {
    if (!script) {
      return;
    }

    try {
      setIsGenerating(true);
      setNeedsAudio(false);
      setAudioUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: script }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setCurrentCaption("Audio ready! Click play to start");

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      setNeedsAudio(true);
      setCurrentCaption("Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  }, [script]);

  useEffect(() => {
    if (!script || !generateVideoTrigger) {
      return;
    }

    if (generateVideoTrigger === lastProcessedTrigger.current) {
      return;
    }

    lastProcessedTrigger.current = generateVideoTrigger;
    generateAudio();
  }, [generateVideoTrigger, script, generateAudio]);

  const handlePlayback = async () => {
    if (!audioRef.current) {
      return;
    }

    if (!audioUrl) {
      setNeedsAudio(true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentCaption("Audio paused");
      return;
    }

    try {
      if (audioRef.current.readyState < 2) {
        await new Promise((resolve) => {
          audioRef.current?.addEventListener("canplay", resolve, { once: true });
        });
      }

      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentCaption(scriptLines[0] || "Playing...");
    } catch (error) {
      console.error("Audio playback failed:", error);
      setCurrentCaption("Tap to play audio (mobile requires user interaction)");
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentCaption("Audio finished! Click play to restart");
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const selectRandomVideo = () => {
    const randomIndexBet0and1 = Math.floor(Math.random() * 2);
    if (randomIndexBet0and1 === 0) {
      if (videoRef.current) {
        videoRef.current.src = "/video.mp4";
        videoRef.current.load();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.src = "/video1.mp4";
        videoRef.current.load();
      }
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentLineIndex(0);
      setCurrentCaption(scriptLines[0] || "");
      if (!isPlaying) {
        audioRef.current.play().catch(() => undefined);
        setIsPlaying(true);
      }
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="relative w-[280px] h-[540px] border bg-black transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-xl z-20" />

      <div className="w-full h-full bg-[#080808] relative flex flex-col">
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onError={(e) => console.error("Video error:", e)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-6 text-white/60 text-xs z-10">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 border border-white/60 rounded-sm">
              <div className="w-3 h-2 bg-white/60 rounded-sm m-px" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-0">
          <div className="absolute inset-0 opacity-20 flex items-center justify-center overflow-hidden">
            <div className="w-64 h-64 bg-zinc-800 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 space-y-6">
            {isGenerating ? (
              <div className="space-y-3 opacity-60">
                <div className="w-12 h-12 border-2 border-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
                </div>
                <p className="text-xs text-zinc-400">Generating audio...</p>
              </div>
            ) : currentCaption ? (
              <div className="space-y-4">
                <div className="w-2 h-2 bg-red-500 rounded-full mx-auto animate-pulse" />
                <p className="text-lg font-bold text-white leading-tight max-w-xs">
                  {currentCaption}
                </p>
              </div>
            ) : script ? (
              needsAudio ? (
                <div className="space-y-3 opacity-40">
                  <div className="w-12 h-12 border-2 border-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Volume2 size={20} className="text-zinc-700" />
                  </div>
                  <p className="text-xs text-zinc-500">Ready to generate audio</p>
                </div>
              ) : (
                <div className="space-y-3 opacity-40">
                  <div className="w-12 h-12 border-2 border-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Play size={20} fill="currentColor" className="text-zinc-700 ml-1" />
                  </div>
                  <p className="text-xs text-zinc-500">Press play to start</p>
                </div>
              )
            ) : (
              <div className="space-y-3 opacity-30">
                <div className="w-12 h-12 border-2 border-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Play size={20} fill="currentColor" className="text-zinc-700 ml-1" />
                </div>
                <p className="text-xs text-zinc-500">Waiting for script...</p>
              </div>
            )}
          </div>
        </div>

        {script && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
            <button
              onClick={handlePlayback}
              disabled={isGenerating}
              className="bg-white hover:bg-zinc-200 text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border border-black/30 border-t-black rounded-full animate-spin" />
              ) : needsAudio ? (
                <Volume2 size={18} />
              ) : isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={16} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            {audioUrl && !needsAudio && (
              <button
                onClick={handleRestart}
                className="bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        )}

        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black/90 to-transparent z-10 flex items-end pb-4 px-6 justify-between text-white/60 text-[10px]">
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider opacity-70">BrainRot</div>
            <div className="opacity-50">Audio Preview</div>
          </div>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-white/20" />
            <div className="w-4 h-4 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={() => {
          setIsPlaying(false);
          setIsGenerating(false);
          setNeedsAudio(true);
          setCurrentCaption("Audio loading failed");
        }}
        playsInline
        preload="metadata"
      />
    </div>
  );
}
