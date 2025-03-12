
import { FC } from 'react';
import { ChessPiece, GameState, PieceColor, PieceType } from '@/lib/chess-models';
import { cn } from '@/lib/utils';
import { getPieceSymbol } from './ChessPiece';

interface GameInfoProps {
  gameState: GameState;
  className?: string;
}

const GameInfo: FC<GameInfoProps> = ({ gameState, className }) => {
  const { board } = gameState;
  
  const countPieces = (color: PieceColor): Record<PieceType, number> => {
    const counts: Record<PieceType, number> = {
      [PieceType.KING]: 0,
      [PieceType.QUEEN]: 0,
      [PieceType.ROOK]: 0,
      [PieceType.KNIGHT]: 0,
      [PieceType.PAWN]: 0
    };
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          counts[piece.type]++;
        }
      }
    }
    
    return counts;
  };
  
  const whitePieces = countPieces(PieceColor.WHITE);
  const blackPieces = countPieces(PieceColor.BLACK);
  
  const calculateMaterialAdvantage = (): number => {
    const pieceValues: Record<PieceType, number> = {
      [PieceType.KING]: 0, // King has no material value since it can't be captured
      [PieceType.QUEEN]: 9,
      [PieceType.ROOK]: 5,
      [PieceType.KNIGHT]: 3,
      [PieceType.PAWN]: 1
    };
    
    let whiteValue = 0;
    let blackValue = 0;
    
    for (const type in whitePieces) {
      whiteValue += whitePieces[type as PieceType] * pieceValues[type as PieceType];
    }
    
    for (const type in blackPieces) {
      blackValue += blackPieces[type as PieceType] * pieceValues[type as PieceType];
    }
    
    return whiteValue - blackValue;
  };
  
  const materialAdvantage = calculateMaterialAdvantage();
  
  const pieceTypes: PieceType[] = [
    PieceType.QUEEN,
    PieceType.ROOK,
    PieceType.KNIGHT,
    PieceType.PAWN
  ];
  
  return (
    <div className={cn("bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4", className)}>
      <h3 className="font-semibold mb-3 pb-2 border-b border-white/10">Material</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="font-medium text-sm">White</div>
          <div className="flex items-center space-x-1">
            {pieceTypes.map(type => {
              if (whitePieces[type] === 0) return null;
              return (
                <div key={`white-${type}`} className="flex items-center">
                  <span className="text-white text-lg mr-1">{getPieceSymbol(type, PieceColor.WHITE)}</span>
                  <span className="text-xs">×{whitePieces[type]}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="font-medium text-sm">Black</div>
          <div className="flex items-center space-x-1">
            {pieceTypes.map(type => {
              if (blackPieces[type] === 0) return null;
              return (
                <div key={`black-${type}`} className="flex items-center">
                  <span className="text-black text-lg mr-1">{getPieceSymbol(type, PieceColor.BLACK)}</span>
                  <span className="text-xs">×{blackPieces[type]}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
          <div className="font-medium text-sm">Advantage</div>
          <div className={cn(
            "text-sm font-semibold",
            materialAdvantage > 0 ? "text-blue-400" : 
            materialAdvantage < 0 ? "text-orange-400" : "text-gray-400"
          )}>
            {materialAdvantage > 0 ? `+${materialAdvantage} White` : 
             materialAdvantage < 0 ? `+${Math.abs(materialAdvantage)} Black` : 
             'Even'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
