import {
  ChessPiece,
  GameState,
  Move,
  PieceColor,
  PieceType,
  Position,
  isValidPosition
} from "./chess-models";

// Get all valid moves for a piece
export const getValidMoves = (
  state: GameState,
  position: Position
): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece) return [];
  
  let moves: Position[] = [];
  
  switch (piece.type) {
    case PieceType.PAWN:
      moves = getPawnMoves(state, position);
      break;
    case PieceType.KNIGHT:
      moves = getKnightMoves(state, position);
      break;
    case PieceType.ROOK:
      moves = getRookMoves(state, position);
      break;
    case PieceType.QUEEN:
      moves = getQueenMoves(state, position);
      break;
    case PieceType.KING:
      moves = getKingMoves(state, position);
      break;
  }
  
  // Filter moves that would put or leave the king in check
  return moves.filter(move => !wouldBeInCheck(state, position, move));
};

// Check if a move would leave the king in check
const wouldBeInCheck = (
  state: GameState, 
  from: Position, 
  to: Position
): boolean => {
  // Make a deep copy of the board
  const newBoard = state.board.map(row => [...row]);
  const movingPiece = newBoard[from.row][from.col];
  
  if (!movingPiece) return false;
  
  // Execute move on temporary board
  newBoard[to.row][to.col] = movingPiece;
  newBoard[from.row][from.col] = null;
  
  // Find the king
  let kingPos: Position | null = null;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = newBoard[row][col];
      if (piece && piece.type === PieceType.KING && piece.color === movingPiece.color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false; // This shouldn't happen in a valid game
  
  // Check if any opponent piece can capture the king
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = newBoard[row][col];
      if (piece && piece.color !== movingPiece.color) {
        const attackMoves = getRawMoves({ ...state, board: newBoard }, { row, col });
        if (attackMoves.some(move => move.row === kingPos!.row && move.col === kingPos!.col)) {
          return true; // King would be in check
        }
      }
    }
  }
  
  return false;
};

// Get raw moves without checking for checks
const getRawMoves = (state: GameState, position: Position): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece) return [];
  
  switch (piece.type) {
    case PieceType.PAWN:
      return getPawnMoves(state, position, true);
    case PieceType.KNIGHT:
      return getKnightMoves(state, position, true);
    case PieceType.ROOK:
      return getRookMoves(state, position, true);
    case PieceType.QUEEN:
      return getQueenMoves(state, position, true);
    case PieceType.KING:
      return getKingMoves(state, position, true);
    default:
      return [];
  }
};

// Get valid moves for a pawn
const getPawnMoves = (
  state: GameState, 
  position: Position,
  rawMoves = false
): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece || piece.type !== PieceType.PAWN) return [];
  
  const moves: Position[] = [];
  const direction = piece.color === PieceColor.WHITE ? 1 : -1;
  const startRow = piece.color === PieceColor.WHITE ? 1 : 4;
  
  // Forward move
  const forwardPos = { row: position.row + direction, col: position.col };
  if (isValidPosition(forwardPos) && !board[forwardPos.row][forwardPos.col]) {
    moves.push(forwardPos);
    
    // Double move from starting position
    if (position.row === startRow) {
      const doublePos = { row: position.row + 2 * direction, col: position.col };
      if (isValidPosition(doublePos) && !board[doublePos.row][doublePos.col]) {
        moves.push(doublePos);
      }
    }
  }
  
  // Captures
  const capturePositions = [
    { row: position.row + direction, col: position.col - 1 },
    { row: position.row + direction, col: position.col + 1 }
  ];
  
  for (const capturePos of capturePositions) {
    if (isValidPosition(capturePos)) {
      const targetPiece = board[capturePos.row][capturePos.col];
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push(capturePos);
      }
    }
  }
  
  return moves;
};

// Get valid moves for a knight
const getKnightMoves = (
  state: GameState, 
  position: Position,
  rawMoves = false
): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece || piece.type !== PieceType.KNIGHT) return [];
  
  const knightOffsets = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];
  
  return knightOffsets
    .map(offset => ({
      row: position.row + offset.row,
      col: position.col + offset.col
    }))
    .filter(pos => 
      isValidPosition(pos) && 
      (!board[pos.row][pos.col] || board[pos.row][pos.col]?.color !== piece.color)
    );
};

