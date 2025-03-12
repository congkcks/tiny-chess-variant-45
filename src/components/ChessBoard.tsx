
import { FC, useState, useEffect } from 'react';
import ChessPiece from './ChessPiece';
import { 
  ChessPiece as ChessPieceType, 
  GameState, 
  PieceColor, 
  PieceType,
  Position,
  positionToAlgebraic
} from '@/lib/chess-models';
import { getValidMoves, makeMove } from '@/lib/chess-logic';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ChessBoardProps {
  gameState: GameState;
  onMove: (newState: GameState) => void;
  perspective?: PieceColor;
  showCoordinates?: boolean;
}

const ChessBoard: FC<ChessBoardProps> = ({ 
  gameState, 
  onMove, 
  perspective = PieceColor.WHITE,
  showCoordinates = true
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [promotionPosition, setPromotionPosition] = useState<Position | null>(null);

  // Handle board orientation based on perspective
  const boardRows = [...Array(6).keys()];
  const boardCols = [...Array(6).keys()];
  
  if (perspective === PieceColor.BLACK) {
    boardRows.reverse();
    boardCols.reverse();
  }

  useEffect(() => {
    // Reset selection when turn changes
    setSelectedPosition(null);
    setValidMoves([]);
  }, [gameState.currentPlayer]);

  // Handle click on a board square
  const handleSquareClick = (position: Position) => {
    const { board, currentPlayer } = gameState;
    const piece = board[position.row][position.col];

    // If we're waiting for promotion selection, ignore other clicks
    if (promotionPosition) return;

    // If clicked on an already selected piece, deselect it
    if (selectedPosition && 
        selectedPosition.row === position.row && 
        selectedPosition.col === position.col) {
      setSelectedPosition(null);
      setValidMoves([]);
      return;
    }

    // If clicked on a valid move square, move the selected piece there
    if (selectedPosition && validMoves.some(move => move.row === position.row && move.col === position.col)) {
      const movingPiece = board[selectedPosition.row][selectedPosition.col];
      
      // Check if this is a pawn promotion move
      if (movingPiece && 
          movingPiece.type === PieceType.PAWN &&
          ((movingPiece.color === PieceColor.WHITE && position.row === 5) ||
           (movingPiece.color === PieceColor.BLACK && position.row === 0))) {
        // If it's a promotion, store the destination and show promotion options
        setPromotionPosition(position);
        return;
      }
      
      // Execute the move
      const newState = makeMove(gameState, selectedPosition, position);
      onMove(newState);
      
      // Check game ending conditions
      if (newState.isCheckmate) {
        const winner = currentPlayer === PieceColor.WHITE ? 'White' : 'Black';
        toast.success(`Checkmate! ${winner} wins!`);
      } else if (newState.isStalemate) {
        toast.info('Stalemate! The game is a draw.');
      } else if (newState.isCheck) {
        toast.warning('Check!');
      }
      
      setSelectedPosition(null);
      setValidMoves([]);
      return;
    }

    // If clicked on own piece, select it and show valid moves
    if (piece && piece.color === currentPlayer) {
      setSelectedPosition(position);
      const moves = getValidMoves(gameState, position);
      setValidMoves(moves);
      return;
    }

    // If clicked on empty square or opponent's piece without having a piece selected
    setSelectedPosition(null);
    setValidMoves([]);
  };

  // Handle promotion selection
  const handlePromotion = (promoteTo: PieceType) => {
    if (!selectedPosition || !promotionPosition) return;
    
    const newState = makeMove(gameState, selectedPosition, promotionPosition, promoteTo);
    onMove(newState);
    
    // Check game ending conditions after promotion
    if (newState.isCheckmate) {
      const winner = gameState.currentPlayer === PieceColor.WHITE ? 'White' : 'Black';
      toast.success(`Checkmate! ${winner} wins!`);
    } else if (newState.isCheck) {
      toast.warning('Check!');
    }
    
    setSelectedPosition(null);
    setValidMoves([]);
    setPromotionPosition(null);
  };

  // Determine if a square is a "light" or "dark" square
  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;

  // Get algebraic notation for a square (e.g., "a1", "e5")
  const getSquareNotation = (row: number, col: number) => {
    const file = String.fromCharCode(97 + col); // 'a' through 'f'
    const rank = row + 1; // 1 through 6
    return `${file}${rank}`;
  };

  // Check if a square is part of the last move
  const isPartOfLastMove = (row: number, col: number) => {
    const { lastMove } = gameState;
    if (!lastMove) return false;
    
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  // Check if a square is in check
  const isSquareInCheck = (row: number, col: number) => {
    const { board, isCheck } = gameState;
    const piece = board[row][col];
    
    return isCheck && 
      piece && 
      piece.type === PieceType.KING && 
      piece.color === gameState.currentPlayer;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-2">
        <div className="w-full h-full grid grid-cols-6 grid-rows-6 relative">
          {/* Board squares */}
          {boardRows.map(rowIndex => {
            // Get actual row index based on perspective
            const actualRow = perspective === PieceColor.WHITE ? 5 - rowIndex : rowIndex;
            
            return boardCols.map(colIndex => {
              // Get actual column index based on perspective
              const actualCol = perspective === PieceColor.WHITE ? colIndex : 5 - colIndex;
              
              const position = { row: actualRow, col: actualCol };
              const piece = gameState.board[actualRow][actualCol];
              const isValidMoveSquare = validMoves.some(move => move.row === actualRow && move.col === actualCol);
              
              return (
                <div
                  key={`${actualRow}-${actualCol}`}
                  className={cn(
                    "chess-square relative flex items-center justify-center",
                    isLightSquare(actualRow, actualCol) ? "bg-board-light" : "bg-board-dark",
                    isPartOfLastMove(actualRow, actualCol) && "last-move",
                    isSquareInCheck(actualRow, actualCol) && "check",
                    isValidMoveSquare && "valid-move",
                    selectedPosition?.row === actualRow && selectedPosition?.col === actualCol && "ring-2 ring-yellow-400"
                  )}
                  onClick={() => handleSquareClick(position)}
                >
                  {/* Coordinate labels */}
                  {showCoordinates && (
                    <>
                      {actualCol === 0 && perspective === PieceColor.WHITE && (
                        <div className="absolute top-1 left-1 text-xs font-semibold opacity-70">
                          {actualRow + 1}
                        </div>
                      )}
                      {actualCol === 5 && perspective === PieceColor.BLACK && (
                        <div className="absolute top-1 right-1 text-xs font-semibold opacity-70">
                          {actualRow + 1}
                        </div>
                      )}
                      {actualRow === 0 && perspective === PieceColor.WHITE && (
                        <div className="absolute bottom-1 right-1 text-xs font-semibold opacity-70">
                          {String.fromCharCode(97 + actualCol)}
                        </div>
                      )}
                      {actualRow === 5 && perspective === PieceColor.BLACK && (
                        <div className="absolute bottom-1 left-1 text-xs font-semibold opacity-70">
                          {String.fromCharCode(97 + actualCol)}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Chess piece */}
                  <AnimatePresence mode="wait">
                    {piece && (
                      <motion.div
                        key={piece.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          y: isValidMoveSquare ? [0, -5, 0] : 0
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      >
                        <ChessPiece 
                          piece={piece} 
                          isSelected={selectedPosition?.row === actualRow && selectedPosition?.col === actualCol}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            });
          })}
        </div>
      </div>
      
      {/* Promotion selection UI */}
      {promotionPosition && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 rounded-xl"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              Promote pawn to:
            </h3>
            <div className="flex gap-4 justify-center">
              {[PieceType.QUEEN, PieceType.ROOK, PieceType.KNIGHT].map((type) => (
                <button
                  key={type}
                  className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  onClick={() => handlePromotion(type)}
                >
                  <ChessPiece 
                    piece={{ 
                      id: `promotion-${type}`, 
                      type, 
                      color: gameState.currentPlayer,
                      hasMoved: true
                    }} 
                    className="text-5xl"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
