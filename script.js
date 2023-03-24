const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let particles = [];

class Particle {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 5;
    this.life = 0.3;
    this.size = 8;
  }

  update() {
    this.x += this.speed * Math.cos(this.angle) * -1;
    this.y += this.speed * Math.sin(this.angle);
    this.life -= 0.01;
  }

  draw(ctx) {
    const opacity = Math.min(1, this.life * 3);
    ctx.fillStyle = `rgba(255, 128, 0, ${opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

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
const maxSpeed = 3.5;
const maxBounceAngle = 5 * Math.PI / 12; // 75 degrees in radians

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
      const relativeIntersectY = (computerY + (paddleHeight / 2)) - ballY;
      const normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
      const bounceAngle = normalizedRelativeIntersectionY * maxBounceAngle;
      ballSpeedY = -Math.sin(bounceAngle) * maxSpeed;
    } else {
      resetBall();
    }
  }

  if (ballX > canvas.width) {
    if (ballY > playerY && ballY < playerY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
      const relativeIntersectY = (playerY + (paddleHeight / 2)) - ballY;
      const normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
      const bounceAngle = normalizedRelativeIntersectionY * maxBounceAngle;
      ballSpeedY = -Math.sin(bounceAngle) * maxSpeed;
    } else {
      resetBall();
    }
  }
}



function resetBall() {
  if (ballX > canvas.width) {
    computerScore++;
    playerPaddleColor = "#f00";
  } else {
    playerScore++;
    computerPaddleColor = "#f00";
  }

  scoreboard.textContent = `Computer: ${computerScore} | Player: ${playerScore}`;

  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 0;

  // Set animationFrames and colorChangeFrames
  animationFrames = 60;
  colorChangeFrames = 120;
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

  // Keep the computer paddle within the playfield
  if (computerY < 0) {
    computerY = 0;
  } else if (computerY + paddleHeight > canvas.height) {
    computerY = canvas.height - paddleHeight;
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

const playfieldThickness = 10;

function draw() {
  // Clear canvas
  drawRect(0, 0, canvas.width, canvas.height, "#202020");

  // Draw playfield
  drawRect(playfieldThickness, playfieldThickness, canvas.width - 2 * playfieldThickness, canvas.height - 2 * playfieldThickness, "#303030");

  // Draw paddles
  drawRect(0, computerY, paddleWidth, paddleHeight, computerPaddleColor);
  drawRect(canvas.width - paddleWidth, playerY, paddleWidth, paddleHeight, playerPaddleColor);

  // Draw particles
  particles.forEach((particle) => {
    particle.update();
    particle.draw(ctx);
  });
  
    // Draw ball
  drawCircle(ballX, ballY, ballRadius, "#fff");

  // Remove dead particles
  particles = particles.filter((particle) => particle.life > 0);

  // Animate scoreboard
  animateScore();

  // Handle paddle color change
  handlePaddleColorChange();
}

function emitParticles() {
  const angle = Math.atan2(ballSpeedY, ballSpeedX);
  const x = ballX - ballRadius * Math.cos(angle);
  const y = ballY - ballRadius * Math.sin(angle);
  for (let i = 0; i < 5; i++) {
    particles.push(new Particle(x, y, angle + Math.random() * 0.4 - 0.2));
  }
}

function gameLoop() {
  moveBall();
  computerAI();
  emitParticles();
  draw();

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
