import { 
  ChessPiece, 
  GameState, 
  PieceColor, 
  PieceType, 
  Position,
  isValidPosition,
  Move
} from './chess-models';

// Get all valid moves for a piece
export const getValidMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const piece = board[position.row][position.col];
  
  if (!piece || piece.color !== currentPlayer) {
    return [];
  }
  
  switch (piece.type) {
    case PieceType.PAWN:
      return getValidPawnMoves(gameState, position);
    case PieceType.ROOK:
      return getValidRookMoves(gameState, position);
    case PieceType.KNIGHT:
      return getValidKnightMoves(gameState, position);
    case PieceType.BISHOP:
      return getValidBishopMoves(gameState, position);
    case PieceType.QUEEN:
      return getValidQueenMoves(gameState, position);
    case PieceType.KING:
      return getValidKingMoves(gameState, position);
    default:
      return [];
  }
};

// Get valid moves for a pawn
const getValidPawnMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const { row, col } = position;
  const validMoves: Position[] = [];
  
  // Direction is different for white and black pawns
  const direction = currentPlayer === PieceColor.WHITE ? 1 : -1;
  
  // One square forward
  const oneSquareForward: Position = { row: row + direction, col };
  if (isValidPosition(oneSquareForward) && !board[oneSquareForward.row][oneSquareForward.col]) {
    validMoves.push(oneSquareForward);
    
    // Two squares forward from starting position
    if ((currentPlayer === PieceColor.WHITE && row === 1) || 
        (currentPlayer === PieceColor.BLACK && row === 4)) {
      const twoSquaresForward: Position = { row: row + 2 * direction, col };
      if (isValidPosition(twoSquaresForward) && !board[twoSquaresForward.row][twoSquaresForward.col]) {
        validMoves.push(twoSquaresForward);
      }
    }
  }
  
  // Capture diagonally
  const capturePositions: Position[] = [
    { row: row + direction, col: col - 1 },
    { row: row + direction, col: col + 1 }
  ];
  
  capturePositions.forEach(capturePos => {
    if (isValidPosition(capturePos)) {
      const targetPiece = board[capturePos.row][capturePos.col];
      if (targetPiece && targetPiece.color !== currentPlayer) {
        validMoves.push(capturePos);
      }
    }
  });
  
  return validMoves;
};

// Get valid moves for a rook
const getValidRookMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const { row, col } = position;
  const validMoves: Position[] = [];
  
  const directions = [
    { row: 1, col: 0 },  // Down
    { row: -1, col: 0 }, // Up
    { row: 0, col: 1 },  // Right
    { row: 0, col: -1 }   // Left
  ];
  
  directions.forEach(dir => {
    for (let i = 1; i < 6; i++) {
      const newPos: Position = { row: row + i * dir.row, col: col + i * dir.col };
      if (!isValidPosition(newPos)) break;
      
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece) {
        validMoves.push(newPos);
      } else {
        if (targetPiece.color !== currentPlayer) {
          validMoves.push(newPos);
        }
        break;
      }
    }
  });
  
  return validMoves;
};

// Get valid moves for a knight
const getValidKnightMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const { row, col } = position;
  const validMoves: Position[] = [];
  
  const knightMoves = [
    { row: 2, col: 1 },
    { row: 2, col: -1 },
    { row: -2, col: 1 },
    { row: -2, col: -1 },
    { row: 1, col: 2 },
    { row: 1, col: -2 },
    { row: -1, col: 2 },
    { row: -1, col: -2 }
  ];
  
  knightMoves.forEach(move => {
    const newPos: Position = { row: row + move.row, col: col + move.col };
    if (isValidPosition(newPos)) {
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece || targetPiece.color !== currentPlayer) {
        validMoves.push(newPos);
      }
    }
  });
  
  return validMoves;
};

// Get valid moves for a queen
const getValidQueenMoves = (gameState: GameState, position: Position): Position[] => {
  const rookMoves = getValidRookMoves(gameState, position);
  const bishopMoves: Position[] = getValidBishopMoves(gameState, position); // Ensure this function exists
  
  return [...rookMoves, ...bishopMoves];
};

// Get valid moves for a king
const getValidKingMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const { row, col } = position;
  const validMoves: Position[] = [];
  
  const kingMoves = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 }
  ];
  
  kingMoves.forEach(move => {
    const newPos: Position = { row: row + move.row, col: col + move.col };
    if (isValidPosition(newPos)) {
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece || targetPiece.color !== currentPlayer) {
        validMoves.push(newPos);
      }
    }
  });
  
  return validMoves;
};