// Get valid moves for a rook
const getRookMoves = (
  state: GameState, 
  position: Position,
  rawMoves = false
): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece || piece.type !== PieceType.ROOK) return [];
  
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // Up
    { row: 1, col: 0 },  // Down
    { row: 0, col: -1 }, // Left
    { row: 0, col: 1 }   // Right
  ];
  
  for (const direction of directions) {
    let currentRow = position.row + direction.row;
    let currentCol = position.col + direction.col;
    
    while (isValidPosition({ row: currentRow, col: currentCol })) {
      const targetPiece = board[currentRow][currentCol];
      
      if (!targetPiece) {
        // Empty square, we can move here
        moves.push({ row: currentRow, col: currentCol });
      } else if (targetPiece.color !== piece.color) {
        // Opponent's piece, we can capture it but can't go further
        moves.push({ row: currentRow, col: currentCol });
        break;
      } else {
        // Our own piece, we can't move here
        break;
      }
      
      currentRow += direction.row;
      currentCol += direction.col;
    }
  }
  
  return moves;
};

// Get valid moves for a queen (combination of rook and bishop)
const getQueenMoves = (
  state: GameState, 
  position: Position,
  rawMoves = false
): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece || piece.type !== PieceType.QUEEN) return [];
  
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 },  // Up
    { row: 1, col: 0 },   // Down
    { row: 0, col: -1 },  // Left
    { row: 0, col: 1 },   // Right
    { row: -1, col: -1 }, // Up-Left
    { row: -1, col: 1 },  // Up-Right
    { row: 1, col: -1 },  // Down-Left
    { row: 1, col: 1 }    // Down-Right
  ];
  
  for (const direction of directions) {
    let currentRow = position.row + direction.row;
    let currentCol = position.col + direction.col;
    
    while (isValidPosition({ row: currentRow, col: currentCol })) {
      const targetPiece = board[currentRow][currentCol];
      
      if (!targetPiece) {
        // Empty square, we can move here
        moves.push({ row: currentRow, col: currentCol });
      } else if (targetPiece.color !== piece.color) {
        // Opponent's piece, we can capture it but can't go further
        moves.push({ row: currentRow, col: currentCol });
        break;
      } else {
        // Our own piece, we can't move here
        break;
      }
      
      currentRow += direction.row;
      currentCol += direction.col;
    }
  }
  
  return moves;
};

// Get valid moves for a king
const getKingMoves = (
  state: GameState, 
  position: Position,
  rawMoves = false
): Position[] => {
  const { board } = state;
  const piece = board[position.row][position.col];
  
  if (!piece || piece.type !== PieceType.KING) return [];
  
  const kingOffsets = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ];
  
  const moves = kingOffsets
    .map(offset => ({
      row: position.row + offset.row,
      col: position.col + offset.col
    }))
    .filter(pos => 
      isValidPosition(pos) && 
      (!board[pos.row][pos.col] || board[pos.row][pos.col]?.color !== piece.color)
    );
    
  // If we're just getting raw moves (e.g., to check for attacks), return now
  if (rawMoves) return moves;
  
  return moves;
};

// Check if the king is in check
export const isInCheck = (state: GameState, color: PieceColor): boolean => {
  const { board } = state;
  
  // Find the king
  let kingPos: Position | null = null;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false; // This shouldn't happen in a valid game
  
  // Check if any opponent piece can capture the king
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== color) {
        const attackMoves = getRawMoves(state, { row, col });
        if (attackMoves.some(move => 
          move.row === kingPos!.row && move.col === kingPos!.col
        )) {
          return true; // King is in check
        }
      }
    }
  }
  
  return false;
};

// Check if the current player is in checkmate
export const isCheckmate = (state: GameState): boolean => {
  const { currentPlayer } = state;
  
  // If not in check, can't be checkmate
  if (!isInCheck(state, currentPlayer)) return false;
  
  // Check if any piece of the current player has a valid move
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === currentPlayer) {
        const moves = getValidMoves(state, { row, col });
        if (moves.length > 0) {
          return false; // Player has at least one valid move
        }
      }
    }
  }
  
  return true; // No valid moves and in check = checkmate
};

// Check if the current player is in stalemate
export const isStalemate = (state: GameState): boolean => {
  const { currentPlayer } = state;
  
  // If in check, it's not stalemate
  if (isInCheck(state, currentPlayer)) return false;
  
  // Check if any piece of the current player has a valid move
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === currentPlayer) {
        const moves = getValidMoves(state, { row, col });
        if (moves.length > 0) {
          return false; // Player has at least one valid move
        }
      }
    }
  }
  
  return true; // No valid moves and not in check = stalemate
};

// Get valid squares for dropping a piece
export const getValidDropSquares = (
  state: GameState,
  piece: ChessPieceType
): Position[] => {
  const { board } = state;
  const validSquares: Position[] = [];

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      // Square must be empty
      if (board[row][col] === null) {
        // Pawns can't be dropped on the first or last rank
        if (piece.type === PieceType.PAWN && (row === 0 || row === 5)) {
          continue;
        }
        validSquares.push({ row, col });
      }
    }
  }

  return validSquares;
};

