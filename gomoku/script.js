class Gomoku {
    constructor() {
        this.BOARD_SIZE = 15;
        this.boardElement = document.getElementById('game-board');
        this.resetBtn = document.getElementById('reset-btn');
        
        // UI Elements
        this.p1Area = document.querySelector('.bottom-player');
        this.p2Area = document.querySelector('.top-player');
        this.p1TurnText = document.getElementById('p1-turn');
        this.p2TurnText = document.getElementById('p2-turn');
        
        // Modal elements
        this.resultModal = document.getElementById('result-modal');
        this.winnerTitle = document.getElementById('winner-title');
        this.winnerMessage = document.getElementById('winner-message');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.gameState = []; // 2D array: null, 'black', 'white'
        this.currentPlayer = 'black'; // Black starts
        this.gameActive = true;
        this.moveHistory = []; // Track moves for 'last move' highlight

        this.init();
    }

    init() {
        this.createBoard();
        this.bindEvents();
        this.resetGame();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.BOARD_SIZE}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.BOARD_SIZE}, 1fr)`;

        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Preview element for hover
                const preview = document.createElement('div');
                preview.classList.add('stone-preview');
                cell.appendChild(preview);

                this.boardElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        
        // Hover effects update
        this.boardElement.addEventListener('mouseover', (e) => {
            if (!this.gameActive) return;
            const cell = e.target.closest('.cell');
            if (cell) {
                const preview = cell.querySelector('.stone-preview');
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                if (!this.gameState[y][x]) {
                    preview.className = `stone-preview ${this.currentPlayer}`;
                }
            }
        });

        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.newGameBtn.addEventListener('click', () => {
            this.resultModal.classList.add('hidden');
            this.resetGame();
        });
    }

    resetGame() {
        this.gameState = Array(this.BOARD_SIZE).fill(null).map(() => Array(this.BOARD_SIZE).fill(null));
        this.currentPlayer = 'black'; // Bottom player starts
        this.gameActive = true;
        this.moveHistory = [];
        
        // Clear board UI
        const cells = this.boardElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            const stone = cell.querySelector('.stone');
            if (stone) stone.remove();
        });

        this.updateUI();
    }

    handleCellClick(e) {
        if (!this.gameActive) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        if (this.gameState[y][x]) return; // Occupied

        this.placeStone(x, y);
    }

    placeStone(x, y) {
        // Logic
        this.gameState[y][x] = this.currentPlayer;
        this.moveHistory.push({x, y});

        // UI
        const cell = this.boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        const stone = document.createElement('div');
        stone.classList.add('stone', this.currentPlayer, 'placed');
        
        // Mark last move
        this.clearLastMoveIndicator();
        stone.classList.add('last-move');
        
        cell.appendChild(stone);

        // Check Win
        if (this.checkWin(x, y)) {
            this.endGame(this.currentPlayer);
        } else if (this.checkDraw()) {
            this.endGame('draw');
        } else {
            this.togglePlayer();
        }
    }

    clearLastMoveIndicator() {
        const last = this.boardElement.querySelector('.stone.last-move');
        if (last) last.classList.remove('last-move');
    }

    togglePlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateUI();
    }

    updateUI() {
        // Black is Player 1 (Bottom), White is Player 2 (Top)
        if (this.currentPlayer === 'black') {
            this.p1Area.classList.add('active');
            this.p2Area.classList.remove('active');
            
            this.p1TurnText.textContent = "Your Turn";
            this.p2TurnText.textContent = "Thinking..."; 
            
            this.p1TurnText.style.opacity = '1';
            this.p2TurnText.style.opacity = '0.5';
        } else {
            this.p1Area.classList.remove('active');
            this.p2Area.classList.add('active');
            
            this.p1TurnText.textContent = "Waiting...";
            this.p2TurnText.textContent = "Your Turn"; 
            
            this.p1TurnText.style.opacity = '0.5';
            this.p2TurnText.style.opacity = '1';
        }
    }

    checkWin(x, y) {
        const player = this.gameState[y][x];
        const directions = [
            [1, 0],  // Horizontal
            [0, 1],  // Vertical
            [1, 1],  // Diagonal \
            [1, -1]  // Diagonal /
        ];

        for (let [dx, dy] of directions) {
            let count = 1; // Count current stone

            // Check forward
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (this.isValid(nx, ny) && this.gameState[ny][nx] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // Check backward
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (this.isValid(nx, ny) && this.gameState[ny][nx] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) return true;
        }

        return false;
    }

    checkDraw() {
        return this.moveHistory.length >= this.BOARD_SIZE * this.BOARD_SIZE;
    }

    isValid(x, y) {
        return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE;
    }

    endGame(winner) {
        this.gameActive = false;
        
        if (winner === 'draw') {
            this.winnerTitle.textContent = "Draw!";
            this.winnerMessage.textContent = "No more moves possible.";
        } else {
            const winnerName = winner.charAt(0).toUpperCase() + winner.slice(1);
            this.winnerTitle.textContent = `${winnerName} Wins!`;
            this.winnerMessage.textContent = `${winnerName} connected 5 stones to win the match.`;
        }
        
        // Small delay
        setTimeout(() => {
            this.resultModal.classList.remove('hidden');
        }, 500);
    }
}

// Start Game
document.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});
