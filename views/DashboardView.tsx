import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Play, RotateCcw, Trophy, Pause } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (section: 'chats' | 'menus' | 'groups' | 'events') => void;
}

// ─── Color helpers ───────────────────────────────────────────────
type HSL = [number, number, number];

const hslToString = ([h, s, l]: HSL) => `hsl(${h}, ${s}%, ${l}%)`;

const lerpHSL = (a: HSL, b: HSL, t: number): HSL => {
  let dh = b[0] - a[0];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return [
    ((a[0] + dh * t) % 360 + 360) % 360,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
};

const bilinearHSL = (
  tl: HSL, tr: HSL, bl: HSL, br: HSL,
  tx: number, ty: number
): HSL => {
  const top = lerpHSL(tl, tr, tx);
  const bot = lerpHSL(bl, br, tx);
  return lerpHSL(top, bot, ty);
};

// ─── Brand color palettes (TL, TR, BL, BR) ──────────────────────
const PALETTES: HSL[][] = [
  [[48, 95, 47], [275, 79, 40], [21, 92, 48], [0, 75, 50]],
  [[275, 79, 40], [0, 75, 50], [48, 95, 47], [21, 92, 48]],
  [[21, 92, 48], [48, 95, 47], [0, 75, 50], [275, 79, 40]],
  [[0, 75, 50], [21, 92, 48], [275, 79, 40], [48, 95, 47]],
  [[48, 95, 60], [0, 75, 45], [275, 79, 55], [21, 92, 55]],
  [[275, 60, 55], [48, 90, 55], [0, 85, 45], [21, 80, 60]],
];

const COLS = 6;
const ROWS = 10;

// ─── Game logic ──────────────────────────────────────────────────
interface TileData {
  id: number;
  correctIndex: number;
  color: HSL;
  fixed: boolean;
}

const generateBoard = (palette: HSL[]): TileData[] => {
  const [tl, tr, bl, br] = palette;
  const tiles: TileData[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tx = c / (COLS - 1);
      const ty = r / (ROWS - 1);
      const index = r * COLS + c;
      const isCorner =
        (r === 0 && c === 0) || (r === 0 && c === COLS - 1) ||
        (r === ROWS - 1 && c === 0) || (r === ROWS - 1 && c === COLS - 1);
      tiles.push({
        id: index,
        correctIndex: index,
        color: bilinearHSL(tl, tr, bl, br, tx, ty),
        fixed: isCorner,
      });
    }
  }
  return tiles;
};

const shuffleBoard = (tiles: TileData[]): TileData[] => {
  const result = [...tiles];
  const movable = result
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => !t.fixed);

  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const ai = movable[i].i;
    const bi = movable[j].i;
    [result[ai], result[bi]] = [result[bi], result[ai]];
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }
  return result;
};

const isSolved = (tiles: TileData[]): boolean =>
  tiles.every((t, i) => t.correctIndex === i);

