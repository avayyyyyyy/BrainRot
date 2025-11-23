"use client";

import React, { useState } from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';
import GenerateForm from '@/components/GenerateForm';
import PhonePreview from '@/components/PhonePreview';
import { SOCIAL_LINKS, SYSTEM_STATUS } from '@/cst/constants';

const ICON_MAP = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
} as const;

export default function BrainRotMinimal() {
  const [script, setScript] = useState<string | null>(null);
  const [generateVideoTrigger, setGenerateVideoTrigger] = useState(0);
  const systemStatus = SYSTEM_STATUS;
  const isSystemOnline = systemStatus === "ONLINE";
  const socialLinks = SOCIAL_LINKS.map((link) => ({
    ...link,
    icon: ICON_MAP[link.icon] ?? Github,
  }));

  const handleGenerateVideo = () => {
    if (script) {
      setGenerateVideoTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-white/20 selection:text-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_bottom_right,#000000,#0A0A0A,#111111)] pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col flex-1">
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-5 h-5 border border-zinc-700 bg-zinc-900 group-hover:bg-zinc-100 group-hover:border-white transition-colors duration-500" />
              <span className="text-lg font-bold tracking-tight text-white">BrainRot</span>
            </div>
            <div className="text-xs text-zinc-600 uppercase tracking-[0.3em]">v2.0.1</div>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-12 max-w-7xl flex-1 flex flex-col">
          <div className="mb-12 pt-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Video Generation
            </h1>
            <p className="text-zinc-500 max-w-2xl text-lg leading-relaxed">
              Configure your script and visual parameters. Watch the preview update in real-time.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 pb-12 items-stretch">
            <div className="lg:col-span-7 h-full">
              <div className="h-full p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/40 hover:shadow-[0_0_30px_-15px_rgba(255,255,255,0.1)] transition-all duration-500 rounded-sm group backdrop-blur-sm flex flex-col">
                <div className="flex items-center gap-2 mb-8 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
                  <div className="w-4 h-4 border border-zinc-700 bg-zinc-900 group-hover:bg-zinc-100 group-hover:border-white transition-colors duration-500 rounded-sm" />
                  <span className="text-xs uppercase tracking-widest font-semibold">Script Generation</span>
                </div>
                <div className="flex-1">
                  <GenerateForm
                    onScriptGenerated={setScript}
                    onGenerateVideo={handleGenerateVideo}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 h-full">
              <div
                className="sticky top-24 min-h-full w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/40 hover:shadow-[0_0_30px_-15px_rgba(255,255,255,0.1)] transition-all duration-500 rounded-sm backdrop-blur-sm flex flex-col items-center justify-center p-8 group"
              >
                <div className="absolute top-6 left-6 flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-semibold">Live Preview</span>
                </div>
                <PhonePreview script={script} generateVideoTrigger={generateVideoTrigger} />
              </div>
            </div>
          </div>
        </main>
        <footer className="border-t border-white/5 py-8 bg-[#050505]">
          <div className="container mx-auto px-6 flex flex-col items-center gap-4 text-xs text-zinc-600 font-mono">
            <div>
              SYSTEM STATUS:
              <span className={`ml-1 font-semibold ${isSystemOnline ? "text-emerald-400" : "text-red-400"}`}>
                {systemStatus}
              </span>
              &nbsp; | &nbsp; BRAINROT v2.0.1
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors duration-300"
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