// Get valid moves for a bishop
const getValidBishopMoves = (gameState: GameState, position: Position): Position[] => {
    const { board, currentPlayer } = gameState;
    const { row, col } = position;
    const validMoves: Position[] = [];

    const directions = [
        { row: 1, col: 1 },  // Down-Right
        { row: 1, col: -1 }, // Down-Left
        { row: -1, col: 1 }, // Up-Right
        { row: -1, col: -1 }  // Up-Left
    ];

    directions.forEach(dir => {
        for (let i = 1; i < 6; i++) {
            const newPos: Position = { row: row + i * dir.row, col: col + i * dir.col };
            if (!isValidPosition(newPos)) break;

            const targetPiece = board[newPos.row][newPos.col];
            if (!targetPiece) {
                validMoves.push(newPos);
            } else {
                if (targetPiece.color !== currentPlayer) {
                    validMoves.push(newPos);
                }
                break;
            }
        }
    });

    return validMoves;
};

// Make a move
export const makeMove = (
  gameState: GameState, 
  from: Position, 
  to: Position,
  promoteTo?: PieceType
): GameState => {
  const { board, currentPlayer, pieceBank } = gameState;
  
  // Copy the board to create a new board state
  const newBoard = board.map(row => [...row]);
  
  // Get the moving piece and the target piece
  const movingPiece = newBoard[from.row][from.col];
  const targetPiece = newBoard[to.row][to.col];
  
  if (!movingPiece) {
    console.error('No piece at source position');
    return gameState;
  }
  
  // Move the piece
  newBoard[to.row][to.col] = { ...movingPiece, hasMoved: true };
  newBoard[from.row][from.col] = null;
  
  // Handle pawn promotion
  if (promoteTo && movingPiece.type === PieceType.PAWN) {
    newBoard[to.row][to.col] = { 
      ...movingPiece, 
      type: promoteTo,
      hasMoved: true
    };
  }
  
  // Handle capturing a piece
  let updatedPieceBank = { ...pieceBank };
  if (targetPiece) {
    // Change the captured piece's color to the capturing player's color
    const capturedPiece = {
      ...targetPiece,
      color: currentPlayer, // Change color to the current player
      id: `captured-${targetPiece.type}-${Date.now()}`, // Create a new ID
      hasMoved: true // Mark as moved
    };
    
    updatedPieceBank = {
      ...pieceBank,
      [currentPlayer]: [...pieceBank[currentPlayer], capturedPiece]
    };
  }
  
  // Create the move record
  const move: Move = {
    from,
    to,
    piece: movingPiece,
    capturedPiece: targetPiece,
    isPromotion: !!promoteTo,
    promoteTo: promoteTo,
  };
  
  // Switch the current player
  const nextPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  // Update game state
  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    moveHistory: [...gameState.moveHistory, move],
    selectedPiece: null,
    validMoves: [],
    pieceBank: updatedPieceBank,
    lastMove: move,
  };
  
  // We need to check if the OPPONENT is in check after the move
  const isCheck = isKingInCheck(newGameState);
  newGameState.isCheck = isCheck;
  
  // Check if the OPPONENT is in checkmate
  const isCheckmate = isCheck && checkIfCheckmate(newGameState);
  newGameState.isCheckmate = isCheckmate;

  // Check if the OPPONENT is in stalemate
  const isStalemate = !isCheck && checkIfStalemate(newGameState);
  newGameState.isStalemate = isStalemate;
  
  return newGameState;
};

// Check if the current player's king is in check
export const isKingInCheck = (gameState: GameState): boolean => {
  const { board, currentPlayer } = gameState;
  
  // Find the king's position
  let kingPosition: Position | null = null;
  
  // Look for the current player's king
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece?.type === PieceType.KING && piece?.color === currentPlayer) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }
  
  if (!kingPosition) {
    console.error('King not found');
    return false;
  }
  
  // Check if any opponent's piece can attack the king
  const opponentColor = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        // Get valid moves for the opponent's piece
        const validMoves = getValidMoves({ ...gameState, currentPlayer: opponentColor }, { row, col });
        
        // Check if any valid move includes the king's position
        if (validMoves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Improved checkmate detection
export const checkIfCheckmate = (gameState: GameState): boolean => {
  const { currentPlayer, board } = gameState;
  
  // First, check if the king is in check
  if (!isKingInCheck(gameState)) {
    return false;
  }
  
  // Find the king's position
  let kingPosition: Position | null = null;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece?.type === PieceType.KING && piece?.color === currentPlayer) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }
  
  if (!kingPosition) {
    console.error('King not found in checkmate detection');
    return false;
  }
  
  // 1. Check if the king can move to escape check
  const kingValidMoves = getValidMoves(gameState, kingPosition);
  for (const move of kingValidMoves) {
    // Create a new game state with this move applied
    const tempGameState = makeMove({...gameState}, kingPosition, move);
    
    // Check if king is still in check after this move
    // We need to check the current player's king since makeMove switches the current player
    const kingStillInCheck = isKingInCheck({
      ...tempGameState,
      currentPlayer: currentPlayer // Override the current player
    });
    
    if (!kingStillInCheck) {
      // If any move gets out of check, it's not checkmate
      return false;
    }
  }
  
  // 2. Check if any other piece can block the check or capture the attacking piece
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer && piece.type !== PieceType.KING) {
        const position: Position = { row, col };
        const validMoves = getValidMoves(gameState, position);
        
        // For each valid move, simulate the move and check if it gets out of check
        for (const move of validMoves) {
          // Create a new game state with this move applied
          const tempGameState = makeMove({...gameState}, position, move);
          
          // Check if king is still in check after this move
          const kingStillInCheck = isKingInCheck({
            ...tempGameState,
            currentPlayer: currentPlayer // Override the current player
          });
          
          if (!kingStillInCheck) {
            // If any move gets out of check, it's not checkmate
            return false;
          }
        }
      }
    }
  }
  
  // 3. Check if there are any pieces in the piece bank that could help escape check
  const pieceBank = gameState.pieceBank[currentPlayer];
  if (pieceBank.length > 0) {
    for (const piece of pieceBank) {
      const validDropSquares = getValidDropSquares(gameState, piece);
      
      for (const dropPosition of validDropSquares) {
        // Simulate dropping the piece
        const tempGameState = dropPiece({...gameState}, piece, dropPosition);
        
        // Check if king is still in check after this drop
        const kingStillInCheck = isKingInCheck({
          ...tempGameState,
          currentPlayer: currentPlayer // Override the current player since dropPiece switches it
        });
        
        if (!kingStillInCheck) {
          // If any drop gets out of check, it's not checkmate
          return false;
        }
      }
    }
  }
  
  // If no moves or drops escape check, it's checkmate
  console.log("CHECKMATE DETECTED for player:", currentPlayer);
  return true;
};