// Drop a piece from the piece bank
export const dropPiece = (
  state: GameState,
  piece: ChessPieceType,
  position: Position
): GameState => {
  // Create deep copies
  const newBoard = state.board.map(row => [...row]);
  const newPieceBank = {
    [PieceColor.WHITE]: [...state.pieceBank[PieceColor.WHITE]],
    [PieceColor.BLACK]: [...state.pieceBank[PieceColor.BLACK]]
  };

  // Remove the first piece of this type from the bank
  const bankPieces = newPieceBank[state.currentPlayer];
  const pieceIndex = bankPieces.findIndex(p => p.type === piece.type);
  if (pieceIndex === -1) return state;
  bankPieces.splice(pieceIndex, 1);

  // Place the piece
  newBoard[position.row][position.col] = {
    ...piece,
    color: state.currentPlayer,
    hasMoved: true
  };

  // Create the new state
  const newState: GameState = {
    ...state,
    board: newBoard,
    pieceBank: newPieceBank,
    currentPlayer: state.currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE,
    selectedPiece: null,
    validMoves: [],
    isDroppingPiece: false,
    lastMove: {
      piece,
      from: { row: -1, col: -1 }, // Special coordinates to indicate a drop
      to: position,
      isDropped: true
    }
  };

  // Check if this drop results in check
  newState.isCheck = isInCheck(newState, newState.currentPlayer);
  if (newState.isCheck) {
    newState.isCheckmate = isCheckmate(newState);
    newState.lastMove = {
      ...newState.lastMove,
      isCheck: true,
      isCheckmate: newState.isCheckmate
    };
  } else {
    newState.isStalemate = isStalemate(newState);
  }

  return newState;
};

// Make a move and return the new game state
export const makeMove = (
  state: GameState,
  from: Position,
  to: Position,
  promoteTo?: PieceType
): GameState => {
  const { board, currentPlayer, moveHistory } = state;
  const piece = board[from.row][from.col];
  
  if (!piece || piece.color !== currentPlayer) {
    return state; // Invalid move
  }
  
  // Create a deep copy of the board and piece bank
  const newBoard = board.map(row => [...row]);
  const newPieceBank = {
    [PieceColor.WHITE]: [...state.pieceBank[PieceColor.WHITE]],
    [PieceColor.BLACK]: [...state.pieceBank[PieceColor.BLACK]]
  };
  
  // Capture logic - add to piece bank
  const capturedPiece = newBoard[to.row][to.col];
  if (capturedPiece) {
    const convertedPiece = {
      ...capturedPiece,
      color: currentPlayer,
      id: `captured-${Date.now()}-${capturedPiece.id}`,
      hasMoved: true
    };
    newPieceBank[currentPlayer].push(convertedPiece);
  }

  // Special handling for pawn promotion
  let isPromotion = false;
  if (piece.type === PieceType.PAWN && 
      ((piece.color === PieceColor.WHITE && to.row === 5) || 
       (piece.color === PieceColor.BLACK && to.row === 0))) {
    isPromotion = true;
    // If no promotion piece specified, default to Queen
    const promotionType = promoteTo || PieceType.QUEEN;
    newBoard[to.row][to.col] = {
      ...piece,
      type: promotionType,
      hasMoved: true
    };
  } else {
    // Regular move
    newBoard[to.row][to.col] = {
      ...piece,
      hasMoved: true
    };
  }
  
  // Clear the original position
  newBoard[from.row][from.col] = null;
  
  // Prepare the new game state
  const newState: GameState = {
    ...state,
    board: newBoard,
    pieceBank: newPieceBank,
    currentPlayer: currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE,
    selectedPiece: null,
    validMoves: [],
    lastMove: {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
      isPromotion,
      promoteTo: isPromotion ? (promoteTo || PieceType.QUEEN) : undefined
    }
  };
  
  // Check if the move results in check
  const isInCheckNow = isInCheck(newState, newState.currentPlayer);
  newState.isCheck = isInCheckNow;
  
  // Check for checkmate or stalemate
  if (isInCheckNow) {
    newState.isCheckmate = isCheckmate(newState);
    newState.lastMove = {
      ...newState.lastMove,
      isCheck: true,
      isCheckmate: newState.isCheckmate
    };
  } else {
    newState.isStalemate = isStalemate(newState);
  }
  
  // Add the move to history
  newState.moveHistory = [...moveHistory, newState.lastMove!];
  
  return newState;
};
