class TicTacToe {
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
        this.winnerText = document.getElementById('winner-text');
        this.modalRestartBtn = document.getElementById('modal-restart-btn');

        // Name Setup
        this.setupModal = document.getElementById('name-setup-modal');
        this.p1NameInput = document.getElementById('p1-name-input');
        this.p2NameInput = document.getElementById('p2-name-input');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.p1NameDisplay = document.querySelector('.bottom-player .player-name');
        this.p2NameDisplay = document.querySelector('.top-player .player-name');

        this.rows = 3;
        this.cols = 3;
        this.board = []; // 3x3
        this.currentPlayer = 'x'; // 'x' or 'o'
        this.gameActive = false;
        
        this.p1Name = "Player 1";
        this.p2Name = "Player 2";
        this.scores = { p1: 0, p2: 0 }; // P1 is X, P2 is O

        this.init();
    }

    init() {
        this.bindEvents();
        // Show setup modal
        this.setupModal.classList.remove('hidden');
    }

    bindEvents() {
        this.resetBtn.addEventListener('click', () => {
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
        this.board = Array(3).fill(null).map(() => Array(3).fill(null));
        this.gameActive = true;
        this.currentPlayer = 'x'; // X always starts in standard Tic-Tac-Toe
        
        this.renderBoard();
        this.updateUI();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                if (this.board[r][c]) {
                    const mark = document.createElement('div');
                    mark.classList.add('mark', this.board[r][c] === 'x' ? 'cross' : 'circle');
                    cell.appendChild(mark);
                } else {
                    cell.addEventListener('click', () => this.makeMove(r, c));
                }

                this.boardElement.appendChild(cell);
            }
        }
    }

    makeMove(r, c) {
        if (!this.gameActive || this.board[r][c]) return;

        this.board[r][c] = this.currentPlayer;
        this.renderBoard();
        
        if (this.checkWin()) {
            this.endGame(false); // Win
        } else if (this.checkDraw()) {
            this.endGame(true); // Draw
        } else {
            this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x';
            this.updateUI();
        }
    }

    checkWin() {
        const b = this.board;
        const p = this.currentPlayer;

        // Rows
        for (let i = 0; i < 3; i++) {
            if (b[i][0] === p && b[i][1] === p && b[i][2] === p) return true;
        }
        // Cols
        for (let i = 0; i < 3; i++) {
            if (b[0][i] === p && b[1][i] === p && b[2][i] === p) return true;
        }
        // Diagonals
        if (b[0][0] === p && b[1][1] === p && b[2][2] === p) return true;
        if (b[0][2] === p && b[1][1] === p && b[2][0] === p) return true;

        return false;
    }

    checkDraw() {
        return this.board.every(row => row.every(cell => cell !== null));
    }

    endGame(isDraw) {
        this.gameActive = false;
        const resultTitle = document.getElementById('result-title');
        
        if (isDraw) {
            resultTitle.textContent = "Draw!";
            this.winnerText.textContent = "It's a tie game!";
            this.winnerText.style.color = "#888"; 
        } else {
            resultTitle.textContent = "Game Set!";
            const winnerName = this.currentPlayer === 'x' ? this.p1Name : this.p2Name;
            this.winnerText.textContent = `${winnerName} Wins!`;
            
            // Update score
            if (this.currentPlayer === 'x') {
                this.scores.p1++;
                this.p1ScoreEl.textContent = this.scores.p1;
                this.winnerText.style.color = "var(--mark-x)";
            } else {
                this.scores.p2++;
                this.p2ScoreEl.textContent = this.scores.p2;
                this.winnerText.style.color = "var(--mark-o)";
            }
        }
        
        this.modal.classList.remove('hidden');
    }

    updateUI() {
        if (this.currentPlayer === 'x') {
            this.p1Box.classList.add('active');
            this.p2Box.classList.remove('active');
            this.p1Turn.textContent = "Your Turn";
            this.p2Turn.textContent = "Waiting...";
        } else {
            this.p1Box.classList.remove('active');
            this.p2Box.classList.add('active');
            this.p1Turn.textContent = "Waiting...";
            this.p2Turn.textContent = "Your Turn";
        }
    }
}

new TicTacToe();
