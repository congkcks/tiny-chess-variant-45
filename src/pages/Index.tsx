
import { useState, useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';
import MoveHistory from '@/components/MoveHistory';
import GameControls from '@/components/GameControls';
import GameInfo from '@/components/GameInfo';
import { 
  createInitialGameState, 
  GameState, 
  PieceColor
} from '@/lib/chess-models';
import { motion } from 'framer-motion';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [boardPerspective, setBoardPerspective] = useState<PieceColor>(PieceColor.WHITE);
  const [gameStateHistory, setGameStateHistory] = useState<GameState[]>([createInitialGameState()]);
  
  const handleMove = (newState: GameState) => {
    setGameState(newState);
    setGameStateHistory(prev => [...prev, newState]);
  };
  
  const handleNewGame = () => {
    const initialState = createInitialGameState();
    setGameState(initialState);
    setGameStateHistory([initialState]);
  };
  
  const handleFlipBoard = () => {
    setBoardPerspective(prev => 
      prev === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE
    );
  };
  
  const handleUndoMove = () => {
    if (gameStateHistory.length <= 1) return;
    
    const previousStates = [...gameStateHistory];
    previousStates.pop();
    
    const previousState = previousStates[previousStates.length - 1];
    setGameState(previousState);
    setGameStateHistory(previousStates);
  };
  
  return (
    <div className="min-h-screen bg-[#312e2b] text-white p-4">
      <div className="max-w-5xl mx-auto">
        <motion.header 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Chessmihouse 6×6
          </h1>
          <p className="text-gray-400 text-sm">
            A chess.com inspired variant with Crazyhouse rules
          </p>
        </motion.header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ChessBoard 
              gameState={gameState} 
              onMove={handleMove} 
              perspective={boardPerspective}
            />
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GameControls 
              gameState={gameState} 
              onNewGame={handleNewGame}
              onFlipBoard={handleFlipBoard}
              onUndoMove={handleUndoMove}
            />
            
            <GameInfo gameState={gameState} />
            
            <MoveHistory gameState={gameState} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