// Check if the current player is in stalemate
export const checkIfStalemate = (gameState: GameState): boolean => {
  const { currentPlayer, board } = gameState;

  // Iterate through all pieces of the current player
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        const position: Position = { row, col };
        const validMoves = getValidMoves(gameState, position);

        // If there's any valid move, it's not stalemate
        if (validMoves.length > 0) {
          return false;
        }
      }
    }
  }

  // If the king is not in check and there are no valid moves, it's stalemate
  return !isKingInCheck(gameState);
};

// Add these functions to support the piece dropping feature
export const getValidDropSquares = (gameState: GameState, piece: ChessPiece): Position[] => {
  const { board } = gameState;
  const validSquares: Position[] = [];

  // Pawns can't be dropped on the first or last rank
  const isFirstOrLastRank = (row: number): boolean => {
    return row === 0 || row === 5;
  };

  // Check each square on the board
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      // Square must be empty
      if (board[row][col] === null) {
        // Pawns can't be dropped on the first or last rank
        if (piece.type === PieceType.PAWN && isFirstOrLastRank(row)) {
          continue;
        }
        validSquares.push({ row, col });
      }
    }
  }

  return validSquares;
};

export const dropPiece = (gameState: GameState, piece: ChessPiece, position: Position): GameState => {
  const newGameState = { ...gameState };
  const { board, pieceBank, currentPlayer } = newGameState;
  
  // Create a new board with the piece dropped
  const newBoard = board.map(row => [...row]);
  
  // Create a unique ID for the dropped piece
  const uniqueId = `${piece.color}-${piece.type}-${Date.now()}`;
  
  // Create the new piece with the unique ID
  const droppedPiece: ChessPiece = {
    ...piece,
    id: uniqueId,
    hasMoved: true,
  };
  
  // Place the piece on the board
  newBoard[position.row][position.col] = droppedPiece;
  
  // Remove the piece from the piece bank
  const newPieceBank = { ...pieceBank };
  const pieceBankForCurrentPlayer = [...newPieceBank[currentPlayer]];
  
  // Find the index of the first piece of the same type
  const pieceIndex = pieceBankForCurrentPlayer.findIndex(p => p.type === piece.type);
  
  if (pieceIndex !== -1) {
    pieceBankForCurrentPlayer.splice(pieceIndex, 1);
    newPieceBank[currentPlayer] = pieceBankForCurrentPlayer;
  }
  
  // Create the move record
  const move: Move = {
    from: { row: -1, col: -1 }, // Special marker for dropped pieces
    to: position,
    piece: droppedPiece,
    isDropped: true,
  };
  
  // Switch the current player
  const nextPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  // Update game state
  const newState = {
    ...newGameState,
    board: newBoard,
    pieceBank: newPieceBank,
    currentPlayer: nextPlayer,
    moveHistory: [...newGameState.moveHistory, move],
    selectedPiece: null,
    validMoves: [],
    lastMove: move,
    isDroppingPiece: false,
  };
  
  // Check if the opponent is now in check or checkmate
  const isCheck = isKingInCheck(newState);
  newState.isCheck = isCheck;
  
  // Check for checkmate
  const isCheckmate = isCheck && checkIfCheckmate(newState);
  newState.isCheckmate = isCheckmate;
  
  return newState;
};
