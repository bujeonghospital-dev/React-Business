/**
 * Thai Checkers Online Game
 * หมากฮอสออนไลน์ - JavaScript Module
 */

// ===== Firebase Configuration =====
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBxrYENEgtT36nuy5csCfwITZqD__4W9Ns",
  authDomain: "thanakon-dev.firebaseapp.com",
  databaseURL:
    "https://thanakon-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thanakon-dev",
  storageBucket: "thanakon-dev.firebasestorage.app",
  messagingSenderId: "882525844582",
  appId: "1:882525844582:web:08a55ec4686cc9f8bde9a7",
  measurementId: "G-6B2QVCSSHH",
};

// ===== Game Class =====
class ThaiCheckersGame {
  constructor() {
    // Game state
    this.board = [];
    this.selected = null;
    this.currentPlayer = 1;
    this.playerName = "";
    this.opponentName = "";
    this.roomCode = "";
    this.isHost = false;
    this.gameStarted = false;
    this.myPlayerNumber = 0;
    this.roomRef = null;
    this.listeners = [];
    this.database = null;

    // Initialize Firebase
    this.initFirebase();

    // Bind methods
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.copyRoomCode = this.copyRoomCode.bind(this);
  }

  // ===== Firebase Methods =====
  initFirebase() {
    try {
      if (typeof firebase !== "undefined") {
        firebase.initializeApp(FIREBASE_CONFIG);
        this.database = firebase.database();
        console.log("Firebase initialized successfully");
      } else {
        console.error("Firebase SDK not loaded");
        this.showError("ไม่สามารถโหลด Firebase SDK ได้");
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
      this.showError("ไม่สามารถเชื่อมต่อ Firebase ได้");
    }
  }

  // ===== Board Methods =====
  initBoardData() {
    const data = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Only dark squares (row + col) % 2 === 0 are playable
        if ((row + col) % 2 === 0) {
          if (row < 3) {
            data[row][col] = { player: 2, king: false };
          } else if (row > 4) {
            data[row][col] = { player: 1, king: false };
          }
        }
      }
    }

