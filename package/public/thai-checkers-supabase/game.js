class ThaiCheckersSupabase {
  constructor() {
    this.supabase = window.supabaseClient;
    this.board = [];
    this.selected = null;
    this.currentPlayer = 1;
    this.playerName = "";
    this.opponentName = "";
    this.roomCode = "";
    this.roomId = null;
    this.isHost = false;
    this.gameStarted = false;
    this.myPlayerNumber = 0;
    this.subscription = null;

    this.initializeGame();
  }

  // Initialize board with starting positions
  initBoardData() {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          if (row < 3) {
            board[row][col] = { player: 2, king: false };
          } else if (row > 4) {
            board[row][col] = { player: 1, king: false };
          }
        }
      }
    }
    return board;
  }

  // Generate random room code
  generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // Create new room
  async createRoom() {
    this.playerName = document.getElementById("playerName").value.trim();
    if (!this.playerName) {
      alert("กรุณาใส่ชื่อผู้เล่น");
      return;
    }

    document.getElementById("createBtn").disabled = true;

    // Generate unique room code
    let roomCode;
    let attempts = 0;

    while (attempts < 10) {
      roomCode = this.generateRoomCode();

      // Check if room code exists
      const { data: existing } = await this.supabase
        .from("rooms")
        .select("id")
        .eq("room_code", roomCode)
        .single();

      if (!existing) break;
      attempts++;
    }

    // Create room in database
    const { data, error } = await this.supabase
      .from("rooms")
      .insert({
        room_code: roomCode,
        host_name: this.playerName,
        board: this.initBoardData(),
        current_player: 1,
        game_started: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating room:", error);
      alert("ไม่สามารถสร้างห้องได้");
      document.getElementById("createBtn").disabled = false;
      return;
    }

    this.roomCode = roomCode;
    this.roomId = data.id;
    this.isHost = true;
    this.myPlayerNumber = 1;
    this.board = data.board;

    this.setupGame();
    this.listenToRoom();
  }

  // Join existing room
  async joinRoom() {
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

    // Find room
    const { data: room, error: findError } = await this.supabase
      .from("rooms")
      .select("*")
      .eq("room_code", this.roomCode)
      .single();

    if (findError || !room) {
      alert("ไม่พบห้อง");
      document.getElementById("joinBtn").disabled = false;
      return;
    }

    if (room.guest_name) {
      alert("ห้องเต็มแล้ว");
      document.getElementById("joinBtn").disabled = false;
      return;
    }

    // Update room with guest
    const { error: updateError } = await this.supabase
      .from("rooms")
      .update({
        guest_name: this.playerName,
        game_started: true,
      })
      .eq("id", room.id);

    if (updateError) {
      console.error("Error joining room:", updateError);
      alert("ไม่สามารถเข้าร่วมห้องได้");
      document.getElementById("joinBtn").disabled = false;
      return;
    }

    this.roomId = room.id;
    this.isHost = false;
    this.myPlayerNumber = 2;
    this.opponentName = room.host_name;
    this.board = room.board;
    this.currentPlayer = room.current_player;
    this.gameStarted = true;

    this.setupGame();
    this.listenToRoom();
  }

  // Setup game UI
  setupGame() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    if (this.isHost) {
      document.getElementById("player1Name").textContent = this.playerName;
      document.getElementById("player2Name").textContent = "Waiting...";
      document.getElementById("roomCodeDisplay").style.display = "block";
      document.getElementById("roomCodeText").textContent = this.roomCode;
    } else {
      document.getElementById("player1Name").textContent = this.opponentName;
      document.getElementById("player2Name").textContent = this.playerName;
    }

    this.renderBoard();
    this.updateTurnIndicator();
  }

  // Listen to room changes using Realtime
  listenToRoom() {
    // Subscribe to room updates
    this.subscription = this.supabase
      .channel(`room-${this.roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${this.roomId}`,
        },
        (payload) => {
          this.handleRoomUpdate(payload.new);
        }
      )
      .subscribe();
  }

  // Handle room updates
  handleRoomUpdate(roomData) {
    // Update game state
    this.board = roomData.board;
    this.currentPlayer = roomData.current_player;

    // Check if guest joined (for host)
    if (this.isHost && !this.gameStarted && roomData.guest_name) {
      this.opponentName = roomData.guest_name;
      this.gameStarted = true;
      document.getElementById("player2Name").textContent = this.opponentName;
      document.getElementById("connectionStatus").textContent =
        "เชื่อมต่อแล้ว! / Connected!";
      document.getElementById("connectionStatus").className =
        "status-connected";
    }

    // Check for winner
    if (roomData.winner) {
      this.showWinner(roomData.winner);
    }

    this.renderBoard();
    this.updateTurnIndicator();
  }

  // Render game board
  renderBoard() {
    const boardEl = document.getElementById("board");
    boardEl.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "dark" : "light"}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.board[row][col];
        if (piece) {
          const pieceEl = document.createElement("div");
          pieceEl.className = `piece player${piece.player}`;
          if (piece.king) {
            pieceEl.classList.add("king");
          }
          square.appendChild(pieceEl);
        }

        square.onclick = () => this.handleSquareClick(row, col);
        boardEl.appendChild(square);
      }
    }
  }

  // Handle square clicks
  async handleSquareClick(row, col) {
    if (!this.gameStarted || this.currentPlayer !== this.myPlayerNumber) {
      return;
    }

    const piece = this.board[row][col];

    if (!this.selected) {
      if (piece && piece.player === this.currentPlayer) {
        this.selectPiece(row, col);
      }
    } else {
      const validMoves = this.getValidMoves(
        this.selected.row,
        this.selected.col
      );
      const move = validMoves.find((m) => m.row === row && m.col === col);

      if (move) {
        await this.makeMove(
          this.selected.row,
          this.selected.col,
          row,
          col,
          move.captures
        );
        this.clearSelection();
      } else {
        this.clearSelection();
        if (piece && piece.player === this.currentPlayer) {
          this.selectPiece(row, col);
        }
      }
    }
  }

  // Select a piece
  selectPiece(row, col) {
    this.selected = { row, col };

    document.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove("selected", "valid-move");
    });

    document
      .querySelector(`[data-row="${row}"][data-col="${col}"]`)
      ?.classList.add("selected");

    const validMoves = this.getValidMoves(row, col);
    validMoves.forEach((move) => {
      document
        .querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`)
        ?.classList.add("valid-move");
    });
  }

  // Clear selection
  clearSelection() {
    this.selected = null;
    document.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove("selected", "valid-move");
    });
  }

  // Get valid moves for a piece
  getValidMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    const directions = piece.king
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : piece.player === 1
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

    // Check for captures first
    const captures = [];
    for (const [dr, dc] of directions) {
      const capture = this.checkCapture(row, col, dr, dc);
      if (capture) captures.push(capture);
    }

    if (captures.length > 0) return captures;

    // Normal moves
    const moves = [];
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol, captures: [] });
      }
    }

    return moves;
  }

  // Check for capture move
  checkCapture(row, col, dr, dc) {
    const enemyRow = row + dr;
    const enemyCol = col + dc;
    const landRow = row + dr * 2;
    const landCol = col + dc * 2;

    if (!this.isValidPosition(landRow, landCol)) return null;

    const piece = this.board[row][col];
    const enemy = this.board[enemyRow][enemyCol];
    const landing = this.board[landRow][landCol];

    if (enemy && enemy.player !== piece.player && !landing) {
      return {
        row: landRow,
        col: landCol,
        captures: [{ row: enemyRow, col: enemyCol }],
      };
    }

    return null;
  }

  // Check if position is valid
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  // Make a move
  async makeMove(fromRow, fromCol, toRow, toCol, captures) {
    const piece = this.board[fromRow][fromCol];

    // Update local board
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Remove captured pieces
    captures.forEach((cap) => {
      this.board[cap.row][cap.col] = null;
    });

    // Check for king promotion
    if (
      (piece.player === 1 && toRow === 0) ||
      (piece.player === 2 && toRow === 7)
    ) {
      piece.king = true;
    }

    // Check for winner
    const winner = this.checkWinner();

    // Update database
    const newPlayer = this.currentPlayer === 1 ? 2 : 1;

    const { error } = await this.supabase
      .from("rooms")
      .update({
        board: this.board,
        current_player: newPlayer,
        winner: winner,
      })
      .eq("id", this.roomId);

    if (error) {
      console.error("Error updating move:", error);
      return;
    }

    // Save move history
    await this.supabase.from("moves").insert({
      room_id: this.roomId,
      player: this.currentPlayer,
      from_row: fromRow,
      from_col: fromCol,
      to_row: toRow,
      to_col: toCol,
      captures: captures,
    });

    this.currentPlayer = newPlayer;
  }

  // Check for winner
  checkWinner() {
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

    if (player1Count === 0) return 2;
    if (player2Count === 0) return 1;
    return null;
  }

  // Show winner
  showWinner(winner) {
    const winnerName =
      winner === 1
        ? this.isHost
          ? this.playerName
          : this.opponentName
        : this.isHost
        ? this.opponentName
        : this.playerName;

    document.getElementById(
      "winnerText"
    ).textContent = `🎉 ${winnerName} ชนะ! 🎉`;
    document.getElementById("winScreen").style.display = "grid";
  }

  // Update turn indicator
  updateTurnIndicator() {
    document
      .getElementById("player1Info")
      .classList.toggle("current-turn", this.currentPlayer === 1);
    document
      .getElementById("player2Info")
      .classList.toggle("current-turn", this.currentPlayer === 2);

    if (this.gameStarted) {
      const statusEl = document.getElementById("connectionStatus");
      if (this.currentPlayer === this.myPlayerNumber) {
        statusEl.textContent = "ตาของคุณ! / Your turn!";
        statusEl.className = "status-connected";
      } else {
        statusEl.textContent = "รอคู่ต่อสู้... / Opponent's turn...";
        statusEl.className = "status-waiting";
      }
    }
  }

  // Copy room code
  copyRoomCode() {
    const code = document.getElementById("roomCodeText").textContent;
    navigator.clipboard.writeText(code).then(() => {
      const el = document.getElementById("roomCodeDisplay");
      el.classList.add("copied");
      setTimeout(() => el.classList.remove("copied"), 300);
    });
  }

  // Reset game
  async resetGame() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
    }

    // Reset all state
    this.board = [];
    this.selected = null;
    this.currentPlayer = 1;
    this.gameStarted = false;
    this.roomId = null;

    // Reset UI
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("createBtn").disabled = false;
    document.getElementById("joinBtn").disabled = false;
    document.getElementById("playerName").value = "";
    document.getElementById("roomCode").value = "";
  }

  // Initialize
  initializeGame() {
    // Set up event listeners
    document
      .getElementById("createBtn")
      ?.addEventListener("click", () => this.createRoom());
    document
      .getElementById("joinBtn")
      ?.addEventListener("click", () => this.joinRoom());
    document
      .getElementById("roomCodeDisplay")
      ?.addEventListener("click", () => this.copyRoomCode());
    document
      .querySelector("#winScreen .btn")
      ?.addEventListener("click", () => this.resetGame());
  }
}

// Initialize game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.game = new ThaiCheckersSupabase();
});
