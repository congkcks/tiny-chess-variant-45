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
  
  const direction = currentPlayer === PieceColor.WHITE ? 1 : -1;
  
  const oneSquareForward: Position = { row: row + direction, col };
  if (isValidPosition(oneSquareForward) && !board[oneSquareForward.row][oneSquareForward.col]) {
    validMoves.push(oneSquareForward);
    
    if ((currentPlayer === PieceColor.WHITE && row === 1) || 
        (currentPlayer === PieceColor.BLACK && row === 4)) {
      const twoSquaresForward: Position = { row: row + 2 * direction, col };
      if (isValidPosition(twoSquaresForward) && !board[twoSquaresForward.row][twoSquaresForward.col]) {
        validMoves.push(twoSquaresForward);
      }
    }
  }
  
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

// Get valid moves for a bishop
const getValidBishopMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const { row, col } = position;
  const validMoves: Position[] = [];
  
  const directions = [
    { row: 1, col: 1 },   // Down-right
    { row: 1, col: -1 },  // Down-left
    { row: -1, col: 1 },  // Up-right
    { row: -1, col: -1 }  // Up-left
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

// Get valid moves for a queen
const getValidQueenMoves = (gameState: GameState, position: Position): Position[] => {
  const rookMoves = getValidRookMoves(gameState, position);
  const bishopMoves = getValidBishopMoves(gameState, position);
  
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
        const tempBoard = board.map(r => [...r]);
        tempBoard[newPos.row][newPos.col] = { ...board[row][col] };
        tempBoard[row][col] = null;
        
        if (!wouldBeInCheck(gameState, newPos, currentPlayer, tempBoard)) {
          validMoves.push(newPos);
        }
      }
    }
  });
  
  return validMoves;
};

// Helper function to check if a king would be in check at a position
const wouldBeInCheck = (
  gameState: GameState, 
  kingPosition: Position, 
  kingColor: PieceColor,
  testBoard: (ChessPiece | null)[][]
): boolean => {
  const opponentColor = kingColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const piece = testBoard[r][c];
      if (piece && piece.color === opponentColor) {
        const attackingPosition: Position = { row: r, col: c };
        
        const testGameState = { ...gameState, board: testBoard, currentPlayer: opponentColor };
        const moves = getBasicValidMoves(testGameState, attackingPosition);
        
        if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Get basic valid moves without king check validation to avoid circular reference
const getBasicValidMoves = (gameState: GameState, position: Position): Position[] => {
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
      return getBasicKingMoves(gameState, position);
    default:
      return [];
  }
};

// Basic king moves without check validation
const getBasicKingMoves = (gameState: GameState, position: Position): Position[] => {
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

// Make a move
export const makeMove = (
  gameState: GameState, 
  from: Position, 
  to: Position,
  promoteTo?: PieceType
): GameState => {
  const { board, currentPlayer, pieceBank } = gameState;
  
  const newBoard = board.map(row => [...row]);
  
  const movingPiece = newBoard[from.row][from.col];
  const targetPiece = newBoard[to.row][to.col];
  
  if (!movingPiece) {
    console.error('No piece at source position');
    return gameState;
  }
  
  newBoard[to.row][to.col] = { ...movingPiece, hasMoved: true };
  newBoard[from.row][from.col] = null;
  
  if (promoteTo && movingPiece.type === PieceType.PAWN) {
    newBoard[to.row][to.col] = { 
      ...movingPiece, 
      type: promoteTo,
      hasMoved: true
    };
  }
  
  let updatedPieceBank = { ...pieceBank };
  if (targetPiece) {
    const capturedPiece = {
      ...targetPiece,
      color: currentPlayer,
      id: `captured-${targetPiece.type}-${Date.now()}`,
      hasMoved: true
    };
    
    updatedPieceBank = {
      ...pieceBank,
      [currentPlayer]: [...pieceBank[currentPlayer], capturedPiece]
    };
  }
  
  const move: Move = {
    from,
    to,
    piece: movingPiece,
    capturedPiece: targetPiece,
    isPromotion: !!promoteTo,
    promoteTo: promoteTo,
  };
  
  const nextPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
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
  
  const isCheck = isKingInCheck(newGameState);
  newGameState.isCheck = isCheck;
  
  const isCheckmate = isCheck && checkIfCheckmate(newGameState);
  newGameState.isCheckmate = isCheckmate;
  
  const isStalemate = !isCheck && checkIfStalemate(newGameState);
  newGameState.isStalemate = isStalemate;
  
  return newGameState;
};

export const isKingInCheck = (gameState: GameState): boolean => {
  const { board, currentPlayer } = gameState;
  
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
    console.error('King not found');
    return false;
  }
  
  const opponentColor = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const validMoves = getValidMoves({ ...gameState, currentPlayer: opponentColor }, { row, col });
        
        if (validMoves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

export const checkIfCheckmate = (gameState: GameState): boolean => {
  const { currentPlayer, board } = gameState;
  
  if (!isKingInCheck(gameState)) {
    return false;
  }
  
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
  
  for (const move of getValidMoves(gameState, kingPosition)) {
    const tempGameState = makeMove({...gameState}, kingPosition, move);
    const kingStillInCheck = isKingInCheck({
      ...tempGameState,
      currentPlayer: currentPlayer
    });
    
    if (!kingStillInCheck) {
      return false;
    }
  }
  
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer && piece.type !== PieceType.KING) {
        const position: Position = { row, col };
        const validMoves = getValidMoves(gameState, position);
        
        for (const move of validMoves) {
          const tempGameState = makeMove({...gameState}, position, move);
          const kingStillInCheck = isKingInCheck({
            ...tempGameState,
            currentPlayer: currentPlayer
          });
          
          if (!kingStillInCheck) {
            return false;
          }
        }
      }
    }
  }
  
  if (gameState.pieceBank[currentPlayer].length > 0) {
    for (const piece of gameState.pieceBank[currentPlayer]) {
      const validDropSquares = getValidDropSquares(gameState, piece);
      
      for (const dropPosition of validDropSquares) {
        const tempGameState = dropPiece({...gameState}, piece, dropPosition);
        const kingStillInCheck = isKingInCheck({
          ...tempGameState,
          currentPlayer: currentPlayer
        });
        
        if (!kingStillInCheck) {
          return false;
        }
      }
    }
  }
  
  console.log("CHECKMATE DETECTED for player:", currentPlayer);
  return true;
};

