document.addEventListener('DOMContentLoaded', () => {
  const puzzleContainer = document.getElementById('puzzle-container');
  const startButton = document.getElementById('start-button');
  const difficultySelect = document.getElementById('difficulty');
  const moveCountElement = document.getElementById('move-count');
  const timeElapsedElement = document.getElementById('time-elapsed');
  const imageInput = document.getElementById('image-input');
  const randomImageButton = document.getElementById('random-image-button');
  const originalImageElement = document.getElementById('original-image');
  let gridSize = 4;
  let tiles = [];
  let moveCount = 0;
  let startTime;
  let timer;
  let imageUrl = '';
  const randomImages = [
    'images/image1.jpg',
    'images/image2.jpg',
    'images/image3.jpg',
    'images/image4.jpg',
    'images/image5.jpg',
    'images/image6.jpg',
    'images/image7.jpg',
    'images/image8.jpg',
    'images/image9.jpg',
    'images/image10.jpg'
  ];

  const savedDifficulty = localStorage.getItem('puzzleDifficulty');
  if (savedDifficulty) {
    difficultySelect.value = savedDifficulty;
    gridSize = parseInt(savedDifficulty);
  }

  difficultySelect.addEventListener('change', () => {
    gridSize = parseInt(difficultySelect.value);
    localStorage.setItem('puzzleDifficulty', gridSize);
    if (imageUrl) {
      initPuzzle(gridSize);
    }
  });

  startButton.addEventListener('click', () => {
    if (!imageUrl) {
      alert('画像をアップロードするか、ランダムな画像を選択してください。');
      return;
    }
    startGame();
  });

  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageUrl = e.target.result;
        originalImageElement.src = imageUrl;
        initPuzzle(gridSize);
      };
      reader.readAsDataURL(file);
    }
  });

  randomImageButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * randomImages.length);
    imageUrl = randomImages[randomIndex];
    originalImageElement.src = imageUrl;
    initPuzzle(gridSize);
    startGame();
  });

  function startGame() {
    moveCount = 0;
    moveCountElement.textContent = `移動数: ${moveCount}`;
    startTime = new Date();
    clearInterval(timer);
    timer = setInterval(updateTime, 1000);
    shufflePuzzle(gridSize);
  }

  function initPuzzle(size) {
    tiles = [];
    for (let i = 0; i < size * size; i++) {
      tiles.push(i);
    }
    renderPuzzle(size);
  }

  function shufflePuzzle(size) {
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
    const emptyRow = Math.floor(array.indexOf(size * size - 1) / size);
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
      if (tile === size * size - 1) {
        tileElement.classList.add('empty');
      } else {
        const row = Math.floor(tile / size);
        const col = tile % size;
        tileElement.style.backgroundImage = `url(${imageUrl})`;
        tileElement.style.backgroundSize = `${size * 100}% ${size * 100}%`;
        tileElement.style.backgroundPosition = `${(col * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`;
        tileElement.addEventListener('click', () => moveTile(index, size));
      }
      puzzleContainer.appendChild(tileElement);
    });
  }

  function moveTile(index, size) {
    const emptyIndex = tiles.indexOf(size * size - 1);
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - size, emptyIndex + size];
    if (validMoves.includes(index)) {
      [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
      moveCount++;
      moveCountElement.textContent = `移動数: ${moveCount}`;
      renderPuzzle(size);
      if (checkCompletion(size)) {
        clearInterval(timer);
        alert(`パズル完成! 移動数: ${moveCount}, 時間: ${getTimeElapsed()}秒`);
      }
    }
  }

  function checkCompletion(size) {
    for (let i = 0; i < size * size - 1; i++) {
      if (tiles[i] !== i) {
        return false;
      }
    }
    return tiles[size * size - 1] === size * size - 1;
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

  // 初期設定として完成状態の4x4のパズルを表示
  initPuzzle(gridSize);
});