const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 10;
const paddleHeight = 75;
const ballRadius = 5;

let playerY = (canvas.height - paddleHeight) / 2;
let computerY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 2;
let ballSpeedY = 0;

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
}

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY < 0 || ballY > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  if (ballX < 0) {
    if (ballY > computerY && ballY < computerY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
      ballSpeedY += (ballY - (computerY + paddleHeight / 2)) * 0.3;
    } else {
      resetBall();
    }
  }

  if (ballX > canvas.width) {
    if (ballY > playerY && ballY < playerY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
      ballSpeedY += (ballY - (playerY + paddleHeight / 2)) * 0.3;
    } else {
      resetBall();
    }
  }
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 0;
}

function computerAI() {
  const computerCenter = computerY + paddleHeight / 2;
  const ballDistanceFromPaddle = ballX - paddleWidth;
  const framesToReachBall = ballDistanceFromPaddle / Math.abs(ballSpeedX);
  const predictedBallY = ballY + ballSpeedY * framesToReachBall;

  const minY = Math.max(predictedBallY - 20, 0);
  const maxY = Math.min(predictedBallY + 20, canvas.height - paddleHeight);

  if (computerCenter < minY) {
    computerY += 3;
  } else if (computerCenter > maxY) {
    computerY -= 3;
  }
}


canvas.addEventListener("mousemove", (event) => {
  const mousePos = getMousePos(canvas, event);
  playerY = Math.min(Math.max(mousePos.y - paddleHeight / 2, 0), canvas.height - paddleHeight);
});
  
function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function draw() {
  // Clear canvas
  drawRect(0, 0, canvas.width, canvas.height, "#202020");

  // Draw paddles
  drawRect(0, computerY, paddleWidth, paddleHeight, "#fff");
  drawRect(canvas.width - paddleWidth, playerY, paddleWidth, paddleHeight, "#fff");

  // Draw ball
  drawCircle(ballX, ballY, ballRadius, "#fff");
}

function gameLoop() {
  moveBall();
  computerAI();
  draw();

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