export const checkIfStalemate = (gameState: GameState): boolean => {
  const { currentPlayer, board } = gameState;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        const position: Position = { row, col };
        const validMoves = getValidMoves(gameState, position);

        if (validMoves.length > 0) {
          return false;
        }
      }
    }
  }

  return !isKingInCheck(gameState);
};

export const getValidDropSquares = (gameState: GameState, piece: ChessPiece): Position[] => {
  const { board } = gameState;
  const validSquares: Position[] = [];

  const isFirstOrLastRank = (row: number): boolean => {
    return row === 0 || row === 5;
  };

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      if (board[row][col] === null) {
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
  
  const newBoard = board.map(row => [...row]);
  
  const uniqueId = `${piece.color}-${piece.type}-${Date.now()}`;
  
  const droppedPiece: ChessPiece = {
    ...piece,
    id: uniqueId,
    hasMoved: true,
  };
  
  newBoard[position.row][position.col] = droppedPiece;
  
  const newPieceBank = { ...pieceBank };
  const pieceBankForCurrentPlayer = [...newPieceBank[currentPlayer]];
  
  const pieceIndex = pieceBankForCurrentPlayer.findIndex(p => p.type === piece.type);
  
  if (pieceIndex !== -1) {
    pieceBankForCurrentPlayer.splice(pieceIndex, 1);
    newPieceBank[currentPlayer] = pieceBankForCurrentPlayer;
  }
  
  const move: Move = {
    from: { row: -1, col: -1 },
    to: position,
    piece: droppedPiece,
    isDropped: true,
  };
  
  const nextPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
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
  
  const isCheck = isKingInCheck(newState);
  newState.isCheck = isCheck;
  
  const isCheckmate = isCheck && checkIfCheckmate(newState);
  newState.isCheckmate = isCheckmate;
  
  return newState;
};
