const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let animationFrames = 0;
let playerPaddleColor = "#fff";
let computerPaddleColor = "#fff";
let colorChangeFrames = 0;

const paddleWidth = 10;
const paddleHeight = 75;
const ballRadius = 12;

let playerY = (canvas.height - paddleHeight) / 2;
let computerY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 3;
let ballSpeedY = -10;
const maxSpeed = 10;

let playerScore = 0;
let computerScore = 0;
const scoreboard = document.getElementById("scoreboard");

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

  const speedMagnitude = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
  if (speedMagnitude > maxSpeed) {
    ballSpeedX = (ballSpeedX / speedMagnitude) * maxSpeed;
    ballSpeedY = (ballSpeedY / speedMagnitude) * maxSpeed;
  }
}


function resetBall() {
  if (ballX > canvas.width) {
    computerScore++;
  } else {
    playerScore++;
  }

  scoreboard.textContent = `Computer: ${computerScore} | Player: ${playerScore}`;

  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 0;

  // Set animationFrames to the desired number of frames for the animation
  animationFrames = 60;
  
  // Set colorChangeFrames to the desired number of frames for the color change effect
  colorChangeFrames = 30;
}

function handlePaddleColorChange() {
  if (colorChangeFrames > 0) {
    colorChangeFrames--;
  } else {
    playerPaddleColor = "#fff";
    computerPaddleColor = "#fff";
  }
}

function animateScore() {
  if (animationFrames > 0) {
    const scale = 1 + 0.1 * (60 - animationFrames) / 60;
    scoreboard.style.transform = `scale(${scale})`;
    animationFrames--;
  } else {
    scoreboard.style.transform = 'scale(1)';
  }
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
  
  // Animate scoreboard
  animateScore();
  
  // Handle paddle color change
  handlePaddleColorChange();
}

function gameLoop() {
  moveBall();
  computerAI();
  draw();

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
