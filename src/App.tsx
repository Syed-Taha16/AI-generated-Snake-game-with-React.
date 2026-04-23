import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="h-[100dvh] w-screen bg-[#0A0A0C] text-[#E0E0E0] font-mono flex flex-col overflow-hidden select-none border-4 border-[#1A1A1F]">
      <header className="h-16 border-b border-[#00FF41]/20 flex items-center justify-between px-4 sm:px-8 bg-[#0F0F12] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#00FF41] animate-pulse shadow-[0_0_10px_#00FF41]"></div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-[#00FF41]">SYNTH_SNAKE // OS_01</h1>
        </div>
        <div className="flex gap-4 md:gap-8 text-[10px] uppercase tracking-[0.2em] text-[#666] hidden sm:flex">
          <span>Status: Interfacing</span>
          <span>User: NEON_DRIFTER</span>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <MusicPlayer />
        <section className="flex-1 flex flex-col items-center justify-center bg-[#050507] relative overflow-hidden h-full">
          <SnakeGame />
        </section>
      </main>
    </div>
  );
}
