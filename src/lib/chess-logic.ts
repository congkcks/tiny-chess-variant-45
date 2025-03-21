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
// Get all valid moves for a piece
export const getValidMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const piece = board[position.row][position.col];

  if (!piece || piece.color !== currentPlayer) {
    return [];
  }

  let validMoves: Position[] = [];

  // Thực hiện logic di chuyển bình thường
  switch (piece.type) {
    case PieceType.PAWN:
      validMoves = getValidPawnMoves(gameState, position);
      break;
    case PieceType.ROOK:
      validMoves = getValidRookMoves(gameState, position);
      break;
    case PieceType.KNIGHT:
      validMoves = getValidKnightMoves(gameState, position);
      break;
    case PieceType.BISHOP:
      validMoves = getValidBishopMoves(gameState, position);
      break;
    case PieceType.QUEEN:
      validMoves = getValidQueenMoves(gameState, position);
      break;
    case PieceType.KING:
      validMoves = getValidKingMoves(gameState, position);
      break;
    default:
      validMoves = [];
  }

  // Kiểm tra an toàn cho vua chỉ khi không trong trạng thái bị chiếu
  if (!isKingInCheck(gameState)) {
    validMoves = validMoves.filter(move => {
      // Tạo một bàn cờ tạm thời để thử nước đi
      const tempBoard = board.map(row => [...row]);
      const movingPiece = tempBoard[position.row][position.col];

      // Di chuyển quân cờ
      tempBoard[move.row][move.col] = movingPiece;
      tempBoard[position.row][position.col] = null;

      // Tạo một gameState tạm thời
      const tempGameState: GameState = {
        ...gameState,
        board: tempBoard
      };

      // Kiểm tra xem vua còn bị chiếu không sau nước đi này
      return !isKingInCheck(tempGameState);
    });
  }

  return validMoves;
};
// Hàm kiểm tra xem nước đi có an toàn cho vua không
const isMoveSafeForKing = (gameState: GameState, from: Position, to: Position): boolean => {
  const { board, currentPlayer } = gameState;

  // Tạo một bàn cờ tạm thời để thử nước đi
  const tempBoard = board.map(row => [...row]);
  const movingPiece = tempBoard[from.row][from.col];

  // Di chuyển quân cờ
  tempBoard[to.row][to.col] = movingPiece;
  tempBoard[from.row][from.col] = null;

  // Tạo một gameState tạm thời
  const tempGameState: GameState = {
    ...gameState,
    board: tempBoard
  };

  // Kiểm tra xem vua còn bị chiếu không sau nước đi này
  return !isKingInCheck(tempGameState);
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
const getAttackingPieces = (gameState: GameState): Position[] => {
  const { board, currentPlayer } = gameState;
  const attackingPieces: Position[] = [];

  // Tìm vị trí vua
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
    console.error('Không tìm thấy vua');
    return attackingPieces;
  }

  // Tìm quân đối phương có thể tấn công vua
  const opponentColor = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        // Kiểm tra từng loại quân với logic riêng
        switch (piece.type) {
          case PieceType.PAWN: {
            const direction = opponentColor === PieceColor.WHITE ? 1 : -1;
            const capturePositions: Position[] = [
              { row: row + direction, col: col - 1 },
              { row: row + direction, col: col + 1 }
            ];
            if (capturePositions.some(pos =>
              pos.row === kingPosition!.row && pos.col === kingPosition!.col
            )) {
              attackingPieces.push({ row, col });
            }
            break;
          }
          case PieceType.ROOK: {
            const directions = [
              { row: 1, col: 0 },  // Down
              { row: -1, col: 0 }, // Up
              { row: 0, col: 1 },  // Right
              { row: 0, col: -1 }   // Left
            ];
            const canAttack = directions.some(dir => {
              for (let i = 1; i < 6; i++) {
                const newPos: Position = {
                  row: row + i * dir.row,
                  col: col + i * dir.col
                };

                if (!isValidPosition(newPos)) break;

                const targetPiece = board[newPos.row][newPos.col];
                if (targetPiece) {
                  if (targetPiece.type === PieceType.KING && targetPiece.color === currentPlayer) {
                    return true;
                  }
                  break;
                }
              }
              return false;
            });
            if (canAttack) attackingPieces.push({ row, col });
            break;
          }
          case PieceType.KNIGHT: {
            const knightMoves = [
              { row: 2, col: 1 }, { row: 2, col: -1 },
              { row: -2, col: 1 }, { row: -2, col: -1 },
              { row: 1, col: 2 }, { row: 1, col: -2 },
              { row: -1, col: 2 }, { row: -1, col: -2 }
            ];
            const canAttack = knightMoves.some(move => {
              const newPos: Position = {
                row: row + move.row,
                col: col + move.col
              };
              return isValidPosition(newPos) &&
                newPos.row === kingPosition!.row &&
                newPos.col === kingPosition!.col;
            });
            if (canAttack) attackingPieces.push({ row, col });
            break;
          }
          case PieceType.BISHOP: {
            const directions = [
              { row: 1, col: 1 },  // Down-Right
              { row: 1, col: -1 }, // Down-Left
              { row: -1, col: 1 }, // Up-Right
              { row: -1, col: -1 }  // Up-Left
            ];
            const canAttack = directions.some(dir => {
              for (let i = 1; i < 6; i++) {
                const newPos: Position = {
                  row: row + i * dir.row,
                  col: col + i * dir.col
                };

                if (!isValidPosition(newPos)) break;

                const targetPiece = board[newPos.row][newPos.col];
                if (targetPiece) {
                  if (targetPiece.type === PieceType.KING && targetPiece.color === currentPlayer) {
                    return true;
                  }
                  break;
                }
              }
              return false;
            });
            if (canAttack) attackingPieces.push({ row, col });
            break;
          }
          case PieceType.QUEEN: {
            const rookDirections = [
              { row: 1, col: 0 }, { row: -1, col: 0 },
              { row: 0, col: 1 }, { row: 0, col: -1 }
            ];
            const bishopDirections = [
              { row: 1, col: 1 }, { row: 1, col: -1 },
              { row: -1, col: 1 }, { row: -1, col: -1 }
            ];
            const directions = [...rookDirections, ...bishopDirections];

            const canAttack = directions.some(dir => {
              for (let i = 1; i < 6; i++) {
                const newPos: Position = {
                  row: row + i * dir.row,
                  col: col + i * dir.col
                };

                if (!isValidPosition(newPos)) break;

                const targetPiece = board[newPos.row][newPos.col];
                if (targetPiece) {
                  if (targetPiece.type === PieceType.KING && targetPiece.color === currentPlayer) {
                    return true;
                  }
                  break;
                }
              }
              return false;
            });
            if (canAttack) attackingPieces.push({ row, col });
            break;
          }
          case PieceType.KING: {
            const kingMoves = [
              { row: 1, col: 0 }, { row: -1, col: 0 },
              { row: 0, col: 1 }, { row: 0, col: -1 },
              { row: 1, col: 1 }, { row: 1, col: -1 },
              { row: -1, col: 1 }, { row: -1, col: -1 }
            ];
            const canAttack = kingMoves.some(move => {
              const newPos: Position = {
                row: row + move.row,
                col: col + move.col
              };
              return isValidPosition(newPos) &&
                newPos.row === kingPosition!.row &&
                newPos.col === kingPosition!.col;
            });
            if (canAttack) attackingPieces.push({ row, col });
            break;
          }
        }
      }
    }
  }

  return attackingPieces;
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
const findBlockingPath = (from: Position, to: Position): Position[] => {
  const path: Position[] = [];
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  // Xác định hướng di chuyển
  const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
  const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);

  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    path.push({ row: currentRow, col: currentCol });
    currentRow += rowStep;
    currentCol += colStep;
  }

  return path;
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

