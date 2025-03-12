
import { FC } from 'react';
import ChessPiece from './ChessPiece';
import { ChessPiece as ChessPieceType, PieceColor, PieceType } from '@/lib/chess-models';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PieceBankProps {
  pieces: ChessPieceType[];
  color: PieceColor;
  onPieceSelect: (piece: ChessPieceType) => void;
  isActive: boolean;
  className?: string;
}

const PieceBank: FC<PieceBankProps> = ({ 
  pieces, 
  color, 
  onPieceSelect,
  isActive,
  className 
}) => {
  // Group pieces by type for better display
  const groupedPieces = pieces.reduce<Record<PieceType, ChessPieceType[]>>((acc, piece) => {
    const key = piece.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(piece);
    return acc;
  }, {} as Record<PieceType, ChessPieceType[]>);

  return (
    <motion.div 
      className={cn(
        "p-3 rounded-md bg-[#272421] border border-[#3d3934]",
        !isActive && "opacity-50",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xs font-semibold mb-2 text-[#b8b0a2]">
        {color === PieceColor.WHITE ? "White's" : "Black's"} Captured Pieces
      </h3>
      <div className="flex flex-wrap gap-1">
        {Object.entries(groupedPieces).map(([type, pieces]) => (
          <div 
            key={type}
            className="relative"
          >
            <button
              className={cn(
                "relative group hover:scale-110 transition-transform",
                isActive ? "cursor-pointer" : "cursor-not-allowed"
              )}
              onClick={() => isActive && onPieceSelect(pieces[0])}
              disabled={!isActive}
            >
              <ChessPiece piece={pieces[0]} />
              {pieces.length > 1 && (
                <span className="absolute -top-1 -right-1 bg-[#769656] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {pieces.length}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PieceBank;
