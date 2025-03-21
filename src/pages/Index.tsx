
import { useState, useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';
import MoveHistory from '@/components/MoveHistory';
import GameControls from '@/components/GameControls';
import GameInfo from '@/components/GameInfo';
import GameRules from '@/components/GameRules';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import ChessAI from '@/lib/chess-ai';
import { makeMove, dropPiece } from '@/lib/chess-logic';
import { Cpu } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  createInitialGameState,
  GameState,
  PieceColor
} from '@/lib/chess-models';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [boardPerspective, setBoardPerspective] = useState<PieceColor>(PieceColor.WHITE);
  const [gameStateHistory, setGameStateHistory] = useState<GameState[]>([createInitialGameState()]);
  const [showRules, setShowRules] = useState<boolean>(true);
  const [playAgainstAI, setPlayAgainstAI] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const ai = new ChessAI();
  const toggleAI = () => {
    const newValue = !playAgainstAI;
    console.log("Bật/tắt AI:", newValue);
    setPlayAgainstAI(newValue);

    // Nếu bật AI và lượt hiện tại là của AI (đen)
    if (newValue && gameState.currentPlayer === PieceColor.BLACK) {
      console.log("Lượt hiện tại là của đen, gọi AI đi...");
      makeAIMove(gameState);
    }
  };
  // Sửa hàm makeAIMove để thêm log
  const makeAIMove = async (state: GameState) => {
    console.log("AI bắt đầu suy nghĩ...");
    setIsAIThinking(true);

    setTimeout(() => {
      try {
        console.log("Trạng thái game trước khi AI đi:", state);
        console.log("Lượt hiện tại:", state.currentPlayer);

        const bestMove = ai.findBestMove(state);
        console.log("Nước đi tốt nhất của AI:", bestMove);

        if (bestMove) {
          let newState: GameState;

          if (bestMove.from) {
            // Di chuyển quân
            console.log(`AI di chuyển quân từ (${bestMove.from.row},${bestMove.from.col}) đến (${bestMove.to.row},${bestMove.to.col})`);
            newState = makeMove(state, bestMove.from, bestMove.to);
          } else if (bestMove.piece) {
            // Thả quân
            console.log(`AI thả quân ${bestMove.piece.type} tại (${bestMove.to.row},${bestMove.to.col})`);
            newState = dropPiece(state, bestMove.piece, bestMove.to);
          } else {
            console.log("AI không tìm thấy nước đi hợp lệ");
            newState = state;
          }

          setGameState(newState);
          setGameStateHistory(prev => [...prev, newState]);
        } else {
          console.log("AI không trả về nước đi nào");
        }
      } catch (error) {
        console.error("Lỗi trong nước đi của AI:", error);
      } finally {
        setIsAIThinking(false);
      }
    }, 800);
  };

  // Sửa điều kiện trong hàm handleMove
  const handleMove = (newState: GameState) => {
    setGameState(newState);
    setGameStateHistory(prev => [...prev, newState]);

    console.log("Sau khi người chơi đi, lượt hiện tại:", newState.currentPlayer);
    console.log("Play Against AI:", playAgainstAI);

    // Nếu đang chơi với AI và đến lượt AI
    if (playAgainstAI && newState.currentPlayer === PieceColor.BLACK && !newState.isCheckmate) {
      console.log("Gọi AI đi...");
      makeAIMove(newState);
    }
  };



  const handleNewGame = () => {
    const initialState = createInitialGameState();
    setGameState(initialState);
    setGameStateHistory([initialState]);
    if (playAgainstAI && initialState.currentPlayer === PieceColor.BLACK) {
      makeAIMove(initialState);
    }
  };

  const handleFlipBoard = () => {
    setBoardPerspective(prev =>
      prev === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE
    );
  };

  const handleUndoMove = () => {
    if (gameStateHistory.length <= 1) return;

    const previousStates = [...gameStateHistory];

    // Nếu đang chơi với AI, cần undo 2 nước (người chơi và AI)
    const stepsToUndo = playAgainstAI ? 2 : 1;

    // Đảm bảo có đủ lịch sử để undo
    const newLength = Math.max(1, previousStates.length - stepsToUndo);
    const trimmedStates = previousStates.slice(0, newLength);

    const previousState = trimmedStates[trimmedStates.length - 1];
    setGameState(previousState);
    setGameStateHistory(trimmedStates);
  };
  return (
    <div className="min-h-screen bg-[#312e2b] text-white p-4">
      <div className="max-w-5xl mx-auto">
        <motion.header
          className="text-center mb-4 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Chessmihouse 6×6
          </h1>
          <p className="text-gray-400 text-sm">
            Cờ vua 6x6 với luật Crazyhouse - thả quân đã bắt
          </p>

          {/* Thay thế nút Button hiện tại bằng div này */}
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <div className="flex items-center">
              <Cpu size={16} className="mr-1 text-gray-300" />
              <label className="text-sm text-gray-300 mr-2">AI</label>
              <Switch
                checked={playAgainstAI}
                onCheckedChange={toggleAI}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setShowRules(true)}
            >
              <HelpCircle size={20} />
            </Button>
          </div>
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
              onNewGame={handleNewGame}
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

      <AnimatePresence>
        {showRules && <GameRules onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
