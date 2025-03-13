
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
  const groupedPieces = pieces.reduce<Record<string, ChessPieceType[]>>((acc, piece) => {
    const key = piece.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(piece);
    return acc;
  }, {} as Record<string, ChessPieceType[]>);

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
        {color === PieceColor.WHITE ? "Quân đã bắt" : "Quân đã bắt"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(groupedPieces).map(([type, pieces]) => (
          <div 
            key={type}
            className="relative"
          >
            <motion.button
              className={cn(
                "relative group w-10 h-10 bg-[#8E9196]/20 rounded-md flex items-center justify-center",
                isActive ? "cursor-pointer hover:bg-[#8E9196]/40" : "cursor-not-allowed opacity-50",
                isActive && "hover:scale-110"
              )}
              onClick={() => isActive && onPieceSelect(pieces[0])}
              disabled={!isActive}
              whileHover={isActive ? { scale: 1.1 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8">
                <ChessPiece piece={pieces[0]} />
              </div>
              {pieces.length > 1 && (
                <span className="absolute -top-2 -right-2 bg-[#769656] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {pieces.length}
                </span>
              )}
            </motion.button>
          </div>
        ))}
      </div>
      {Object.keys(groupedPieces).length === 0 && (
        <div className="text-xs italic text-gray-400 mt-1 text-center">
          Chưa có quân nào
        </div>
      )}
    </motion.div>
  );
};

export default PieceBank;
