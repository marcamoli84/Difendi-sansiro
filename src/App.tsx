import { useState, useEffect } from 'react';
import GameComponent from './components/GameComponent';
import { Shield, Trophy, Heart, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { io } from 'socket.io-client';

export default function App() {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const socket = io();
    
    socket.on('players_count', (count: number) => {
      setOnlineCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center p-4 font-sans text-white">
      {/* TikTok Style Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl flex items-center justify-between mb-4 px-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-full">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Difendi San Siro</h1>
            <p className="text-[10px] text-red-500 font-black tracking-[0.2em] uppercase leading-none mt-1">Official TWINHITS WIDGET</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">{onlineCount} Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Game Container */}
      <div className="relative w-full max-w-[500px] aspect-[9/16] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] border-8 border-zinc-800">
        <GameComponent />
        
        {/* TikTok Style Overlay Elements */}
        <div className="absolute bottom-10 right-4 flex flex-col gap-6 pointer-events-none z-20">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <span className="text-[10px] font-bold">12.4K</span>
          </motion.div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="text-[10px] font-bold">842</span>
          </div>
        </div>
      </div>

      {/* Footer / Instructions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center max-w-lg"
      >
        <p className="text-zinc-400 text-sm leading-relaxed">
          Tocca lo schermo per lanciare i palloni e abbattere gli UFO nemici. 
          Non lasciare che colpiscano la Curva Sud! 
          <span className="block mt-1 font-bold text-red-500 uppercase tracking-widest text-[10px]">Forza Milano • Forza Stadio</span>
        </p>
        
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-tighter">Players</div>
            <div className="text-lg font-bold">12.5k</div>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-tighter">Shares</div>
            <div className="text-lg font-bold">842</div>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-tighter">Difficulty</div>
            <div className="text-lg font-bold text-red-500">HARD</div>
          </div>
        </div>
      </motion.div>

      {/* TikTok Aesthetic Elements */}
      <div className="fixed bottom-4 left-4 z-10 opacity-20 hover:opacity-100 transition-opacity">
        <div className="text-[10px] uppercase font-mono">Build v1.0.4-rc</div>
      </div>
    </div>
  );
}

