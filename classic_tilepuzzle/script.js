document.addEventListener('DOMContentLoaded', () => {
  const puzzleContainer = document.getElementById('puzzle-container');
  const startButton = document.getElementById('start-button');
  const difficultySelect = document.getElementById('difficulty');
  const moveCountElement = document.getElementById('move-count');
  const timeElapsedElement = document.getElementById('time-elapsed');
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

  startButton.addEventListener('click', () => {
      moveCount = 0;
      moveCountElement.textContent = `移動数: ${moveCount}`;
      startTime = new Date();
      clearInterval(timer);
      timer = setInterval(updateTime, 1000);
      shufflePuzzle(gridSize);
  });

  function initPuzzle(size) {
      tiles = [];
      for (let i = 1; i <= size * size - 1; i++) {
          tiles.push(i);
      }
      tiles.push(null); // 空のタイル
      renderPuzzle(size);
  }

  function shufflePuzzle(size) {
      do {
          shuffle(tiles);
      } while (!isSolvable(tiles, size));
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
      if (size % 2 === 1) {
          return invCount % 2 === 0;
      } else {
          return (invCount + emptyRow) % 2 === 1;
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
      const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - size, emptyIndex + size];
      if (validMoves.includes(index)) {
          [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
          moveCount++;
          moveCountElement.textContent = `移動数: ${moveCount}`;
          renderPuzzle(size);
          if (checkCompletion(size)) {
              clearInterval(timer);
              alert(`おめでとうございます。\nパズルが完成しました。! 移動数: ${moveCount}, 時間: ${getTimeElapsed()}秒`);
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

  function updateTime() {
      const elapsedTime = getTimeElapsed();
      timeElapsedElement.textContent = `時間: ${elapsedTime}秒`;
  }

  function getTimeElapsed() {
      const now = new Date();
      const elapsedTime = Math.floor((now - startTime) / 1000);
      return elapsedTime;
  }

  // 初期設定として完成状態のパズルを表示
  initPuzzle(gridSize);
});