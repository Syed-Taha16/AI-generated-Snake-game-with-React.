import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Dawn (Remix)',
    artist: 'Skott',
    url: 'https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/1.mp3',
    cover: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&q=80&fit=crop',
  },
  {
    id: 2,
    title: 'Me & You',
    artist: 'HONNE',
    url: 'https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/2.mp3',
    cover: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80&fit=crop',
  },
  {
    id: 3,
    title: 'Way Back Home',
    artist: 'SHAUN ft. Conor Maynard',
    url: 'https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/4.mp3',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80&fit=crop',
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Default false to prevent autoplay block
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = TRACKS[currentTrackIndex];

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log("Autoplay prevented:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = 60; // Force exactly 1 minute duration
      
      if (current >= duration) {
        playNext();
      } else {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    playNext();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - bounds.left) / bounds.width;
      audioRef.current.currentTime = percent * 60; // Scale clicks within the 1-minute window
      setProgress(percent * 100);
    }
  };

  return (
    <aside className="w-full md:w-72 lg:w-80 h-auto md:h-full flex flex-col bg-[#0D0D10] border-t md:border-t-0 md:border-r border-[#1A1A1F] p-6 gap-6 overflow-y-auto shrink-0 shadow-lg relative z-10">
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        autoPlay={isPlaying}
      />
      
      <div>
        <h2 className="text-[#666] text-[10px] uppercase tracking-[0.2em] mb-4">Audio Repository</h2>
        
        {/* Track List */}
        <div className="space-y-3 mb-8">
          {TRACKS.map((track, i) => (
            <div 
              key={track.id} 
              className={`p-3 border transition-all rounded cursor-pointer ${currentTrackIndex === i ? 'border-[#00FF41] bg-[#00FF41]/5' : 'border-transparent hover:border-[#FF00E5]/30'}`}
              onClick={() => {
                setCurrentTrackIndex(i);
                setIsPlaying(true);
              }}
            >
               <p className={`text-xs font-bold ${currentTrackIndex === i ? 'text-[#00FF41]' : 'text-white/70'}`}>
                 {String(i + 1).padStart(2, '0')}. {track.title}
               </p>
               <p className="text-[#666] text-[10px] uppercase tracking-widest mt-1">{track.artist}</p>
            </div>
          ))}
        </div>

        {/* Current Track Controls */}
        <div className="p-4 border border-[#1A1A1F] bg-[#0A0A0C] flex flex-col gap-4">
          <div className="flex justify-between items-center text-[10px] text-[#666] mb-1 uppercase tracking-widest">
            <span className="truncate pr-2 font-bold text-[#00FF41]/80">{currentTrack.title}</span>
            <span className="shrink-0">{audioRef.current ? `${Math.floor(audioRef.current.currentTime / 60)}:${Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0')}` : '0:00'} / 1:00</span>
          </div>
          
          <div 
            className="h-1 bg-white/5 relative overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-[#00FF41] transition-all duration-100 ease-linear shadow-[0_0_5px_#00FF41]"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <button onClick={playPrev} className="text-[#666] hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button onClick={togglePlay} className="w-10 h-10 rounded-full border border-[#00FF41] flex items-center justify-center text-[#00FF41] bg-[#00FF41]/10 hover:bg-[#00FF41]/20 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button onClick={playNext} className="text-[#666] hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="mt-8 hidden sm:block">
           <h2 className="text-[#666] text-[10px] uppercase tracking-[0.2em] mb-4">Volume Override</h2>
           <div className="flex items-center gap-3">
             <button onClick={() => setIsMuted(!isMuted)} className="text-[#666] hover:text-white transition-colors">
                 {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
             </button>
             <div className="h-1 flex-1 bg-white/5 relative overflow-hidden flex items-center">
               <input 
                 type="range" 
                 min="0" max="1" step="0.01" 
                 value={isMuted ? 0 : volume}
                 onChange={(e) => {
                   setVolume(parseFloat(e.target.value));
                   if (isMuted) setIsMuted(false);
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <div 
                 className="h-full bg-[#666] transition-all pointer-events-none" 
                 style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
               />
             </div>
           </div>
        </div>
      </div>
    </aside>
  );
}
