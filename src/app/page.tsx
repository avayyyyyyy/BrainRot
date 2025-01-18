"use client";

import { useState } from "react";
import GenerateForm from "@/components/GenerateForm";
import PhonePreview from "@/components/PhonePreview";

export default function Home() {
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleScriptGenerated = (script: string) => {
    setGeneratedScript(script);
  };

  const handleGenerateVideo = () => {
    setShowPreview(true);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-3xl animate-pulse" />
        {/* Fun floating emojis */}
        <div className="absolute top-20 left-20 animate-float-slow">🤪</div>
        <div className="absolute top-40 right-20 animate-float-slower">🎭</div>
        <div className="absolute bottom-40 left-40 animate-float">🌟</div>
        <div className="absolute top-60 right-40 animate-float-slow">✨</div>
        <div className="absolute bottom-20 right-60 animate-float-slower">
          🎬
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-[#B8860B]/10">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <span className="text-2xl group-hover:animate-spin">🧠</span>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#B8860B] rounded-full animate-ping" />
            </div>
            <span className="font-bold text-[#E5E5E5] text-xl tracking-wide group-hover:text-[#DAA520] transition-colors">
              BrainRot
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/sponsors/avayyyyyyy"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-black rounded-lg font-medium hover:from-[#B8860B] hover:to-[#DAA520] transition-all transform hover:scale-105 group"
            >
              <span className="text-lg group-hover:animate-spin">💝</span>
              <span>Support</span>
            </a>
            <div className="flex items-center gap-2 text-[#888888] text-sm">
              <span className="animate-bounce">🎭</span>
              <span className="hidden md:inline group-hover:text-[#DAA520] transition-colors">
                Destroying braincells since 2024
                <span className="inline-block ml-2 animate-spin">🌀</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-3xl mx-auto relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#B8860B]/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-4 animate-bounce-slow">
                <span className="text-3xl">🎬</span>
                <span className="text-3xl">✨</span>
                <span className="text-3xl">🎭</span>
              </div>
              <h1 className="relative inline-block bg-gradient-to-r from-[#DAA520] via-[#B8860B] to-[#CD853F] text-transparent bg-clip-text font-black text-4xl md:text-6xl mb-6 leading-tight hover:scale-105 transition-transform">
                Turn Your Brain Into Memes
                <div className="absolute -right-16 top-0 flex flex-col gap-2 animate-float">
                  <span className="text-3xl">🤪</span>
                  <span className="text-3xl animate-spin">💫</span>
                </div>
              </h1>
              <p className="relative text-[#E5E5E5] text-lg md:text-xl leading-relaxed">
                Let the brainrot take over! Generate absolutely unhinged
                vertical videos that will make your followers question your
                sanity.
                <span className="inline-block ml-2 animate-bounce">🤯</span>
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <span className="text-2xl animate-float-slow">🎵</span>
                <span className="text-2xl animate-float">🎪</span>
                <span className="text-2xl animate-float-slower">✨</span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div
            className={`grid grid-cols-1 ${
              showPreview ? "lg:grid-cols-12" : "lg:grid-cols-8"
            } gap-8 max-w-7xl mx-auto`}
          >
            {/* Left Side - Script Generator */}
            <div
              className={`${
                showPreview
                  ? "lg:col-span-7"
                  : "lg:col-span-full lg:max-w-3xl lg:mx-auto"
              } w-full relative group`}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#DAA520] via-[#B8860B] to-[#CD853F] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
              <div className="bg-[#111111]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#B8860B]/10 shadow-xl relative overflow-hidden group hover:border-[#B8860B]/20 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-[#B8860B]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <GenerateForm
                  onScriptGenerated={handleScriptGenerated}
                  onGenerateVideo={handleGenerateVideo}
                />
              </div>
            </div>

            {/* Right Side - Phone Preview */}
            {showPreview && (
              <div className="lg:col-span-5 w-full flex flex-col items-start justify-center lg:sticky lg:top-32 transition-all duration-500">
                <h2 className="text-[#DAA520] font-bold text-xl mb-6 ml-10 flex items-center gap-3">
                  Preview Your TikTok
                  <span className="inline-block animate-bounce">✨</span>
                  <span className="inline-block animate-spin">🎬</span>
                  <span className="inline-block animate-pulse">🎭</span>
                </h2>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#B8860B]/20 to-[#DAA520]/20 rounded-[44px] blur-xl animate-pulse" />
                  <PhonePreview script={generatedScript} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-[#0A0A0A]/50 backdrop-blur-sm text-[#888888] py-6 text-center border-t border-[#B8860B]/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="animate-spin">🎭</span>
              <p className="text-sm">Powered by StageHand</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm flex items-center gap-2">
                Made with <span className="animate-pulse">🧠</span> (or lack
                thereof)
              </span>
              <span className="text-sm">
                © 2024 BrainRot <span className="animate-bounce">✨</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
