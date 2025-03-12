
// Chess piece types
export enum PieceType {
  KING = 'king',
  QUEEN = 'queen',
  ROOK = 'rook',
  KNIGHT = 'knight',
  PAWN = 'pawn'
}

// Chess piece colors
export enum PieceColor {
  WHITE = 'white',
  BLACK = 'black'
}

// Chess piece representation
export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

// Position on the board
export interface Position {
  row: number;
  col: number;
}

// Represent a move
export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isPromotion?: boolean;
  promoteTo?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
}

// Game state
export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  moveHistory: Move[];
  selectedPiece: Position | null;
  validMoves: Position[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  lastMove: Move | null;
}

// Game initialization
export const createInitialBoard = (): (ChessPiece | null)[][] => {
  // Create 6x6 board
  const board: (ChessPiece | null)[][] = Array(6).fill(null).map(() => Array(6).fill(null));
  
  // Set up pawns
  for (let col = 0; col < 6; col++) {
    board[1][col] = { 
      id: `white-pawn-${col}`, 
      type: PieceType.PAWN, 
      color: PieceColor.WHITE,
      hasMoved: false
    };
    board[4][col] = { 
      id: `black-pawn-${col}`, 
      type: PieceType.PAWN, 
      color: PieceColor.BLACK,
      hasMoved: false
    };
  }
  
  // Set up other pieces for white
  board[0][0] = { id: 'white-rook-0', type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };
  board[0][1] = { id: 'white-knight-0', type: PieceType.KNIGHT, color: PieceColor.WHITE, hasMoved: false };
  board[0][2] = { id: 'white-queen', type: PieceType.QUEEN, color: PieceColor.WHITE, hasMoved: false };
  board[0][3] = { id: 'white-king', type: PieceType.KING, color: PieceColor.WHITE, hasMoved: false };
  board[0][4] = { id: 'white-knight-1', type: PieceType.KNIGHT, color: PieceColor.WHITE, hasMoved: false };
  board[0][5] = { id: 'white-rook-1', type: PieceType.ROOK, color: PieceColor.WHITE, hasMoved: false };
  
  // Set up other pieces for black
  board[5][0] = { id: 'black-rook-0', type: PieceType.ROOK, color: PieceColor.BLACK, hasMoved: false };
  board[5][1] = { id: 'black-knight-0', type: PieceType.KNIGHT, color: PieceColor.BLACK, hasMoved: false };
  board[5][2] = { id: 'black-king', type: PieceType.KING, color: PieceColor.BLACK, hasMoved: false };
  board[5][3] = { id: 'black-queen', type: PieceType.QUEEN, color: PieceColor.BLACK, hasMoved: false };
  board[5][4] = { id: 'black-knight-1', type: PieceType.KNIGHT, color: PieceColor.BLACK, hasMoved: false };
  board[5][5] = { id: 'black-rook-1', type: PieceType.ROOK, color: PieceColor.BLACK, hasMoved: false };
  
  return board;
};

export const createInitialGameState = (): GameState => {
  return {
    board: createInitialBoard(),
    currentPlayer: PieceColor.WHITE,
    moveHistory: [],
    selectedPiece: null,
    validMoves: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    lastMove: null
  };
};

// Check if a position is within the board bounds
export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 6 && pos.col >= 0 && pos.col < 6;
};

// Convert algebraic notation (e.g., "a1") to a Position object
export const algebraicToPosition = (algebraic: string): Position => {
  const col = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = parseInt(algebraic.charAt(1)) - 1;
  return { row, col };
};

// Convert a Position object to algebraic notation
export const positionToAlgebraic = (pos: Position): string => {
  const colChar = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  return `${colChar}${pos.row + 1}`;
};