    return data;
  }

  renderBoard() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.createSquareElement(row, col);
        boardElement.appendChild(square);
      }
    }

    this.updateTurnIndicator();
  }

  createSquareElement(row, col) {
    const square = document.createElement("div");
    const isDark = (row + col) % 2 === 0;
    square.className = `square ${isDark ? "dark" : "light"}`;
    square.dataset.row = row;
    square.dataset.col = col;

    const piece = this.board?.[row]?.[col];
    if (piece) {
      const pieceElement = document.createElement("div");
      pieceElement.className = `piece player${piece.player}`;
      if (piece.king) {
        pieceElement.classList.add("king");
      }
      square.appendChild(pieceElement);
    }

    square.onclick = () => this.handleSquareClick(row, col);

    return square;
  }

  // ===== Game Logic =====
  handleSquareClick(row, col) {
    if (!this.gameStarted || this.currentPlayer !== this.myPlayerNumber) {
      return;
    }

    const piece = this.board[row][col];

    if (!this.selected) {
      // Select piece
      if (piece && piece.player === this.currentPlayer) {
        this.selectSquare(row, col);
      }
    } else {
      // Try to move
      const validMoves = this.getValidMoves(
        this.selected.row,
        this.selected.col
      );
      const move = validMoves.find((m) => m.row === row && m.col === col);

      if (move) {
        this.makeMove(
          this.selected.row,
          this.selected.col,
          row,
          col,
          move.captures
        );
        this.sendMoveToFirebase(
          this.selected.row,
          this.selected.col,
          row,
          col,
          move.captures
        );
        this.clearSelection();
      } else {
        // Reselect
        this.clearSelection();
        if (piece && piece.player === this.currentPlayer) {
          this.selectSquare(row, col);
        }
      }
    }
  }

  selectSquare(row, col) {
    this.selected = { row, col };

    // Clear previous highlights
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "valid-move");
    });

    // Highlight selected square
    const selectedSquare = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (selectedSquare) {
      selectedSquare.classList.add("selected");
    }

    // Highlight valid moves
    const validMoves = this.getValidMoves(row, col);
    for (const move of validMoves) {
      const targetSquare = document.querySelector(
        `[data-row="${move.row}"][data-col="${move.col}"]`
      );
      if (targetSquare) {
        targetSquare.classList.add("valid-move");
      }
    }
  }

  clearSelection() {
    this.selected = null;
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "valid-move");
    });
  }

  getValidMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    // Determine movement directions
    const directions = this.getMovementDirections(piece);

    // Check for captures first (mandatory in checkers)
    const captures = this.findCaptureMoves(row, col, directions);
    if (captures.length > 0) {
      return captures;
    }

    // Normal moves (only if no captures available)
    return this.findNormalMoves(row, col, directions);
  }

  getMovementDirections(piece) {
    if (piece.king) {
      // King can move in all 4 diagonal directions
      return [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
    } else if (piece.player === 1) {
      // Player 1 moves up
      return [
        [-1, -1],
        [-1, 1],
      ];
    } else {
      // Player 2 moves down
      return [
        [1, -1],
        [1, 1],
      ];
    }
  }

  findCaptureMoves(row, col, directions) {
    const captures = [];

    for (const [dRow, dCol] of directions) {
      const capture = this.checkCapture(row, col, dRow, dCol);
      if (capture) {
        captures.push(capture);
      }
    }

    return captures;
  }

  findNormalMoves(row, col, directions) {
    const moves = [];

    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol, captures: [] });
      }
    }

    return moves;
  }

  checkCapture(row, col, dRow, dCol) {
    const enemyRow = row + dRow;
    const enemyCol = col + dCol;
    const landRow = row + dRow * 2;
    const landCol = col + dCol * 2;

    const piece = this.board[row][col];

    if (
      this.isValidPosition(enemyRow, enemyCol) &&
      this.isValidPosition(landRow, landCol)
    ) {
      const enemyPiece = this.board[enemyRow][enemyCol];
      const landingSpot = this.board[landRow][landCol];

      if (enemyPiece && enemyPiece.player !== piece.player && !landingSpot) {
        return {
          row: landRow,
          col: landCol,
          captures: [{ row: enemyRow, col: enemyCol }],
        };
      }
    }

    return null;
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  makeMove(fromRow, fromCol, toRow, toCol, captures) {
    const piece = this.board[fromRow][fromCol];

    // Move piece
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Remove captured pieces
    captures.forEach((capture) => {
      this.board[capture.row][capture.col] = null;
    });

    // Check for king promotion
    if (
      (piece.player === 1 && toRow === 0) ||
      (piece.player === 2 && toRow === 7)
    ) {
      piece.king = true;
    }

    // Render board
    this.renderBoard();

    // Check for win
    if (this.checkWinCondition()) {
      this.showWinner();
      return;
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateTurnIndicator();
  }

  checkWinCondition() {
    let player1Count = 0;
    let player2Count = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          if (piece.player === 1) player1Count++;
          else player2Count++;
        }
      }
    }

    return player1Count === 0 || player2Count === 0;
  }

  // ===== Room Management =====
  generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
  }

  async createRoom() {
    if (!this.database) {
      this.showError("ไม่สามารถเชื่อมต่อ Firebase ได้");
      return;
    }

    this.playerName = document.getElementById("playerName").value.trim();
    if (!this.playerName) {
      alert("กรุณาใส่ชื่อผู้เล่น");
      return;
    }

    document.getElementById("createBtn").disabled = true;

    // Generate unique room code
    let code;
    let attempts = 0;

    do {
      code = this.generateRoomCode();
      const snapshot = await this.database.ref(`rooms/${code}`).once("value");
      if (!snapshot.exists()) break;
      attempts++;
    } while (attempts < 10);

    this.roomCode = code;
    this.isHost = true;
    this.myPlayerNumber = 1;
    this.roomRef = this.database.ref(`rooms/${this.roomCode}`);

    // Create room data
    const roomData = {
      host: this.playerName,
      guest: null,
      board: this.initBoardData(),
      currentPlayer: 1,
      lastMove: null,
      created: firebase.database.ServerValue.TIMESTAMP,
    };

    await this.roomRef.set(roomData);
    this.setupGame();
    this.listenForOpponent();
  }

  async joinRoom() {
    if (!this.database) {
      this.showError("ไม่สามารถเชื่อมต่อ Firebase ได้");
      return;
    }

    this.playerName = document.getElementById("playerName").value.trim();
    this.roomCode = document
      .getElementById("roomCode")
      .value.trim()
      .toUpperCase();

    if (!this.playerName) {
      alert("กรุณาใส่ชื่อผู้เล่น");
      return;
    }

    if (!this.roomCode) {
      alert("กรุณาใส่รหัสห้อง");
      return;
    }

    document.getElementById("joinBtn").disabled = true;

    this.roomRef = this.database.ref(`rooms/${this.roomCode}`);
    const snapshot = await this.roomRef.once("value");

    if (!snapshot.exists()) {
      alert("ไม่พบห้อง");
      document.getElementById("joinBtn").disabled = false;
      return;
    }

    const roomData = snapshot.val();
    if (roomData.guest) {
      alert("ห้องเต็มแล้ว");
      document.getElementById("joinBtn").disabled = false;
      return;
    }

    this.isHost = false;
    this.myPlayerNumber = 2;

    await this.roomRef.update({ guest: this.playerName });
    this.setupGame();
    this.listenForGameUpdates();
  }

  setupGame() {
    // Switch screens
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    if (this.isHost) {
      document.getElementById("player1Name").textContent = this.playerName;
      document.getElementById("roomCodeDisplay").style.display = "inline-block";
      document.getElementById("roomCodeText").textContent = this.roomCode;

      // Host loads initial board state
      this.roomRef.once("value").then((snapshot) => {
        const data = snapshot.val();
        this.board = data.board;
        this.currentPlayer = data.currentPlayer || 1;
        this.renderBoard();
        this.gameStarted = true;
        this.updateTurnIndicator();
      });
    } else {
      document.getElementById("player2Name").textContent = this.playerName;

      // Guest loads room state
      this.roomRef.once("value").then((snapshot) => {
        const data = snapshot.val();
        document.getElementById("player1Name").textContent = data.host;
        this.opponentName = data.host;
        this.board = data.board;
        this.currentPlayer = data.currentPlayer;
        this.renderBoard();
        this.gameStarted = true;
        this.updateTurnIndicator();
      });
    }
  }

  listenForOpponent() {
    const listener = this.roomRef.child("guest").on("value", (snapshot) => {
      const guest = snapshot.val();

      if (guest && !this.gameStarted) {
        this.opponentName = guest;
        document.getElementById("player2Name").textContent = guest;

        const statusElement = document.getElementById("connectionStatus");
        statusElement.textContent = "เชื่อมต่อแล้ว! / Connected!";
        statusElement.className = "status-connected";

        this.gameStarted = true;
        this.updateTurnIndicator();
        this.listenForGameUpdates();
      }
    });

    this.listeners.push(() =>
      this.roomRef.child("guest").off("value", listener)
    );
  }

  listenForGameUpdates() {
    // Listen for board updates
    const boardListener = this.roomRef
      .child("board")
      .on("value", (snapshot) => {
        const boardData = snapshot.val();

        if (
          boardData &&
          JSON.stringify(boardData) !== JSON.stringify(this.board)
        ) {
          this.board = boardData;
          this.renderBoard();
        }
      });

    this.listeners.push(() =>
      this.roomRef.child("board").off("value", boardListener)
    );

    // Listen for turn updates
    const turnListener = this.roomRef
      .child("currentPlayer")
      .on("value", (snapshot) => {
        const player = snapshot.val();

        if (player !== null) {
          this.currentPlayer = player;
          this.updateTurnIndicator();
        }
      });

    this.listeners.push(() =>
      this.roomRef.child("currentPlayer").off("value", turnListener)
    );

    // Listen for disconnection
    const playerKey = this.isHost ? "guest" : "host";
    const disconnectListener = this.roomRef
      .child(playerKey)
      .on("value", (snapshot) => {
        if (!snapshot.val()) {
          const statusElement = document.getElementById("connectionStatus");
          statusElement.textContent =
            "คู่ต่อสู้ออกจากเกม / Opponent disconnected";
          statusElement.className = "status-disconnected";
          this.gameStarted = false;
        }
      });

    this.listeners.push(() =>
      this.roomRef.child(playerKey).off("value", disconnectListener)
    );
  }

  async sendMoveToFirebase(fromRow, fromCol, toRow, toCol, captures) {
    if (!this.roomRef) return;

    try {
      await this.roomRef.update({
        board: this.board,
        currentPlayer: this.currentPlayer,
        lastMove: {
          from: { row: fromRow, col: fromCol },
          to: { row: toRow, col: toCol },
          captures: captures,
          player: this.myPlayerNumber,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        },
      });
    } catch (error) {
      console.error("Error sending move:", error);
      this.showError("ไม่สามารถส่งการเคลื่อนไหวได้");
    }
  }

  // ===== UI Methods =====
  updateTurnIndicator() {
    const player1Info = document.getElementById("player1Info");
    const player2Info = document.getElementById("player2Info");

    if (player1Info && player2Info) {
      player1Info.classList.toggle("current-turn", this.currentPlayer === 1);
      player2Info.classList.toggle("current-turn", this.currentPlayer === 2);
    }

    if (this.gameStarted) {
      const statusElement = document.getElementById("connectionStatus");

      if (this.currentPlayer === this.myPlayerNumber) {
        statusElement.textContent = "ตาของคุณ! / Your turn!";
        statusElement.className = "status-connected";
      } else {
        statusElement.textContent = "รอคู่ต่อสู้... / Opponent's turn...";
        statusElement.className = "status-waiting";
      }
    }
  }

  showWinner() {
    const winnerName =
      this.currentPlayer === 1
        ? this.myPlayerNumber === 1
          ? this.opponentName
          : this.playerName
        : this.myPlayerNumber === 1
        ? this.playerName
        : this.opponentName;

    document.getElementById(
      "winnerText"
    ).textContent = `🎉 ${winnerName} ชนะ! 🎉`;
    document.getElementById("winScreen").style.display = "grid";
  }

  showError(message) {
    alert(message);
  }

  copyRoomCode() {
    const code = document.getElementById("roomCodeText").textContent;

    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        const roomElement = document.getElementById("roomCodeDisplay");
        roomElement.classList.add("copied");
        setTimeout(() => roomElement.classList.remove("copied"), 300);

        const statusElement = document.getElementById("connectionStatus");
        const previousText = statusElement.textContent;
        statusElement.textContent = "คัดลอกรหัสห้องแล้ว! / Room code copied!";

        setTimeout(() => {
          statusElement.textContent = previousText;
        }, 1600);
      })
      .catch((error) => {
        console.error("Failed to copy room code:", error);
      });
  }

  // ===== Game Reset =====
  async resetGame() {
    // Clean up listeners
    this.listeners.forEach((cleanup) => cleanup());
    this.listeners = [];

    // Remove room from Firebase if host
    if (this.isHost && this.roomRef) {
      try {
        await this.roomRef.remove();
      } catch (error) {
        console.error("Error removing room:", error);
      }
    }

    // Reset state
    this.board = [];
    this.selected = null;
    this.currentPlayer = 1;
    this.gameStarted = false;
    this.roomRef = null;
    this.playerName = "";
    this.opponentName = "";
    this.roomCode = "";
    this.isHost = false;
    this.myPlayerNumber = 0;

    // Reset UI
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("createBtn").disabled = false;
    document.getElementById("joinBtn").disabled = false;
    document.getElementById("playerName").value = "";
    document.getElementById("roomCode").value = "";
  }

  // ===== Cleanup Methods =====
  async cleanupOnUnload() {
    if (this.roomRef) {
      try {
        if (this.isHost) {
          await this.roomRef.remove();
        } else {
          await this.roomRef.child("guest").remove();
        }
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    }
  }

  async cleanOldRooms() {
    if (!this.database) return;

    try {
      const roomsRef = this.database.ref("rooms");
      const snapshot = await roomsRef.once("value");
      const rooms = snapshot.val();

      if (rooms) {
        const now = Date.now();
        const oneHour = 3600 * 1000;

        for (const roomKey of Object.keys(rooms)) {
          const room = rooms[roomKey];

          if (room.created && now - room.created > oneHour) {
            await roomsRef.child(roomKey).remove();
            console.log(`Cleaned old room: ${roomKey}`);
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning old rooms:", error);
    }
  }
}

// ===== UI Helper Functions =====
function createBackgroundBubbles() {
  const bgElement = document.querySelector(".bg-animation");
  if (!bgElement) return;

  for (let i = 0; i < 14; i++) {
    const bubble = document.createElement("div");
    bubble.className = "bg-bubble";

    const size = 40 + Math.random() * 120;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.top = `${Math.random() * 100}%`;
    bubble.style.animationDelay = `${Math.random() * 18}s`;
    bubble.style.animationDuration = `${20 + Math.random() * 10}s`;

    bgElement.appendChild(bubble);
  }
}

// ===== Initialize Game =====
let game;

document.addEventListener("DOMContentLoaded", () => {
  // Create game instance
  game = new ThaiCheckersGame();

  // Create background animation
  createBackgroundBubbles();

  // Setup event listeners
  document
    .getElementById("createBtn")
    ?.addEventListener("click", game.createRoom);
  document.getElementById("joinBtn")?.addEventListener("click", game.joinRoom);
  document
    .getElementById("roomCodeDisplay")
    ?.addEventListener("click", game.copyRoomCode);

  // Setup reset button
  const resetBtn = document.querySelector(".win-content .btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", game.resetGame);
  }

  // Clean old rooms after 1 second
  setTimeout(() => game.cleanOldRooms(), 1000);

  // Handle page unload
  window.addEventListener("beforeunload", () => {
    game.cleanupOnUnload();
  });

  console.log("Thai Checkers Game initialized");
});

// ===== Export for module usage =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThaiCheckersGame;
}
