import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const getInitialSnake = (): Point[] => [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const getRandomFoodPosition = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on the snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(getInitialSnake());
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const directionReference = useRef<Direction>(direction);
  directionReference.current = direction;

  useEffect(() => {
    const savedHighScore = localStorage.getItem('neonSnakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    setFood(getRandomFoodPosition(getInitialSnake()));
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying && !isGameOver && e.key === 'Enter') {
      setIsPlaying(true);
      return;
    }
    
    if (isGameOver && e.key === 'Enter') {
      resetGame();
      return;
    }

    const currentDir = directionReference.current;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        if (currentDir !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (currentDir !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (currentDir !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (currentDir !== 'LEFT') setDirection('RIGHT');
        break;
    }
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const resetGame = () => {
    setSnake(getInitialSnake());
    setDirection('UP');
    setFood(getRandomFoodPosition(getInitialSnake()));
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPlaying(true);
  };

  const moveSnake = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (
        head.x < 0 || 
        head.x >= GRID_SIZE || 
        head.y < 0 || 
        head.y >= GRID_SIZE
      ) {
        handleGameOver();
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('neonSnakeHighScore', newScore.toString());
        }
        setFood(getRandomFoodPosition(newSnake));
        // Increase speed slightly
        if (speed > 50) {
          setSpeed(prev => prev - 2);
        }
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPlaying, score, highScore, speed]);

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      const gameLoop = setInterval(moveSnake, speed);
      return () => clearInterval(gameLoop);
    }
  }, [isPlaying, isGameOver, moveSnake, speed]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#050507]">
      {/* Score Board */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex gap-8 sm:gap-12 z-20">
        <div>
          <p className="text-[#666] text-[10px] uppercase tracking-widest text-left">Session Score</p>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tighter text-left">{score.toString().padStart(6, '0')}</p>
        </div>
        <div>
          <p className="text-[#666] text-[10px] uppercase tracking-widest text-left">High Score</p>
          <p className="text-3xl sm:text-4xl font-bold text-[#FF00E5] tracking-tighter text-left">{highScore.toString().padStart(6, '0')}</p>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative mt-20 sm:mt-0 flex flex-col items-center">
        {/* The Grid Canvas */}
        <div 
          className="border-2 border-[#1A1A1F] flex flex-col overflow-hidden relative bg-black/20"
          style={{ 
            width: 'min(85vw, 60vh, 500px)', 
            height: 'min(85vw, 60vh, 500px)',
            backgroundImage: 'radial-gradient(#1A1A1F 1px, transparent 1px)',
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
          }}
        >
          {/* Food */}
          <div 
            className="absolute bg-[#FF00E5] z-10 animate-pulse"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.x * 100) / GRID_SIZE}%`,
              top: `${(food.y * 100) / GRID_SIZE}%`,
              border: '1px solid #050507'
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div 
                key={`${segment.x}-${segment.y}-${index}`}
                className={`absolute ${isHead ? 'bg-[#00FF41] z-20' : 'bg-[#00FF41] opacity-90 z-10'}`}
                style={{
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(segment.x * 100) / GRID_SIZE}%`,
                  top: `${(segment.y * 100) / GRID_SIZE}%`,
                  border: '1px solid #050507'
                }}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {(!isPlaying && !isGameOver) && (
          <div className="absolute inset-0 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-center justify-center flex-col z-30">
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-6 py-3 border border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/10 bg-[#0A0A0C] transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)] font-bold uppercase tracking-[0.2em] text-xs sm:text-sm"
            >
              INITIALIZE_SEQUENCE
            </button>
            <p className="mt-4 text-[#666] text-[10px] uppercase tracking-[0.2em]">Awaiting Input...</p>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-[#0A0A0C]/90 backdrop-blur-sm flex items-center justify-center flex-col z-30">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FF00E5] mb-2 drop-shadow-[0_0_10px_#FF00E5] tracking-tighter uppercase">GAME OVER</h2>
            <p className="text-[#666] text-[10px] uppercase tracking-[0.2em] mb-6">Score Logs: {score.toString().padStart(6, '0')}</p>
            <button 
              onClick={resetGame}
              className="px-6 py-3 border border-[#FF00E5] text-[#FF00E5] hover:bg-[#FF00E5]/10 bg-[#0A0A0C] transition-all font-bold uppercase tracking-[0.2em] text-xs sm:text-sm shadow-[0_0_15px_rgba(255,0,229,0.2)]"
            >
              REBOOT_SYSTEM
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-[#666] text-[10px] hidden sm:flex gap-4">
        <span className="border border-[#1A1A1F] px-2 py-1 uppercase">WASD/Arrows to Move</span>
        <span className="border border-[#1A1A1F] px-2 py-1 uppercase">Enter to Start/Reboot</span>
      </div>

      {/* Mobile Controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-[200px] sm:hidden z-20">
        <div />
        <button className="bg-[#0F0F12] border border-[#1A1A1F] rounded flex justify-center py-4 active:bg-[#1A1A1F] transition-colors" onClick={() => handleKeyPress(new KeyboardEvent('keydown', { key: 'ArrowUp' }))}>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#666]" />
        </button>
        <div />
        <button className="bg-[#0F0F12] border border-[#1A1A1F] rounded flex items-center justify-center py-4 active:bg-[#1A1A1F] transition-colors" onClick={() => handleKeyPress(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}>
           <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[10px] border-r-[#666]" />
        </button>
        <button className="bg-[#0F0F12] border border-[#1A1A1F] rounded flex items-center justify-center py-4 active:bg-[#1A1A1F] transition-colors" onClick={() => handleKeyPress(new KeyboardEvent('keydown', { key: 'ArrowDown' }))}>
           <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#666]" />
        </button>
        <button className="bg-[#0F0F12] border border-[#1A1A1F] rounded flex items-center justify-center py-4 active:bg-[#1A1A1F] transition-colors" onClick={() => handleKeyPress(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}>
           <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-[#666]" />
        </button>
      </div>
    </div>
  );
}
