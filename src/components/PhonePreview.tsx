"use client";

import { useState, useRef, useEffect } from "react";

interface PhonePreviewProps {
  script: string | null;
}

export default function PhonePreview({ script }: PhonePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [fadeIn, setFadeIn] = useState(false);
  const [scriptLines, setScriptLines] = useState<string[]>([]);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset state when new script is received
  useEffect(() => {
    if (script) {
      setScriptLines(script.split("\n").filter((line) => line.trim() !== ""));
      setShowGenerateButton(true);
      setIsPlaying(false);
      setCurrentCaption("");
      setCurrentLineIndex(0);
      setCurrentWordIndex(-1);
      setFadeIn(false);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    } else {
      setScriptLines([]);
      setShowGenerateButton(false);
    }
  }, [script]);

  // Sync video with audio playback
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

  // Cleanup audio URL on unmount
  useEffect(() => {
    selectRandomVideo();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update captions based on audio time
  useEffect(() => {
    if (!audioRef.current || !isPlaying || scriptLines.length === 0) return;

    const updateCaption = () => {
      const currentTime = audioRef.current?.currentTime || 0;
      const totalDuration = audioRef.current?.duration || 0;

      if (totalDuration) {
        // Slow down the progress to make captions change less frequently
        const progress = (currentTime / totalDuration) * 0.7; // Slow down overall progress
        const lineIndex = Math.floor(progress * scriptLines.length);

        if (lineIndex !== currentLineIndex && lineIndex < scriptLines.length) {
          setFadeIn(false);
          setTimeout(() => {
            setCurrentLineIndex(lineIndex);
            const words = scriptLines[lineIndex].split(" ");
            // Take first 7-8 words for better readability
            const shortCaption = words.slice(0, 8).join(" ");
            setCurrentCaption(shortCaption);
            setFadeIn(true);
            setCurrentWordIndex(0);
          }, 300);
        } else {
          const line = scriptLines[lineIndex];
          const words = line.split(" ");
          const wordProgress = ((progress * scriptLines.length) % 1) * 0.7;
          const wordIndex = Math.floor(wordProgress * words.length);

          // Show a window of 7-8 words
          const startWord = Math.max(0, wordIndex);
          const endWord = Math.min(words.length, startWord + 8);
          const visibleWords = words.slice(startWord, endWord).join(" ");

          // Only update if the caption would change
          if (visibleWords !== currentCaption) {
            setCurrentCaption(visibleWords);
            setCurrentWordIndex(0);
          }
        }
      }
    };

    // Reduced update frequency
    const interval = setInterval(updateCaption, 200);
    return () => clearInterval(interval);
  }, [isPlaying, currentLineIndex, scriptLines, currentCaption]);

  const handlePlayback = async () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentCaption(scriptLines[0]);
      }
      return;
    }

    if (!script) {
      console.error("No script available");
      return;
    }

    try {
      setIsGenerating(true);
      setShowGenerateButton(false);
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
      setIsGenerating(false);
      setIsLoading(true);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.addEventListener("loadeddata", () => {
          setIsLoading(false);
          setCurrentCaption("Audio ready! Click play to start");
          setFadeIn(true);
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsGenerating(false);
      setIsLoading(false);
      setShowGenerateButton(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentCaption("Audio finished! Click play to restart");
    setCurrentLineIndex(0);
    setCurrentWordIndex(-1);
    setFadeIn(true);
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
      setCurrentWordIndex(-1);
      setCurrentCaption(scriptLines[0]);
      if (!isPlaying) {
        setIsPlaying(true);
        audioRef.current.play();
      }
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="relative w-[320px] h-[640px] bg-[#111111] rounded-[40px] p-4 shadow-2xl border-4 border-[#222222] transition-transform hover:scale-[1.02]">
      {/* Status Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#222222] rounded-b-2xl flex items-center justify-center">
        <div className="w-16 h-4 bg-black rounded-full" />
      </div>

      {/* Phone Screen */}
      <div className="w-full h-full bg-[#0A0A0A] rounded-3xl overflow-hidden relative">
        {/* Video Background */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onError={(e) => console.error("Video error:", e)}
          />
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>

        {/* Captions Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="relative bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm rounded-xl p-6 text-[#E5E5E5] text-center min-h-[120px] flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B]/0 via-[#B8860B]/5 to-[#B8860B]/0 animate-shine"></div>

            {/* Caption Text */}
            <div
              className={`relative transition-all duration-500 ease-out transform ${
                fadeIn
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95"
              }`}
            >
              <p className="text-xl md:text-2xl leading-relaxed font-bold tracking-tight">
                {isGenerating ? (
                  <span className="animate-pulse">Generating audio...</span>
                ) : isLoading ? (
                  <span className="animate-pulse">Loading audio...</span>
                ) : currentCaption ? (
                  <>
                    {currentCaption.split(" ").map((word, i) => (
                      <span
                        key={i}
                        className={`inline-block animate-fadeIn ${
                          i === currentWordIndex
                            ? "bg-[#FFE135] text-black px-1.5 py-0.5 rounded-md"
                            : ""
                        }`}
                        style={{
                          animationDelay: `${i * 50}ms`,
                        }}
                      >
                        {word}
                        <span className="inline-block">&nbsp;</span>
                      </span>
                    ))}
                  </>
                ) : script ? (
                  showGenerateButton ? (
                    "Ready to generate TikTok!"
                  ) : (
                    "Press play to start..."
                  )
                ) : (
                  "Generate a script first..."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        {script && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            <button
              onClick={handlePlayback}
              disabled={isGenerating}
              className="bg-gradient-to-br from-[#B8860B] to-[#DAA520] hover:from-[#DAA520] hover:to-[#B8860B] text-black w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <span className="text-2xl animate-spin">🔄</span>
              ) : isLoading ? (
                <span className="text-2xl animate-pulse">⌛</span>
              ) : showGenerateButton ? (
                <span className="text-lg font-bold">🎵</span>
              ) : isPlaying ? (
                <span className="text-2xl">⏸️</span>
              ) : (
                <span className="text-2xl">▶️</span>
              )}
            </button>

            {audioUrl && !showGenerateButton && (
              <button
                onClick={handleRestart}
                className="bg-gradient-to-br from-[#B8860B] to-[#DAA520] hover:from-[#DAA520] hover:to-[#B8860B] text-black w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">↺</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={() => {
          setIsPlaying(false);
          setIsLoading(false);
          setIsGenerating(false);
          setShowGenerateButton(true);
        }}
      />
    </div>
  );
}
