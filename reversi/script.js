class Reversi {
    constructor() {
        this.boardElement = document.getElementById('game-board');
        this.p1ScoreEl = document.getElementById('p1-score');
        this.p2ScoreEl = document.getElementById('p2-score');
        this.p1Box = document.getElementById('p1-score-box');
        this.p2Box = document.getElementById('p2-score-box');
        this.p1Turn = document.getElementById('p1-turn');
        this.p2Turn = document.getElementById('p2-turn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // Modal
        this.modal = document.getElementById('result-modal');
        this.finalP1 = document.getElementById('final-p1');
        this.finalP2 = document.getElementById('final-p2');
        this.winnerText = document.getElementById('winner-text');
        this.modalRestartBtn = document.getElementById('modal-restart-btn');

        this.p1Icon = this.p1Box.querySelector('.stone-icon');
        this.p2Icon = this.p2Box.querySelector('.stone-icon');
        this.finalP1Icon = this.modal.querySelector('.final-score-item:first-child .stone-icon');
        this.finalP2Icon = this.modal.querySelector('.final-score-item:last-child .stone-icon');

        // Name Setup
        this.setupModal = document.getElementById('name-setup-modal');
        this.p1NameInput = document.getElementById('p1-name-input');
        this.p2NameInput = document.getElementById('p2-name-input');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.p1NameDisplay = document.querySelector('.bottom-player .player-name');
        this.p2NameDisplay = document.querySelector('.top-player .player-name');

        this.rows = 8;
        this.cols = 8;
        this.board = [];
        this.currentPlayer = 1; // 1: Black, 2: White
        this.p1Color = 1; // Default
        this.p2Color = 2; // Default
        this.p1Name = "Player 1";
        this.p2Name = "Player 2";
        
        // Directions for checking captures: [dr, dc]
        this.directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        // Don't auto-start new game, wait for setup
        this.setupModal.classList.remove('hidden');
    }

    bindEvents() {
        this.resetBtn.addEventListener('click', () => {
            // Confirm if full reset (names too) or just game? Let's just game
             this.startNewGame();
        });
        this.modalRestartBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.startNewGame();
        });

        this.startGameBtn.addEventListener('click', () => {
            this.p1Name = this.p1NameInput.value || "Player 1";
            this.p2Name = this.p2NameInput.value || "Player 2";
            
            this.p1NameDisplay.textContent = this.p1Name;
            this.p2NameDisplay.textContent = this.p2Name;

            this.setupModal.classList.add('hidden');
            this.startNewGame();
        });
    }

    startNewGame() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        
        // Randomize Colors
        // 1: Black, 2: White
        if (Math.random() < 0.5) {
            this.p1Color = 1; // Black
            this.p2Color = 2; // White
        } else {
            this.p1Color = 2; // White
            this.p2Color = 1; // Black
        }
        
        this.updatePlayerIcons();
        this.currentPlayer = 1; // Black always starts
        
        // Initial setup (center 4 stones)
        // 0: empty, 1: black, 2: white
        const mid = this.rows / 2;
        this.board[mid - 1][mid - 1] = 2; // White
        this.board[mid - 1][mid] = 1;     // Black
        this.board[mid][mid - 1] = 1;     // Black
        this.board[mid][mid] = 2;         // White

        this.renderBoard();
        this.updateUI();
        this.checkAndPass(); // In case Black has no moves (unlikely at start but good practice)
    }

    updatePlayerIcons() {
        // Update Game UI
        this.p1Icon.className = 'stone-icon ' + (this.p1Color === 1 ? 'black' : 'white');
        this.p2Icon.className = 'stone-icon ' + (this.p2Color === 1 ? 'black' : 'white');
        
        // Update Modal Icons
        this.finalP1Icon.className = 'stone-icon ' + (this.p1Color === 1 ? 'black' : 'white');
        this.finalP2Icon.className = 'stone-icon ' + (this.p2Color === 1 ? 'black' : 'white');
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        const validMoves = this.getValidMoves(this.currentPlayer);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                // Add stone if exists
                if (this.board[r][c] !== 0) {
                    const stone = document.createElement('div');
                    stone.classList.add('stone', this.board[r][c] === 1 ? 'black' : 'white');
                    stone.classList.add('placed');
                    cell.appendChild(stone);
                } else {
                    // Check if valid move
                    if (validMoves.some(m => m.r === r && m.c === c)) {
                        const hint = document.createElement('div');
                        hint.classList.add('valid-move');
                        cell.appendChild(hint);
                        
                        cell.addEventListener('click', () => this.makeMove(r, c));
                    }
                }

                this.boardElement.appendChild(cell);
            }
        }
    }

    getValidMoves(player) {
        const moves = [];
        const opponent = player === 1 ? 2 : 1;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== 0) continue;

                if (this.canFlip(r, c, player, opponent)) {
                    moves.push({ r, c });
                }
            }
        }
        return moves;
    }

    canFlip(r, c, player, opponent) {
        for (let [dr, dc] of this.directions) {
            let nr = r + dr;
            let nc = c + dc;
            let hasOpponent = false;

            while (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (this.board[nr][nc] === opponent) {
                    hasOpponent = true;
                } else if (this.board[nr][nc] === player) {
                    if (hasOpponent) return true; // Found a line
                    break;
                } else {
                    break; // Empty cell
                }
                nr += dr;
                nc += dc;
            }
        }
        return false;
    }

    makeMove(r, c) {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        this.board[r][c] = this.currentPlayer;
        
        // Flip stones
        for (let [dr, dc] of this.directions) {
            let nr = r + dr;
            let nc = c + dc;
            let stonesToFlip = [];

            while (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (this.board[nr][nc] === opponent) {
                    stonesToFlip.push({r: nr, c: nc});
                } else if (this.board[nr][nc] === this.currentPlayer) {
                    if (stonesToFlip.length > 0) {
                        // Confirm flip
                        stonesToFlip.forEach(pos => {
                            this.board[pos.r][pos.c] = this.currentPlayer;
                        });
                    }
                    break;
                } else {
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }

        this.currentPlayer = opponent;
        this.renderBoard();
        this.updateUI();
        
        // Check for pass on a small timeout to let UI render
        setTimeout(() => this.checkAndPass(), 300);
    }

    checkAndPass() {
        // Does current player have moves?
        const moves = this.getValidMoves(this.currentPlayer);
        if (moves.length === 0) {
            // Check if OTHER player has moves
            const opponent = this.currentPlayer === 1 ? 2 : 1;
            const oppMoves = this.getValidMoves(opponent);
            
            if (oppMoves.length === 0) {
                // Game Over
                this.endGame();
            } else {
                // Pass
                alert(`${this.currentPlayer === 1 ? 'Black' : 'White'} has no moves! Passing turn.`);
                this.currentPlayer = opponent;
                this.renderBoard();
                this.updateUI();
            }
        }
    }

    endGame() {
        const scores = this.getScores();
        this.finalP1.textContent = scores.p1;
        this.finalP2.textContent = scores.p2;
        
        // Determine winner based on score
        if (scores.p1 > scores.p2) {
            const colorName = this.p1Color === 1 ? "Black" : "White";
            this.winnerText.textContent = `Winner: ${this.p1Name} (${colorName})!`;
            this.winnerText.style.color = this.p1Color === 1 ? "#111" : "#fff";
            this.winnerText.style.textShadow = this.p1Color === 1 ? "0 0 5px #fff" : "none";
        } else if (scores.p2 > scores.p1) {
            const colorName = this.p2Color === 1 ? "Black" : "White";
            this.winnerText.textContent = `Winner: ${this.p2Name} (${colorName})!`;
            this.winnerText.style.color = this.p2Color === 1 ? "#111" : "#fff";
            this.winnerText.style.textShadow = this.p2Color === 1 ? "0 0 5px #fff" : "none";
        } else {
            this.winnerText.textContent = "Draw!";
            this.winnerText.style.color = "#888";
            this.winnerText.style.textShadow = "none";
        }
        
        this.modal.classList.remove('hidden');
    }

    getScores() {
        // Count stones on board
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === 1) blackCount++;
                else if (this.board[r][c] === 2) whiteCount++;
            }
        }
        
        // Map to P1/P2 based on assigned colors
        return { 
            p1: this.p1Color === 1 ? blackCount : whiteCount,
            p2: this.p2Color === 1 ? blackCount : whiteCount
        };
    }

    updateUI() {
        const scores = this.getScores();
        this.p1ScoreEl.textContent = scores.p1;
        this.p2ScoreEl.textContent = scores.p2;

        // Active state based on whose turn it is
        // currentPlayer is 1(Black) or 2(White)
        
        if (this.currentPlayer === this.p1Color) {
            // Player 1's turn
            this.p1Box.classList.add('active');
            this.p2Box.classList.remove('active');
            this.p1Turn.textContent = "Your Turn";
            this.p2Turn.textContent = "Waiting...";
        } else {
            // Player 2's turn
            this.p1Box.classList.remove('active');
            this.p2Box.classList.add('active');
            this.p1Turn.textContent = "Waiting...";
            this.p2Turn.textContent = "Your Turn";
        }
    }
}

new Reversi();
