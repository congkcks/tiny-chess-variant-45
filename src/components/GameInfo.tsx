
import { FC } from 'react';
import { GameState, PieceColor, PieceType } from '@/lib/chess-models';
import { getPieceSymbol } from './ChessPiece';
import { cn } from '@/lib/utils';

interface GameInfoProps {
  gameState: GameState;
}

const GameInfo: FC<GameInfoProps> = ({ gameState }) => {
  const { currentPlayer, isCheck, isCheckmate, isStalemate } = gameState;
  
  // Count pieces on the board for each player
  const whitePieces: Record<PieceType, number> = {
    [PieceType.KING]: 0,
    [PieceType.QUEEN]: 0,
    [PieceType.ROOK]: 0,
    [PieceType.KNIGHT]: 0,
    [PieceType.BISHOP]: 0,
    [PieceType.PAWN]: 0
  };
  
  const blackPieces: Record<PieceType, number> = {
    [PieceType.KING]: 0,
    [PieceType.QUEEN]: 0,
    [PieceType.ROOK]: 0,
    [PieceType.KNIGHT]: 0,
    [PieceType.BISHOP]: 0,
    [PieceType.PAWN]: 0
  };
  
  // Count pieces on the board
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        if (piece.color === PieceColor.WHITE) {
          whitePieces[piece.type]++;
        } else {
          blackPieces[piece.type]++;
        }
      }
    }
  }
  
  // Add pieces from piece bank
  gameState.pieceBank[PieceColor.WHITE].forEach(piece => {
    whitePieces[piece.type]++;
  });
  
  gameState.pieceBank[PieceColor.BLACK].forEach(piece => {
    blackPieces[piece.type]++;
  });
  
  return (
    <div className="bg-[#272421] border border-[#3d3934] rounded-md p-4 text-white">
      <h2 className="text-lg font-semibold mb-2">Thông tin trận đấu</h2>
      
      <div className="flex justify-between mb-3">
        <div className={cn("font-medium", currentPlayer === PieceColor.WHITE && "text-yellow-400 font-bold")}>
          Trắng
        </div>
        <div className={cn("font-medium", currentPlayer === PieceColor.BLACK && "text-yellow-400 font-bold")}>
          Đen
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Trạng thái:</div>
        <div className="pl-2 text-sm">
          {isCheckmate && <div className="text-red-500 font-bold">Chiếu hết!</div>}
          {isCheck && !isCheckmate && <div className="text-amber-500 font-bold">Chiếu!</div>}
          {isStalemate && <div className="text-blue-400 font-bold">Hòa cờ!</div>}
          {!isCheck && !isCheckmate && !isStalemate && (
            <div>Lượt {currentPlayer === PieceColor.WHITE ? "Trắng" : "Đen"}</div>
          )}
        </div>
      </div>
      
      <div className="text-sm font-medium mb-2">Quân cờ:</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-xs space-y-1">
          {Object.entries(whitePieces).map(([type, count]) => count > 0 && (
            <div key={`white-${type}`} className="flex items-center gap-1">
              <span>{getPieceSymbol(type as PieceType, PieceColor.WHITE)}</span>
              <span>×{count}</span>
            </div>
          ))}
        </div>
        <div className="text-xs space-y-1">
          {Object.entries(blackPieces).map(([type, count]) => count > 0 && (
            <div key={`black-${type}`} className="flex items-center gap-1">
              <span>{getPieceSymbol(type as PieceType, PieceColor.BLACK)}</span>
              <span>×{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
