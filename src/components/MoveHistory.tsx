
import { FC } from 'react';
import { GameState, Move, positionToAlgebraic } from '@/lib/chess-models';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MoveHistoryProps {
  gameState: GameState;
  onMoveClick?: (index: number) => void;
}

const MoveHistory: FC<MoveHistoryProps> = ({ gameState, onMoveClick }) => {
  const { moveHistory } = gameState;

  const formatMove = (move: Move): string => {
    const from = positionToAlgebraic(move.from);
    const to = positionToAlgebraic(move.to);
    
    let notation = `${from}-${to}`;
    
    if (move.isPromotion && move.promoteTo) {
      notation += `=${move.promoteTo.charAt(0).toUpperCase()}`;
    }
    
    if (move.isCheckmate) {
      notation += '#';
    } else if (move.isCheck) {
      notation += '+';
    }
    
    return notation;
  };

  // Group moves by pairs (white and black)
  const groupedMoves: [string, string | null][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    const whiteMove = moveHistory[i] ? formatMove(moveHistory[i]) : null;
    const blackMove = moveHistory[i + 1] ? formatMove(moveHistory[i + 1]) : null;
    groupedMoves.push([whiteMove!, blackMove]);
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden w-full">
      <h3 className="px-4 py-3 font-semibold border-b border-white/10 bg-white/5">Move History</h3>
      <ScrollArea className="h-[240px] w-full">
        <div className="p-4">
          {groupedMoves.length === 0 ? (
            <div className="text-center text-sm opacity-70 py-4">
              No moves yet
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">White</th>
                  <th className="pb-2 font-medium">Black</th>
                </tr>
              </thead>
              <tbody>
                {groupedMoves.map((moves, index) => (
                  <tr key={index} className="border-b border-white/5 last:border-0">
                    <td className="py-2 opacity-70">{index + 1}.</td>
                    <td 
                      className={cn(
                        "py-2", 
                        onMoveClick && "cursor-pointer hover:text-primary"
                      )}
                      onClick={() => onMoveClick?.(index * 2)}
                    >
                      {moves[0]}
                    </td>
                    <td 
                      className={cn(
                        "py-2", 
                        moves[1] && onMoveClick && "cursor-pointer hover:text-primary"
                      )}
                      onClick={() => moves[1] && onMoveClick?.(index * 2 + 1)}
                    >
                      {moves[1] || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MoveHistory;
