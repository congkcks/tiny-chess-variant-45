
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { GameState, PieceColor } from '@/lib/chess-models';
import { RefreshCw, RotateCcw, Save, Undo, ArrowDownUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: () => void;
  onFlipBoard: () => void;
  onUndoMove?: () => void;
  className?: string;
}

const GameControls: FC<GameControlsProps> = ({ 
  gameState, 
  onNewGame, 
  onFlipBoard, 
  onUndoMove,
  className
}) => {
  const { currentPlayer, isCheckmate, isStalemate } = gameState;
  const gameOver = isCheckmate || isStalemate;
  
  const playerToMove = currentPlayer === PieceColor.WHITE ? 'White' : 'Black';
  
  let statusText: string;
  
  if (isCheckmate) {
    const winner = currentPlayer === PieceColor.WHITE ? 'Black' : 'White';
    statusText = `Checkmate! ${winner} wins`;
  } else if (isStalemate) {
    statusText = 'Stalemate! The game is a draw';
  } else {
    statusText = `${playerToMove} to move`;
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <p className={cn(
          "text-sm font-medium",
          gameOver && "text-primary font-bold"
        )}>
          {statusText}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onNewGame}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Game
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onFlipBoard}
        >
          <ArrowDownUp className="w-4 h-4 mr-2" />
          Flip Board
        </Button>
        
        {onUndoMove && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onUndoMove}
            disabled={gameState.moveHistory.length === 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