// Get valid moves for a queen
const getValidQueenMoves = (gameState: GameState, position: Position): Position[] => {
  const rookMoves = getValidRookMoves(gameState, position);
  const bishopMoves = getValidBishopMoves(gameState, position);

  return [...rookMoves, ...bishopMoves];
};

const getValidKingMoves = (gameState: GameState, position: Position): Position[] => {
  const { board, currentPlayer } = gameState;
  const { row, col } = position;
  let validMoves: Position[] = [];

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

  // Bước 1: Thu thập tất cả các nước đi tiềm năng
  kingMoves.forEach(move => {
    const newPos: Position = { row: row + move.row, col: col + move.col };
    if (isValidPosition(newPos)) {
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece || targetPiece.color !== currentPlayer) {
        validMoves.push(newPos);
      }
    }
  });

  // Bước 2: Lọc bỏ các nước đi khiến vua bị chiếu
  validMoves = validMoves.filter(move => {
    // Tạo một bàn cờ tạm thời để thử nước đi
    const tempBoard = board.map(row => [...row]);

    // Di chuyển vua trên bàn cờ tạm thời
    tempBoard[move.row][move.col] = tempBoard[row][col];
    tempBoard[row][col] = null;

    // Kiểm tra xem vua có bị chiếu sau khi di chuyển không
    const opponentColor = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

    // Kiểm tra tất cả các quân của đối thủ
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const piece = tempBoard[r][c];
        if (piece && piece.color === opponentColor) {
          // Tạm thời thay đổi người chơi để kiểm tra nước đi của đối thủ
          const tempGameState = {
            ...gameState,
            board: tempBoard,
            currentPlayer: opponentColor
          };

          // Lấy tất cả nước đi hợp lệ của quân đối thủ
          const opponentMoves = getValidMovesForPiece(tempGameState, { row: r, col: c }, piece.type);

          // Nếu quân đối thủ có thể tấn công vị trí mới của vua, nước đi này không hợp lệ
          if (opponentMoves.some(m => m.row === move.row && m.col === move.col)) {
            return false;
          }
        }
      }
    }

    // Nếu không có quân cờ nào của đối thủ có thể tấn công vua, nước đi này hợp lệ
    return true;
  });

  return validMoves;
};
const getValidMovesForPiece = (gameState: GameState, position: Position, pieceType: PieceType): Position[] => {
  switch (pieceType) {
    case PieceType.PAWN:
      return getValidPawnMoves(gameState, position);
    case PieceType.ROOK:
      return getValidRookMoves(gameState, position);
    case PieceType.KNIGHT:
      return getValidKnightMoves(gameState, position);
    case PieceType.BISHOP:
      return getValidBishopMoves(gameState, position);
    case PieceType.QUEEN:
      return [...getValidRookMoves(gameState, position), ...getValidBishopMoves(gameState, position)];
    case PieceType.KING:
      // Đối với vua, chỉ kiểm tra các ô liền kề mà không kiểm tra lại việc chiếu
      // để tránh đệ quy vô hạn
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
    default:
      return [];
  }
};
// Hàm hỗ trợ để lấy tất cả các nước đi hợp lệ cho một quân cờ cụ thể
// Check if the current player's king is in check
// Check if the current player's king is in check
export const isKingInCheck = (gameState: GameState, playerToCheck?: PieceColor): boolean => {
  const { board } = gameState;
  // Sử dụng người chơi được chỉ định hoặc người chơi hiện tại
  const currentPlayer = playerToCheck || gameState.currentPlayer;

  // Tìm vị trí vua
  let kingPosition: Position | null = null;

  // Tìm vua của người chơi hiện tại
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
    console.error('Không tìm thấy vua');
    return false;
  }

  // Kiểm tra nếu bất kỳ quân cờ nào của đối thủ có thể tấn công vua
  const opponentColor = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  // Kiểm tra các quân tấn công theo từng loại quân
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        switch (piece.type) {
          case PieceType.PAWN: {
            const direction = opponentColor === PieceColor.WHITE ? 1 : -1;
            const capturePositions: Position[] = [
              { row: row + direction, col: col - 1 },
              { row: row + direction, col: col + 1 }
            ];
            if (capturePositions.some(pos =>
              pos.row === kingPosition!.row && pos.col === kingPosition!.col
            )) {
              return true;
            }
            break;
          }
          case PieceType.ROOK: {
            const directions = [
              { row: 1, col: 0 },  // Down
              { row: -1, col: 0 }, // Up
              { row: 0, col: 1 },  // Right
              { row: 0, col: -1 }   // Left
            ];
            const canAttack = directions.some(dir => {
              for (let i = 1; i < 6; i++) {
                const newPos: Position = {
                  row: row + i * dir.row,
                  col: col + i * dir.col
                };

                if (!isValidPosition(newPos)) break;

                const targetPiece = board[newPos.row][newPos.col];
                if (targetPiece) {
                  if (targetPiece.type === PieceType.KING && targetPiece.color === currentPlayer) {
                    return true;
                  }
                  break;
                }
              }
              return false;
            });
            if (canAttack) return true;
            break;
          }
          case PieceType.KNIGHT: {
            const knightMoves = [
              { row: 2, col: 1 }, { row: 2, col: -1 },
              { row: -2, col: 1 }, { row: -2, col: -1 },
              { row: 1, col: 2 }, { row: 1, col: -2 },
              { row: -1, col: 2 }, { row: -1, col: -2 }
            ];
            const canAttack = knightMoves.some(move => {
              const newPos: Position = {
                row: row + move.row,
                col: col + move.col
              };
              return isValidPosition(newPos) &&
                newPos.row === kingPosition!.row &&
                newPos.col === kingPosition!.col;
            });
            if (canAttack) return true;
            break;
          }
          case PieceType.BISHOP: {
            const directions = [
              { row: 1, col: 1 },  // Down-Right
              { row: 1, col: -1 }, // Down-Left
              { row: -1, col: 1 }, // Up-Right
              { row: -1, col: -1 }  // Up-Left
            ];
            const canAttack = directions.some(dir => {
              for (let i = 1; i < 6; i++) {
                const newPos: Position = {
                  row: row + i * dir.row,
                  col: col + i * dir.col
                };

                if (!isValidPosition(newPos)) break;

                const targetPiece = board[newPos.row][newPos.col];
                if (targetPiece) {
                  if (targetPiece.type === PieceType.KING && targetPiece.color === currentPlayer) {
                    return true;
                  }
                  break;
                }
              }
              return false;
            });
            if (canAttack) return true;
            break;
          }
          case PieceType.QUEEN: {
            const rookDirections = [
              { row: 1, col: 0 }, { row: -1, col: 0 },
              { row: 0, col: 1 }, { row: 0, col: -1 }
            ];
            const bishopDirections = [
              { row: 1, col: 1 }, { row: 1, col: -1 },
              { row: -1, col: 1 }, { row: -1, col: -1 }
            ];
            const directions = [...rookDirections, ...bishopDirections];

            const canAttack = directions.some(dir => {
              for (let i = 1; i < 6; i++) {
                const newPos: Position = {
                  row: row + i * dir.row,
                  col: col + i * dir.col
                };

                if (!isValidPosition(newPos)) break;

                const targetPiece = board[newPos.row][newPos.col];
                if (targetPiece) {
                  if (targetPiece.type === PieceType.KING && targetPiece.color === currentPlayer) {
                    return true;
                  }
                  break;
                }
              }
              return false;
            });
            if (canAttack) return true;
            break;
          }
          case PieceType.KING: {
            const kingMoves = [
              { row: 1, col: 0 }, { row: -1, col: 0 },
              { row: 0, col: 1 }, { row: 0, col: -1 },
              { row: 1, col: 1 }, { row: 1, col: -1 },
              { row: -1, col: 1 }, { row: -1, col: -1 }
            ];
            const canAttack = kingMoves.some(move => {
              const newPos: Position = {
                row: row + move.row,
                col: col + move.col
              };
              return isValidPosition(newPos) &&
                newPos.row === kingPosition!.row &&
                newPos.col === kingPosition!.col;
            });
            if (canAttack) return true;
            break;
          }
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
    console.error('Không tìm thấy vua trong kiểm tra chiếu hết');
    return false;
  }

  // 1. Kiểm tra xem vua có thể di chuyển để thoát khỏi chiếu không
  const kingValidMoves = getValidMoves(gameState, kingPosition);
  for (const move of kingValidMoves) {
    // Tạo một bàn cờ tạm thời để thử nước đi
    const tempBoard = board.map(row => [...row]);
    const piece = tempBoard[kingPosition.row][kingPosition.col];

    // Di chuyển vua
    tempBoard[move.row][move.col] = piece;
    tempBoard[kingPosition.row][kingPosition.col] = null;

    // Kiểm tra xem vua còn bị chiếu không sau nước đi này
    const tempGameState = { ...gameState, board: tempBoard };
    const kingStillInCheck = isKingInCheck(tempGameState, currentPlayer);

    if (!kingStillInCheck) {
      // Nếu có bất kỳ nước đi nào thoát chiếu, thì không phải chiếu hết
      return false;
    }
  }

  // 2. Kiểm tra xem bất kỳ quân cờ nào khác có thể chặn chiếu hoặc bắt quân đang tấn công không
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer && piece.type !== PieceType.KING) {
        const position: Position = { row, col };
        const validMoves = getValidMoves(gameState, position);

        // Với mỗi nước đi hợp lệ, mô phỏng nước đi và kiểm tra xem nó có thoát chiếu không
        for (const move of validMoves) {
          // Tạo một bàn cờ tạm thời để thử nước đi
          const tempBoard = board.map(row => [...row]);
          const movingPiece = tempBoard[position.row][position.col];

          // Di chuyển quân cờ
          tempBoard[move.row][move.col] = movingPiece;
          tempBoard[position.row][position.col] = null;

          // Kiểm tra xem vua còn bị chiếu không sau nước đi này
          const tempGameState = { ...gameState, board: tempBoard };
          const kingStillInCheck = isKingInCheck(tempGameState, currentPlayer);

          if (!kingStillInCheck) {
            // Nếu có bất kỳ nước đi nào thoát chiếu, thì không phải chiếu hết
            return false;
          }
        }
      }
    }
  }

  // 3. Kiểm tra xem có bất kỳ quân cờ nào trong ngân hàng quân cờ có thể giúp thoát chiếu không
  const pieceBank = gameState.pieceBank[currentPlayer];
  if (pieceBank.length > 0) {
    for (const piece of pieceBank) {
      const validDropSquares = getValidDropSquares(gameState, piece);

      for (const dropPosition of validDropSquares) {
        // Tạo một bàn cờ tạm thời để thử thả quân
        const tempBoard = board.map(row => [...row]);
        tempBoard[dropPosition.row][dropPosition.col] = piece;

        // Kiểm tra xem vua còn bị chiếu không sau khi thả
        const tempGameState = { ...gameState, board: tempBoard };
        const kingStillInCheck = isKingInCheck(tempGameState, currentPlayer);

        if (!kingStillInCheck) {
          // Nếu có bất kỳ việc thả nào thoát chiếu, thì không phải chiếu hết
          return false;
        }
      }
    }
  }

  // Nếu không có nước đi hoặc thả nào thoát chiếu, thì đó là chiếu hết
  console.log("PHÁT HIỆN CHIẾU HẾT cho người chơi:", currentPlayer);
  return true;
};
export const getValidMovesWhenInCheck = (gameState: GameState, position: Position): Position[] => {
  // Nếu không bị chiếu, trả về nước đi bình thường
  if (!isKingInCheck(gameState)) {
    return getValidMoves(gameState, position);
  }

  const { board, currentPlayer } = gameState;
  const piece = board[position.row][position.col];

  // Chỉ xử lý các quân của người chơi hiện tại
  if (!piece || piece.color !== currentPlayer) {
    return [];
  }

  // Lấy các quân đang tấn công vua
  const attackingPieces = getAttackingPieces(gameState);

  // Nếu nhiều hơn 1 quân tấn công, chỉ vua mới có thể di chuyển
  if (attackingPieces.length > 1 && piece.type !== PieceType.KING) {
    return [];
  }

  // Nếu có 1 quân tấn công
  if (attackingPieces.length === 1) {
    const attackingPiecePos = attackingPieces[0];
    const attackingPiece = board[attackingPiecePos.row][attackingPiecePos.col];

    // Tìm vị trí vua
    const kingPos = findKingPosition(board, currentPlayer);
    if (!kingPos) {
      console.error('Không tìm thấy vua');
      return [];
    }

    // Nếu là vua
    if (piece.type === PieceType.KING) {
      // Lấy nước đi bình thường
      let validMoves = getValidMoves(gameState, position);

      // Lọc các nước đi để tránh bị chiếu
      validMoves = validMoves.filter(move => {
        const tempBoard = board.map(row => [...row]);
        tempBoard[move.row][move.col] = piece;
        tempBoard[position.row][position.col] = null;

        const tempGameState = {
          ...gameState,
          board: tempBoard
        };

        return !isKingInCheck(tempGameState);
      });

      return validMoves;
    } else {
      // Lấy nước đi bình thường
      let validMoves = getValidMoves(gameState, position);

      // Kiểm tra từng nước đi
      const allowedMoves = validMoves.filter(move => {
        // Nếu ăn được quân tấn công
        if (move.row === attackingPiecePos.row && move.col === attackingPiecePos.col) {
          return true;
        }

        // Kiểm tra chặn đường tấn công (chỉ áp dụng với Rook, Bishop, Queen)
        if ([PieceType.ROOK, PieceType.BISHOP, PieceType.QUEEN].includes(attackingPiece!.type)) {
          // Tìm đường thẳng từ quân tấn công đến vua
          const blockingPath = findBlockingPath(attackingPiecePos, kingPos);

          // Kiểm tra nước đi có nằm trên đường chặn không
          const isOnBlockingPath = blockingPath.some(pos =>
            pos.row === move.row && pos.col === move.col
          );

          // Nếu không phải quân Knight và nằm trên đường chặn
          if (piece.type !== PieceType.KNIGHT && isOnBlockingPath) {
            // Tạo bàn cờ tạm để kiểm tra xem nước đi có giải cứu vua không
            const tempBoard = board.map(row => [...row]);
            const movingPiece = tempBoard[position.row][position.col];

            // Di chuyển quân cờ
            tempBoard[move.row][move.col] = movingPiece;
            tempBoard[position.row][position.col] = null;

            const tempGameState = { ...gameState, board: tempBoard };

            // Kiểm tra xem vua còn bị chiếu không
            return !isKingInCheck(tempGameState);
          }
        }

        // Đối với Knight và các quân khác, chỉ được ăn quân tấn công
        return false;
      });

      return allowedMoves;
    }
  }

  // Trường hợp không bị chiếu, trả về nước đi bình thường
  return getValidMoves(gameState, position);
};
// Hàm hỗ trợ tìm vị trí vua
const findKingPosition = (board: (ChessPiece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const piece = board[row][col];
      if (piece?.type === PieceType.KING && piece?.color === color) {
        return { row, col };
      }
    }
  }
  return null;
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

  // Update game state with fresh values for check flags
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
    isCheck: false,       // Reset
    isCheckmate: false,   // Reset
    isStalemate: false    // Reset
  };

  // Check if the opponent (new current player) is now in check
  console.log(`Kiểm tra xem người chơi ${nextPlayer} có bị chiếu sau khi thả quân không`);
  const isCheck = isKingInCheck(newState);
  newState.isCheck = isCheck;

  // If in check, check for checkmate
  if (isCheck) {
    console.log(`Người chơi ${nextPlayer} bị chiếu sau khi thả quân, kiểm tra chiếu hết...`);
    const isCheckmate = checkIfCheckmate(newState);
    newState.isCheckmate = isCheckmate;

    if (isCheckmate) {
      console.log(`CHIẾU HẾT! Người chơi ${currentPlayer} thắng bằng cách thả quân!`);
    }
  } else {
    // Check for stalemate if not in check
    const isStalemate = checkIfStalemate(newState);
    newState.isStalemate = isStalemate;

    if (isStalemate) {
      console.log(`HÒA CỜ! Không còn nước đi hợp lệ`);
    }
  }

  return newState;
};