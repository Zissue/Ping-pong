const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

import { ScoreAnimation } from './Classes/scoreAnimation.js';
import { Particle } from './Classes/particle.js';

let particles = [];

let scoreAnimations = [];

let animationFrames = 0;
let playerPaddleColor = "#fff";
let computerPaddleColor = "#fff";
let colorChangeFrames = 0;
let isPaused = false;

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

function isCollidingWithPaddle(ballX, ballY, paddleX, paddleY, paddleWidth, paddleHeight) {
  return (
    ballX >= paddleX &&
    ballX <= paddleX + paddleWidth &&
    ballY + ballRadius >= paddleY &&
    ballY - ballRadius <= paddleY + paddleHeight
  );
}


function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY < 0 || ballY > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  if (isCollidingWithPaddle(ballX, ballY, 0, computerY, paddleWidth, paddleHeight)) {
    ballSpeedX = -ballSpeedX;
    const relativeIntersectY = (computerY + (paddleHeight / 2)) - ballY;
    const normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
    const bounceAngle = normalizedRelativeIntersectionY * maxBounceAngle;
    ballSpeedY = -Math.sin(bounceAngle) * maxSpeed;
  } else if (isCollidingWithPaddle(ballX, ballY, canvas.width - paddleWidth, playerY, paddleWidth, paddleHeight)) {
    ballSpeedX = -ballSpeedX;
    const relativeIntersectY = (playerY + (paddleHeight / 2)) - ballY;
    const normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
    const bounceAngle = normalizedRelativeIntersectionY * maxBounceAngle;
    ballSpeedY = -Math.sin(bounceAngle) * maxSpeed;
  }

  if (ballX < 0) {
    resetBall();
  }

  if (ballX > canvas.width) {
    resetBall();
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

  // Pause the game for 0.5 seconds and then continue
  isPaused = true;
  setTimeout(() => {
    isPaused = false;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = 0;
  }, 800);

  // Show +1 animation
  showScoreAnimation();

  // Add a ScoreAnimation instance
  if (ballX > canvas.width) {
    scoreAnimations.push(new ScoreAnimation(canvas.width - paddleWidth - 50, playerY));
  } else {
    scoreAnimations.push(new ScoreAnimation(paddleWidth + 10, computerY));
  }
}

function pauseGame(duration, callback) {
  clearInterval(gameInterval);
  setTimeout(() => {
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    if (typeof callback === "function") {
      callback();
    }
  }, duration);
}

function showScoreAnimation() {
  const scoreAnimation = document.createElement("div");
  scoreAnimation.innerHTML = "+1";
  scoreAnimation.style.position = "absolute";
  scoreAnimation.style.top = "0";
  scoreAnimation.style.left = "50%";
  scoreAnimation.style.transform = "translateX(-50%)";
  scoreAnimation.style.fontSize = "2rem";
  scoreAnimation.style.fontWeight = "bold";
  scoreAnimation.style.opacity = "1";
  scoreAnimation.style.transition = "top 0.5s ease-out, opacity 0.5s ease-out";
  document.body.appendChild(scoreAnimation);

  // Animate and remove the element after 0.5 seconds
  setTimeout(() => {
    scoreAnimation.style.top = "-40px";
    scoreAnimation.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(scoreAnimation);
    }, 500);
  }, 0);
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

  // Introduce randomness to AI movement
  const randomFactor = 0.3; // Adjust this value (0 to 1) to control the AI's accuracy

  if (computerCenter < minY && Math.random() < randomFactor) {
    computerY += 3;
  } else if (computerCenter > maxY && Math.random() < randomFactor) {
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

  // Draw ScoreAnimations
  scoreAnimations.forEach((animation) => {
    animation.update();
    animation.draw(ctx);
  });

  // Remove finished ScoreAnimations
  scoreAnimations = scoreAnimations.filter((animation) => animation.opacity > 0);
}

function emitParticles() {
  const angle = Math.atan2(ballSpeedY, ballSpeedX) + Math.PI / 2; // Ensure particles move upward
  const xOffset = ballRadius * Math.cos(angle);
  const yOffset = ballRadius * Math.sin(angle);
  const x = ballX - xOffset;
  const y = ballY - yOffset;
  for (let i = 0; i < 5; i++) { // Decrease the number of particles
    particles.push(new Particle(x, y, angle + Math.random() * 0.3 - 0.15, xOffset, yOffset)); // Narrower angle range
  }
}



function gameLoop() {
  if (!isPaused) {
    moveBall();
    computerAI();
    emitParticles();
    draw();
  }

  requestAnimationFrame(gameLoop);
}

async function updateLastUpdated() {
  const response = await fetch("https://api.github.com/repos/zissue/zissue.github.io/commits?per_page=1");
  const data = await response.json();
  const lastCommitDate = new Date(data[0].commit.author.date).toLocaleDateString();
  const lastUpdatedElement = document.getElementById("last-updated");
  lastUpdatedElement.textContent = `Last updated: ${lastCommitDate}`;
}

// Call the updateLastUpdated function
updateLastUpdated();

// Start the game loop
gameLoop();
