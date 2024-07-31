const boardElement = document.getElementById('chessboard');

const initialBoardSetup = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

const pieceSymbols = {
    "r": "♜", "n": "♞", "b": "♝", "q": "♛", "k": "♚", "p": "♟",
    "R": "♖", "N": "♘", "B": "♗", "Q": "♕", "K": "♔", "P": "♙"
};

let boardState = initialBoardSetup.map(row => row.slice());
let whiteTurn = true;
let selectedPiece = null;
let enPassantTarget = null;

function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = boardState[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                pieceElement.textContent = pieceSymbols[piece];
                pieceElement.dataset.piece = piece;
                pieceElement.dataset.row = row;
                pieceElement.dataset.col = col;
                square.appendChild(pieceElement);
            }

            square.addEventListener('click', onSquareClick);
            boardElement.appendChild(square);
        }
    }
}

function onSquareClick(event) {
    const targetSquare = event.currentTarget;
    const pieceElement = targetSquare.querySelector('.piece');
    const toRow = parseInt(targetSquare.dataset.row);
    const toCol = parseInt(targetSquare.dataset.col);

    if (selectedPiece) {
        const fromRow = parseInt(selectedPiece.dataset.row);
        const fromCol = parseInt(selectedPiece.dataset.col);
        const piece = selectedPiece.dataset.piece;

        if (isValidMove(fromRow, fromCol, toRow, toCol, piece)) {
            movePiece(fromRow, fromCol, toRow, toCol, piece);
            whiteTurn = !whiteTurn;
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            createBoard();
        } else {
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        }
    } else if (pieceElement && ((whiteTurn && pieceElement.dataset.piece === pieceElement.dataset.piece.toUpperCase()) || (!whiteTurn && pieceElement.dataset.piece === pieceElement.dataset.piece.toLowerCase()))) {
        selectedPiece = pieceElement;
        pieceElement.classList.add('selected');
    }
}

function movePiece(fromRow, fromCol, toRow, toCol, piece) {
    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = "";
    if (piece.toLowerCase() === 'p') {
        if (Math.abs(toRow - fromRow) === 2) {
            enPassantTarget = { row: toRow, col: toCol };
        } else {
            enPassantTarget = null;
        }
        if (enPassantTarget && enPassantTarget.row === toRow && enPassantTarget.col === toCol && boardState[toRow + (whiteTurn ? 1 : -1)][toCol].toLowerCase() === 'p') {
            boardState[toRow + (whiteTurn ? 1 : -1)][toCol] = "";
        }
    } else {
        enPassantTarget = null;
    }
    if (piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
        if (toCol > fromCol) {
            boardState[toRow][toCol - 1] = boardState[toRow][7];
            boardState[toRow][7] = "";
        } else {
            boardState[toRow][toCol + 1] = boardState[toRow][0];
            boardState[toRow][0] = "";
        }
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol, piece) {
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    if (boardState[toRow][toCol] && (isWhite ? boardState[toRow][toCol] === boardState[toRow][toCol].toUpperCase() : boardState[toRow][toCol] === boardState[toRow][toCol].toLowerCase())) {
        return false;
    }

    switch (pieceType) {
        case 'p': // Pawn
            if (isWhite) {
                if (fromRow === 6 && rowDiff === -2 && colDiff === 0 && isSquareEmpty(toRow, toCol) && isSquareEmpty(toRow + 1, toCol)) return true; // Initial double move
                if (rowDiff === -1 && colDiff === 0 && isSquareEmpty(toRow, toCol)) return true; // Single move
                if (rowDiff === -1 && Math.abs(colDiff) === 1 && (isSquareEnemy(toRow, toCol, isWhite) || (enPassantTarget && enPassantTarget.row === toRow && enPassantTarget.col === toCol))) return true; // Capture
            } else {
                if (fromRow === 1 && rowDiff === 2 && colDiff === 0 && isSquareEmpty(toRow, toCol) && isSquareEmpty(toRow - 1, toCol)) return true; // Initial double move
                if (rowDiff === 1 && colDiff === 0 && isSquareEmpty(toRow, toCol)) return true; // Single move
                if (rowDiff === 1 && Math.abs(colDiff) === 1 && (isSquareEnemy(toRow, toCol, isWhite) || (enPassantTarget && enPassantTarget.row === toRow && enPassantTarget.col === toCol))) return true; // Capture
            }
            break;
        case 'r': // Rook
            if (rowDiff === 0 || colDiff === 0) {
                if (isPathClear(fromRow, fromCol, toRow, toCol)) return true;
            }
            break;
        case 'n': // Knight
            if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) return true;
            if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2) return true;
            break;
        case 'b': // Bishop
            if (Math.abs(rowDiff) === Math.abs(colDiff)) {
                if (isPathClear(fromRow, fromCol, toRow, toCol)) return true;
            }
            break;
        case 'q': // Queen
            if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
                if (isPathClear(fromRow, fromCol, toRow, toCol)) return true;
            }
            break;
        case 'k': // King
            if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) return true;
            if (isWhite && fromRow === 7 && fromCol === 4 && toRow === 7 && (toCol === 6 || toCol === 2) && isPathClear(fromRow, fromCol, toRow, toCol)) return true; // Castling
            if (!isWhite && fromRow === 0 && fromCol === 4 && toRow === 0 && (toCol === 6 || toCol === 2) && isPathClear(fromRow, fromCol, toRow, toCol)) return true; // Castling
            break;
    }

    return false;
}

function isSquareEmpty(row, col) {
    return boardState[row][col] === "";
}

function isSquareEnemy(row, col, isWhite) {
    const piece = boardState[row][col];
    return piece && (isWhite ? piece === piece.toLowerCase() : piece === piece.toUpperCase());
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (!isSquareEmpty(currentRow, currentCol)) return false;
        currentRow += rowStep;
        currentCol += colStep;
    }
    return true;
}

createBoard();
