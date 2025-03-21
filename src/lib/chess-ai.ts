import {
    GameState,
    PieceColor,
    PieceType,
    ChessPiece,
    Position
} from '@/lib/chess-models';
import {
    getValidMoves,
    makeMove,
    dropPiece,
    getValidDropSquares,
    isKingInCheck,
    checkIfCheckmate
} from '@/lib/chess-logic';

// Điểm số của các loại quân (phù hợp với bàn cờ 6x6)
const PIECE_SCORES: Record<PieceType, number> = {
    [PieceType.KING]: 0,    // Không thể để mất
    [PieceType.QUEEN]: 9,   // Quân quan trọng nhất
    [PieceType.ROOK]: 5,
    [PieceType.BISHOP]: 3,
    [PieceType.KNIGHT]: 3,
    [PieceType.PAWN]: 1     // Quân ít giá trị nhất
};

// Điểm vị trí cho quân Mã
const KNIGHT_SCORES = [
    [0.0, 0.1, 0.2, 0.2, 0.2, 0.2],
    [0.1, 0.3, 0.5, 0.5, 0.5, 0.5],
    [0.2, 0.5, 0.6, 0.65, 0.65, 0.6],
    [0.2, 0.55, 0.65, 0.7, 0.7, 0.65],
    [0.2, 0.5, 0.65, 0.7, 0.7, 0.65],
    [0.0, 0.1, 0.2, 0.2, 0.2, 0.2]
];

// Điểm vị trí cho quân Tượng
const BISHOP_SCORES = [
    [0.0, 0.2, 0.2, 0.2, 0.2, 0.2],
    [0.2, 0.4, 0.4, 0.4, 0.4, 0.4],
    [0.2, 0.4, 0.5, 0.6, 0.6, 0.5],
    [0.2, 0.5, 0.5, 0.6, 0.6, 0.5],
    [0.2, 0.4, 0.6, 0.6, 0.6, 0.6],
    [0.0, 0.2, 0.2, 0.2, 0.2, 0.2]
];

const CHECKMATE_SCORE = 10000;
const STALEMATE_SCORE = 0;
const DEFAULT_DEPTH = 3;

interface AIMove {
    from?: Position;
    to: Position;
    piece?: ChessPiece;
    score: number;
}

export class ChessAI {
    private evaluateBoard(gameState: GameState): number {
        if (gameState.isCheckmate) {
            return gameState.currentPlayer === PieceColor.WHITE
                ? -CHECKMATE_SCORE
                : CHECKMATE_SCORE;
        }

        if (gameState.isStalemate) {
            return STALEMATE_SCORE;
        }

        let score = 0;
        const board = gameState.board;

        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const piece = board[row][col];
                if (piece) {
                    // Điểm số của quân cờ
                    const pieceScore = PIECE_SCORES[piece.type];

                    // Điểm vị trí của quân cờ
                    let positionScore = 0;
                    const key = `${piece.color === PieceColor.WHITE ? 'w' : 'b'}${piece.type.charAt(0).toUpperCase()}`;

                    switch (piece.type) {
                        case PieceType.KNIGHT:
                            positionScore = KNIGHT_SCORES[row][col];
                            break;
                        case PieceType.BISHOP:
                            positionScore = BISHOP_SCORES[row][col];
                            break;
                    }

                    // Điều chỉnh điểm số theo màu
                    score += piece.color === PieceColor.WHITE
                        ? (pieceScore + positionScore)
                        : -(pieceScore + positionScore);
                }
            }
        }

        // Thêm điểm cho quân trong piece bank
        gameState.pieceBank[PieceColor.WHITE].forEach(piece => {
            score += PIECE_SCORES[piece.type];
        });
        gameState.pieceBank[PieceColor.BLACK].forEach(piece => {
            score -= PIECE_SCORES[piece.type];
        });

        return score;
    }

    private minimax(
        gameState: GameState,
        depth: number,
        alpha: number,
        beta: number,
        maximizingPlayer: boolean
    ): number {
        if (depth === 0 || gameState.isCheckmate || gameState.isStalemate) {
            return this.evaluateBoard(gameState);
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            const moves = this.getAllValidMoves(gameState, gameState.currentPlayer);

            for (const move of moves) {
                const newState = this.applyMove(gameState, move);
                const evaluation = this.minimax(
                    newState,
                    depth - 1,
                    alpha,
                    beta,
                    false
                );

                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);

                if (beta <= alpha) {
                    break; // Beta cut-off
                }
            }

            return maxEval;
        } else {
            let minEval = Infinity;
            const moves = this.getAllValidMoves(gameState, gameState.currentPlayer);

            for (const move of moves) {
                const newState = this.applyMove(gameState, move);
                const evaluation = this.minimax(
                    newState,
                    depth - 1,
                    alpha,
                    beta,
                    true
                );

                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);

                if (beta <= alpha) {
                    break; // Alpha cut-off
                }
            }

            return minEval;
        }
    }

    private getAllValidMoves(gameState: GameState, color: PieceColor): AIMove[] {
        const moves: AIMove[] = [];

        // Kiểm tra nước đi của các quân trên bàn
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = getValidMoves(gameState, { row, col });
                    validMoves.forEach(move => {
                        moves.push({
                            from: { row, col },
                            to: move,
                            piece,
                            score: 0
                        });
                    });
                }
            }
        }

        // Kiểm tra nước thả quân từ piece bank
        const pieceBankMoves = gameState.pieceBank[color];
        pieceBankMoves.forEach(piece => {
            const validDropSquares = getValidDropSquares(gameState, piece);
            validDropSquares.forEach(square => {
                moves.push({
                    to: square,
                    piece,
                    score: 0
                });
            });
        });

        return moves;
    }

    private applyMove(gameState: GameState, move: AIMove): GameState {
        if (move.from) {
            // Nước đi di chuyển quân
            return makeMove(gameState, move.from, move.to);
        } else if (move.piece) {
            // Nước thả quân từ piece bank
            return dropPiece(gameState, move.piece, move.to);
        }

        // Nếu không có nước đi hợp lệ, trả về trạng thái ban đầu
        return gameState;
    }

    findBestMove(gameState: GameState): AIMove | null {
        console.log("AI đang tìm nước đi tốt nhất...");
        const currentColor = gameState.currentPlayer;
        console.log("Màu hiện tại:", currentColor);

        const moves = this.getAllValidMoves(gameState, currentColor);
        console.log("Số nước đi hợp lệ tìm thấy:", moves.length);

        if (moves.length === 0) {
            console.log("Không có nước đi hợp lệ");
            return null;
        }
        let bestMove: AIMove | null = null;
        let bestScore = currentColor === PieceColor.WHITE ? -Infinity : Infinity;

        for (const move of moves) {
            const newState = this.applyMove(gameState, move);
            const score = this.minimax(
                newState,
                DEFAULT_DEPTH,
                -Infinity,
                Infinity,
                currentColor === PieceColor.BLACK
            );

            if (currentColor === PieceColor.WHITE) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        return bestMove;
    }
}

export default ChessAI;