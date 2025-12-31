class Minesweeper {
    constructor() {
        this.boardElement = document.getElementById('game-board');
        this.flagCountElement = document.getElementById('flag-count');
        this.timerElement = document.getElementById('timer');
        this.resetBtn = document.getElementById('reset-btn');
        this.modal = document.getElementById('result-modal');
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        this.modalRestartBtn = document.getElementById('modal-restart-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.vibrationBtn = document.getElementById('vibration-btn');

        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };

        this.currentDifficulty = 'easy';
        this.board = [];
        this.gameOver = false;
        this.timer = null;
        this.timeElapsed = 0;
        this.flagsPlaced = 0;
        this.firstClick = true;
        this.vibrationEnabled = true;

        this.init();
    }

    init() {
        this.bindEvents();
        this.startGame();
    }

    bindEvents() {
        this.resetBtn.addEventListener('click', () => this.startGame());
        this.modalRestartBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.startGame();
        });

        this.vibrationBtn.addEventListener('click', () => {
            this.vibrationEnabled = !this.vibrationEnabled;
            this.vibrationBtn.classList.toggle('active', this.vibrationEnabled);
            if (this.vibrationEnabled && navigator.vibrate) navigator.vibrate(20);
        });

        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.startGame();
            });
        });
    }

    vibrate(pattern) {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    startGame() {
        const config = this.difficulties[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        
        this.board = [];
        this.gameOver = false;
        this.flagsPlaced = 0;
        this.firstClick = true;
        this.timeElapsed = 0;
        this.stopTimer();
        this.updateUI();

        this.resetBtn.querySelector('.emoji').textContent = '🙂';
        
        // CSS Grid setup
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        this.createBoard();
        this.renderBoard();
    }

    createBoard() {
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    r, c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }
            this.board.push(row);
        }
    }

    placeMines(safeR, safeC) {
        let placed = 0;
        while (placed < this.totalMines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);

            // Don't place mine on the first clicked cell or its neighbors to ensure a safe start
            if (!this.board[r][c].isMine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
                this.board[r][c].isMine = true;
                placed++;
            }
        }
        this.calculateNumbers();
    }

    calculateNumbers() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].isMine) continue;

                let count = 0;
                directions.forEach(([dr, dc]) => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc].isMine) {
                        count++;
                    }
                });
                this.board[r][c].neighborMines = count;
            }
        }
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                cell.addEventListener('click', () => this.handleLeftClick(r, c));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(r, c);
                });

                // Touch support for mobile (long press to flag)
                let touchTimer;
                let isScrolling = false;
                let startX, startY;

                cell.addEventListener('touchstart', (e) => {
                    if (this.gameOver || this.board[r][c].isRevealed) return;
                    
                    isScrolling = false;
                    const touch = e.touches[0];
                    startX = touch.clientX;
                    startY = touch.clientY;

                    touchTimer = setTimeout(() => {
                        if (!isScrolling) {
                            this.handleRightClick(r, c);
                            this.vibrate(50); // Haptic feedback
                        }
                    }, 400); // Slightly shorter delay for better responsiveness
                }, { passive: true });

                cell.addEventListener('touchmove', (e) => {
                    const touch = e.touches[0];
                    const moveX = Math.abs(touch.clientX - startX);
                    const moveY = Math.abs(touch.clientY - startY);
                    
                    // If moved significantly, cancel the long press (it's a scroll)
                    if (moveX > 10 || moveY > 10) {
                        isScrolling = true;
                        clearTimeout(touchTimer);
                    }
                }, { passive: true });

                cell.addEventListener('touchend', (e) => {
                    clearTimeout(touchTimer);
                    // Prevent default click behavior if it was a long press (flag) interaction
                    // Note: 'click' event might still fire, but we handle logic in click handler or here
                });

                this.board[r][c].element = cell;
                fragment.appendChild(cell);
            }
        }
        this.boardElement.appendChild(fragment);
    }

    handleLeftClick(r, c) {
        // If flagged, prevent clicking (standard behavior)
        if (this.gameOver || this.board[r][c].isFlagged || this.board[r][c].isRevealed) return;

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(r, c);
            this.startTimer();
        }

        const cell = this.board[r][c];
        
        if (cell.isMine) {
            this.explode(cell);
            return;
        }

        this.revealCell(r, c);
        this.checkWin();
    }

    handleRightClick(r, c) {
        if (this.gameOver || this.board[r][c].isRevealed) return;

        const cell = this.board[r][c];
        cell.isFlagged = !cell.isFlagged;
        
        if (cell.isFlagged) {
            cell.element.classList.add('flagged');
            cell.element.textContent = '🚩';
            this.flagsPlaced++;
        } else {
            cell.element.classList.remove('flagged');
            cell.element.textContent = '';
            this.flagsPlaced--;
        }
        
        this.updateUI();
    }

    revealCell(r, c) {
        const cell = this.board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;
        cell.element.classList.add('revealed');

        if (cell.neighborMines > 0) {
            cell.element.textContent = cell.neighborMines;
            cell.element.dataset.val = cell.neighborMines;
        } else {
            // Flood fill
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            directions.forEach(([dr, dc]) => {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    this.revealCell(nr, nc);
                }
            });
        }
    }

    explode(triggerCell) {
        this.gameOver = true;
        this.stopTimer();
        triggerCell.element.classList.add('mine');
        triggerCell.element.textContent = '💣';
        this.resetBtn.querySelector('.emoji').textContent = '😵';

        // Reveal all mines
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (cell.isMine && !cell.isRevealed) {
                    setTimeout(() => {
                        cell.element.classList.add('mine');
                        cell.element.textContent = '💣';
                    }, Math.random() * 500); // Random delay for effect
                }
            }
        }
        
        setTimeout(() => this.showModal('Game Over', 'You hit a mine!'), 1000);
    }

    checkWin() {
        let revealedCount = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].isRevealed) revealedCount++;
            }
        }

        if (revealedCount === (this.rows * this.cols) - this.totalMines) {
            this.gameOver = true;
            this.stopTimer();
            this.resetBtn.querySelector('.emoji').textContent = '😎';
            this.showModal('You Win!', `Time: ${this.timeElapsed}s`);
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeElapsed++;
            this.updateUI();
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    updateUI() {
        this.flagCountElement.textContent = this.totalMines - this.flagsPlaced;
        const minutes = Math.floor(this.timeElapsed / 60).toString().padStart(2, '0');
        const seconds = (this.timeElapsed % 60).toString().padStart(2, '0');
        this.timerElement.textContent = `${minutes}:${seconds}`;
    }

    showModal(title, msg) {
        this.resultTitle.textContent = title;
        this.resultMessage.textContent = msg;
        this.modal.classList.remove('hidden');
    }
}

new Minesweeper();