// ─── Component ──────────────────────────────────────────────────
const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'won'>('idle');
  const wasPlayingRef = useRef(false);
  const gameStateRef = useRef(gameState);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Auto-pause when user switches tabs or browser loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStateRef.current === 'playing') {
        wasPlayingRef.current = true;
        setGameState('paused');
      }
    };
    const handleBlur = () => {
      if (gameStateRef.current === 'playing') {
        wasPlayingRef.current = true;
        setGameState('paused');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Auto-pause when component unmounts (user navigates to another page)
  useEffect(() => {
    return () => {
      if (gameStateRef.current === 'playing') {
        setGameState('paused');
      }
    };
  }, []);

  const resumeGame = useCallback(() => {
    setGameState('playing');
    wasPlayingRef.current = false;
  }, []);

  const solvedBoard = useMemo(
    () => generateBoard(PALETTES[paletteIndex % PALETTES.length]),
    [paletteIndex]
  );

  const [tiles, setTiles] = useState<TileData[]>(solvedBoard);

  const startGame = useCallback(() => {
    const board = generateBoard(PALETTES[paletteIndex % PALETTES.length]);
    const shuffled = shuffleBoard(board);
    setTiles(shuffled);
    setMoves(0);
    setSelectedIndex(null);
    setGameState('playing');
  }, [paletteIndex]);

  const nextLevel = useCallback(() => {
    setPaletteIndex(prev => prev + 1);
    setLevel(prev => prev + 1);
    setGameState('idle');
  }, []);

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (tiles[index].fixed) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      if (selectedIndex === index) {
        setSelectedIndex(null);
        return;
      }

      const newTiles = [...tiles];
      [newTiles[selectedIndex], newTiles[index]] =
        [newTiles[index], newTiles[selectedIndex]];

      setTiles(newTiles);
      setMoves(m => m + 1);
      setSelectedIndex(null);

      if (isSolved(newTiles)) {
        setGameState('won');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <Header onMenuClick={() => console.log('Menu clicked')} />

      <div className="flex-1 pb-[72px] flex flex-col w-full overflow-hidden">
        {/* Game Board */}
        <div className="relative flex-1 w-full overflow-hidden">
          {/* Tile Grid */}
          <div
            className="absolute inset-0 grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            }}
          >
            {tiles.map((tile, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={tile.id}
                  onClick={() => handleTileClick(index)}
                  className={`transition-all duration-200 ease-out cursor-pointer relative
                    ${tile.fixed ? 'cursor-default' : 'active:scale-95'}
                    ${isSelected ? 'ring-3 ring-white shadow-lg scale-[1.08] z-10' : 'hover:brightness-110'}
                  `}
                  style={{
                    backgroundColor: hslToString(tile.color),
                    boxShadow: isSelected
                      ? '0 0 20px rgba(255,255,255,0.6)'
                      : 'none',
                  }}
                >
                  {tile.fixed && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-2 h-2 rotate-45 border border-white/50"
                        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Start Overlay */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <h2 className="text-4xl font-black text-white mb-2 tracking-widest drop-shadow-lg text-center leading-tight">
                WIN A FREE<br />TACO
              </h2>
              <p className="text-white/70 text-sm font-medium mb-1">Level {level}</p>
              <p className="text-white/50 text-xs mb-8 max-w-[16rem] text-center">
                Swap tiles to restore the gradient. Corner tiles are fixed.
              </p>
              <button
                onClick={startGame}
                className="bg-[#6B21A8] text-white font-black px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-xl shadow-purple-900/40"
              >
                <Play size={20} strokeWidth={3} fill="currentColor" />
                {level === 1 ? 'START GAME' : 'PLAY LEVEL'}
              </button>
            </div>
          )}

          {/* Paused Overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <Pause size={48} className="text-white/80 mb-4" />
              <p className="text-white/70 text-sm font-medium mb-6">Game Paused</p>
              <button
                onClick={resumeGame}
                className="bg-[#6B21A8] text-white font-black px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-xl shadow-purple-900/40"
              >
                <Play size={20} strokeWidth={3} fill="currentColor" /> RESUME
              </button>
            </div>
          )}

          {/* Win Overlay */}
          {gameState === 'won' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="text-center">
                <Trophy size={48} className="text-[#EAB308] mx-auto mb-3 drop-shadow-xl" />
                <h2
                  className="text-3xl font-black mb-1 tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #EAB308, #EA580C)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  PERFECT!
                </h2>
                <p className="text-white/80 text-sm font-medium mb-6">
                  Solved in <span className="font-black text-white">{moves}</span> moves
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={startGame}
                    className="bg-white/20 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
                  >
                    <RotateCcw size={18} strokeWidth={3} /> REPLAY
                  </button>
                  <button
                    onClick={nextLevel}
                    className="bg-[#6B21A8] text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-xl shadow-purple-900/40"
                  >
                    NEXT LEVEL →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
