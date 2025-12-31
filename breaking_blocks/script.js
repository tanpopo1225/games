const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const resultTitle = document.getElementById('result-title');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 80;
const BALL_RADIUS = 6;
const BRICK_ROW_COUNT = 6;
const BRICK_COLUMN_COUNT = 7;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 20;
// Calculate brick width based on canvas
const BRICK_WIDTH = (canvas.width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

// Colors for rows
const BRICK_COLORS = [
    '#ff6b6b', '#ff6b6b', // Red
    '#feca57', '#feca57', // Yellow
    '#48dbfb', '#48dbfb'  // Blue
];

// Game variables
let score = 0;
let lives = 3;
let animationId;
let gameRunning = false;
let gamePaused = true; // True for Start Screen state

const paddle = {
    x: (canvas.width - PADDLE_WIDTH) / 2,
    y: canvas.height - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5,
    color: '#4cc9f0'
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,
    dy: -2,
    radius: BALL_RADIUS,
    speed: 3,
    color: '#ffffff'
};

let rightPressed = false;
let leftPressed = false;

const bricks = [];

function initBricks() {
    bricks.length = 0; // Clear
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                color: BRICK_COLORS[r] || '#ffffff'
            };
        }
    }
}

function initGame() {
    score = 0;
    lives = 3;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    gameRunning = true;
    gamePaused = true;
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    resetBallPaddle();
    initBricks();
    draw();
}

function resetBallPaddle() {
    paddle.x = (canvas.width - PADDLE_WIDTH) / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    // Randomize start direction slightly
    ball.dx = 2 * (Math.random() < 0.5 ? 1 : -1); 
    ball.dy = -2;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ball.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fillStyle = paddle.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = paddle.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                const brickY = (r * (15 + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.roundRect(brickX, brickY, BRICK_WIDTH, 15, 3);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                // Simple AABB collision
                if (ball.x > b.x && ball.x < b.x + BRICK_WIDTH && ball.y > b.y && ball.y < b.y + 15) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    scoreElement.textContent = score;
                    
                    // Win condition
                    if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
                        gameOver(true);
                    }
                }
            }
        }
    }
}

function gameOver(win) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    resultTitle.textContent = win ? "You Win!" : "Game Over";
    gameOverScreen.classList.remove('hidden');
}

function update() {
    if (!gameRunning || gamePaused) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Wall collision
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // Hit logic: change angle based on where it hits the paddle
            let collidePoint = ball.x - (paddle.x + paddle.width / 2);
            collidePoint = collidePoint / (paddle.width / 2);
            
            let angle = collidePoint * (Math.PI / 3); // Max 60 degrees
            
            // Speed up slightly on hit
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * 1.02;
            
            ball.dx = speed * Math.sin(angle);
            ball.dy = -speed * Math.cos(angle);
        } else {
            // Miss
            lives--;
            livesElement.textContent = lives;
            if (!lives) {
                gameOver(false);
                return;
            } else {
                resetBallPaddle();
                gamePaused = true;
                startScreen.classList.remove('hidden');
            }
        }
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Paddle movement
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }

    animationId = requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    
    // Space to start
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        if (!e.repeat) handleStartInteraction();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});

// Touch/Mouse Drag Controls
let isDragging = false;

function handleMove(clientX) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    
    // Map relative X to canvas coordinates
    // Canvas is scaled via CSS, so we need the ratio
    const scaleX = canvas.width / rect.width;
    const canvasX = relativeX * scaleX;

    if (canvasX > 0 && canvasX < canvas.width) {
        paddle.x = canvasX - paddle.width / 2;
        // Clamp
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }
}

canvas.addEventListener('mousemove', (e) => {
    handleMove(e.clientX);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    handleMove(e.touches[0].clientX);
}, { passive: false });

function handleStartInteraction() {
    if (gameRunning && gamePaused) {
        gamePaused = false;
        startScreen.classList.add('hidden');
        update();
    } else if (!gameRunning && gameOverScreen.classList.contains('hidden') === false) {
        // Restart from button usually
    }
}

// Start interaction on tap anywhere if paused
document.addEventListener('touchstart', (e) => {
    // If tapping UI buttons don't trigger this
    if (e.target.tagName !== 'BUTTON') {
        handleStartInteraction();
    }
});

// Restart button
restartBtn.addEventListener('click', initGame);

// Tap overlay to start
startScreen.addEventListener('click', handleStartInteraction);

// Polyfill roundRect for older browsers if needed (mostly safe in modern, but good practice)
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Init
initGame();
