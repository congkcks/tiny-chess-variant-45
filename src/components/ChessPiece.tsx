
import { CSSProperties, FC } from 'react';
import { ChessPiece as ChessPieceType, PieceColor, PieceType } from '@/lib/chess-models';
import { cn } from '@/lib/utils';

interface ChessPieceProps {
  piece: ChessPieceType;
  isDragging?: boolean;
  isSelected?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ChessPiece: FC<ChessPieceProps> = ({ 
  piece, 
  isDragging = false,
  isSelected = false,
  className,
  style
}) => {
  const pieceSymbol = getPieceSymbol(piece.type, piece.color);
  
  return (
    <div 
      className={cn(
        "chess-piece text-4xl font-bold select-none",
        isSelected && "selected",
        piece.color === PieceColor.WHITE ? "text-white" : "text-black",
        className
      )}
      style={{
        filter: piece.color === PieceColor.WHITE ? 
          'drop-shadow(1px 1px 1px rgba(0,0,0,0.4))' : 
          'drop-shadow(1px 1px 1px rgba(255,255,255,0.4))',
        ...style
      }}
    >
      {pieceSymbol}
    </div>
  );
};

export const getPieceSymbol = (type: PieceType, color: PieceColor): string => {
  switch (type) {
    case PieceType.KING:
      return color === PieceColor.WHITE ? '♔' : '♚';
    case PieceType.QUEEN:
      return color === PieceColor.WHITE ? '♕' : '♛';
    case PieceType.ROOK:
      return color === PieceColor.WHITE ? '♖' : '♜';
    case PieceType.KNIGHT:
      return color === PieceColor.WHITE ? '♘' : '♞';
    case PieceType.PAWN:
      return color === PieceColor.WHITE ? '♙' : '♟';
    default:
      return '';
  }
};

export default ChessPiece;
