document.addEventListener('DOMContentLoaded', () => {
  const puzzleContainer = document.getElementById('puzzle-container');
  const startButton = document.getElementById('start-button');
  const difficultySelect = document.getElementById('difficulty');
  const moveCountElement = document.getElementById('move-count');
  const timeElapsedElement = document.getElementById('time-elapsed');
  
  // Modal elements
  const modal = document.getElementById('result-modal');
  const modalTitle = document.getElementById('result-title');
  const modalMessage = document.getElementById('result-message');
  const modalRestartBtn = document.getElementById('modal-restart-btn');

  let gridSize = 4;
  let tiles = [];
  let moveCount = 0;
  let startTime;
  let timer;

  // 保存された難易度設定を読み込み
  const savedDifficulty = localStorage.getItem('puzzleDifficulty');
  if (savedDifficulty) {
      difficultySelect.value = savedDifficulty;
      gridSize = parseInt(savedDifficulty);
  }

  difficultySelect.addEventListener('change', () => {
      gridSize = parseInt(difficultySelect.value);
      localStorage.setItem('puzzleDifficulty', gridSize); // 難易度設定を保存
      initPuzzle(gridSize);
  });

  startButton.addEventListener('click', startNewGame);
  modalRestartBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      startNewGame();
  });

  function startNewGame() {
      moveCount = 0;
      moveCountElement.textContent = moveCount;
      startTime = new Date();
      clearInterval(timer);
      timer = setInterval(updateTime, 1000);
      shufflePuzzle(gridSize);
  }

  function initPuzzle(size) {
      tiles = [];
      for (let i = 1; i <= size * size - 1; i++) {
          tiles.push(i);
      }
      tiles.push(null); // 空のタイル
      renderPuzzle(size);
  }

  function shufflePuzzle(size) {
      // Ensure we don't start with a solved puzzle
      do {
          shuffle(tiles);
      } while (!isSolvable(tiles, size) || checkCompletion(size));
      renderPuzzle(size);
  }

  function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }

  function isSolvable(array, size) {
      let invCount = 0;
      for (let i = 0; i < array.length - 1; i++) {
          for (let j = i + 1; j < array.length; j++) {
              if (array[i] && array[j] && array[i] > array[j]) {
                  invCount++;
              }
          }
      }
      const emptyRow = Math.floor(array.indexOf(null) / size);
      // For 4x4 or other even widths, the rule depends on row from bottom
      // But here we calculate row from top. 
      // Solvability formula:
      // If width is odd: inversion count must be even.
      // If width is even:
      //   - Empty on even row from bottom (odd row index from top?): inv odd
      //   - Empty on odd row from bottom (even row index from top?): inv even
      // Let's stick to standard checks.
      
      if (size % 2 !== 0) {
          return invCount % 2 === 0;
      } else {
          // Row index emptyRow is 0-indexed from top
          // (size - emptyRow) is 1-indexed from bottom?? No.
          // Let's use row from bottom (1-indexed)
          const rowFromBottom = size - Math.floor(array.indexOf(null) / size);
          
          if (rowFromBottom % 2 === 0) {
              return invCount % 2 !== 0; 
          } else {
              return invCount % 2 === 0;
          }
      }
  }

  function renderPuzzle(size) {
      puzzleContainer.innerHTML = '';
      puzzleContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      puzzleContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;

      tiles.forEach((tile, index) => {
          const tileElement = document.createElement('div');
          tileElement.classList.add('tile');
          if (tile === null) {
              tileElement.classList.add('empty');
          } else {
              tileElement.textContent = tile;
              tileElement.addEventListener('click', () => moveTile(index, size));
          }
          puzzleContainer.appendChild(tileElement);
      });
  }

  function moveTile(index, size) {
      const emptyIndex = tiles.indexOf(null);
      // Valid moves: up, down, left, right adjacency
      const row = Math.floor(index / size);
      const col = index % size;
      const emptyRow = Math.floor(emptyIndex / size);
      const emptyCol = emptyIndex % size;

      const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

      if (isAdjacent) {
          [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
          moveCount++;
          moveCountElement.textContent = moveCount;
          renderPuzzle(size);
          if (checkCompletion(size)) {
              clearInterval(timer);
              showModal();
          }
      }
  }

  function checkCompletion(size) {
      for (let i = 0; i < size * size - 1; i++) {
          if (tiles[i] !== i + 1) {
              return false;
          }
      }
      return tiles[size * size - 1] === null;
  }

  function showModal() {
      modalMessage.textContent = `Time: ${getTimeElapsed()}s\nMoves: ${moveCount}`;
      modal.classList.remove('hidden');
  }

  function updateTime() {
      const elapsedTime = getTimeElapsed();
      timeElapsedElement.textContent = elapsedTime;
  }

  function getTimeElapsed() {
      if (!startTime) return 0;
      const now = new Date();
      const elapsedTime = Math.floor((now - startTime) / 1000);
      return elapsedTime;
  }

  // 初期設定
  initPuzzle(gridSize);
});