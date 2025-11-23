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
      const currentLine = scriptLines[currentLineIndex] || "";

      setCurrentCaption(currentLine);
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

      const response = await fetch("http://localhost:3001/api/tts", {
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
      setCurrentCaption("Ready to play");

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
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
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
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="relative w-full max-w-xs aspect-[9/16] sm:max-w-sm md:max-w-md bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-stone-600">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />

        <div className="w-full h-full bg-neutral-950 relative flex flex-col">
          <div className="absolute inset-0 bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              onError={(e) => console.error("Video error:", e)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </div>

          <div className="absolute top-0 left-0 right-0 pt-2 px-4 sm:px-6 flex items-center bg-black pb-2  justify-between text-white/70 text-xs z-10 h-8">
            <span className={`font-semibold`}>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            <div className="flex items-center border border-white/10 rounded-full h-2 w-6">
              <div className="bg-white/25 rounded-full h-2 w-6">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
            {isGenerating ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-xs text-white/50 font-medium">Generating...</p>
              </div>
            ) : currentCaption ? (
              <div className="space-y-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mx-auto animate-pulse" />
                <p className="text-base sm:text-lg font-semibold text-white leading-snug max-w-xs">
                  {currentCaption}
                </p>
              </div>
            ) : script ? (
              needsAudio ? (
                <div className="space-y-2 opacity-50">
                  <Volume2 size={24} className="text-white/40 mx-auto" />
                  <p className="text-xs text-white/40 font-medium">Ready to generate</p>
                </div>
              ) : (
                <div className="space-y-2 opacity-50">
                  <Play size={24} className="text-white/40 mx-auto fill-white/40" />
                  <p className="text-xs text-white/40 font-medium">Press play</p>
                </div>
              )
            ) : (
              <div className="space-y-2 opacity-30">
                <Play size={24} className="text-white/30 mx-auto fill-white/30" />
                <p className="text-xs text-white/30 font-medium">Waiting...</p>
              </div>
            )}
          </div>

          {script && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
              <button
                onClick={handlePlayback}
                disabled={isGenerating}
                className="bg-white hover:bg-gray-100 text-black w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : needsAudio ? (
                  <Volume2 size={20} />
                ) : isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              {audioUrl && !needsAudio && (
                <button
                  onClick={handleRestart}
                  className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-white/40"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={() => {
          setIsPlaying(false);
          setIsGenerating(false);
          setNeedsAudio(true);
        }}
        playsInline
        preload="metadata"
      />
    </div>
  );
}