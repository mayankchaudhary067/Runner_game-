const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('startBtn');
const speedSlider = document.getElementById('speedControl');
const speedValueEl = document.getElementById('speedValue');
const objectSpeedEl = document.getElementById('objectSpeed');

const groundY = canvas.height - 40;
const gravity = 0.6;
const jumpPower = -12;
const baseSpeed = 4.2;
const WIN_SCORE = 50;
const DAY_CYCLE_MS = 45000;

const state = {
  running: false,
  gameOver: false,
  victory: false,
  score: 0,
  best: Number(localStorage.getItem('runnerBest') || 0),
  speedMultiplier: 1,
  worldTime: 0,
  lastFrame: 0,
  spawnTimer: 0,
  player: {
    x: 90,
    y: groundY - 30,
    width: 30,
    height: 30,
    vy: 0,
    grounded: true,
  },
  obstacles: [],
};

bestEl.textContent = state.best;

function mixColor(dayColor, nightColor, amount) {
  const day = dayColor.match(/\w\w/g).map((value) => parseInt(value, 16));
  const night = nightColor.match(/\w\w/g).map((value) => parseInt(value, 16));
  const mixed = day.map((value, index) => Math.round(value + (night[index] - value) * amount));
  return `rgb(${mixed.join(', ')})`;
}

function getNightAmount() {
  const cycleProgress = (state.worldTime % DAY_CYCLE_MS) / DAY_CYCLE_MS;
  return (1 - Math.cos(cycleProgress * Math.PI * 2)) / 2;
}

function updateTimeIndicator() {
  const nightAmount = getNightAmount();
  document.getElementById('timeOfDay').textContent = nightAmount > 0.55 ? 'Night' : 'Day';
}

function applySpeedSettings() {
  state.speedMultiplier = Number(speedSlider.value);
  speedValueEl.textContent = `${state.speedMultiplier.toFixed(1)}x`;
  updateSpeedIndicator();
}

function getObjectSpeed() {
  let stageSpeed = baseSpeed;
  if (state.score >= 15) {
    stageSpeed = 8.8;
  } else if (state.score >= 10) {
    stageSpeed = 7.1;
  } else if (state.score >= 5) {
    stageSpeed = 5.6;
  }

  return stageSpeed * state.speedMultiplier;
}

function updateSpeedIndicator() {
  objectSpeedEl.textContent = `${getObjectSpeed().toFixed(1)} px/frame`;
}

function resetGame() {
  state.running = true;
  state.gameOver = false;
  state.victory = false;
  state.score = 0;
  state.worldTime = 0;
  state.spawnTimer = 0;
  state.obstacles = [];
  state.player.x = 90;
  state.player.y = groundY - 30;
  state.player.vy = 0;
  state.player.grounded = true;
  scoreEl.textContent = '0';
  applySpeedSettings();
  updateTimeIndicator();
}

function jump() {
  if (!state.running) return;
  if (state.player.grounded) {
    state.player.vy = jumpPower;
    state.player.grounded = false;
  }
}

function spawnObstacle() {
  const width = 22 + Math.random() * 26;
  const height = 20 + Math.random() * 50;
  state.obstacles.push({
    x: canvas.width + 20,
    y: groundY - height,
    width,
    height,
    passed: false,
  });
}

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update(delta) {
  if (!state.running) return;

  if (state.score >= WIN_SCORE) {
    state.running = false;
    state.victory = true;
    return;
  }

  state.player.vy += gravity;
  state.player.y += state.player.vy;

  if (state.player.y + state.player.height >= groundY) {
    state.player.y = groundY - state.player.height;
    state.player.vy = 0;
    state.player.grounded = true;
  }

  const speed = getObjectSpeed();

  state.spawnTimer += delta;
  const obstacleDelay = state.score >= 15 ? 720 : state.score >= 10 ? 850 : state.score >= 5 ? 980 : 1120;

  if (state.spawnTimer > obstacleDelay) {
    spawnObstacle();
    state.spawnTimer = 0;
  }

  for (const obstacle of state.obstacles) {
    obstacle.x -= speed;

    if (!obstacle.passed && obstacle.x + obstacle.width < state.player.x) {
      obstacle.passed = true;
      state.score += 1;
      scoreEl.textContent = String(state.score);
      updateSpeedIndicator();

      if (state.score > state.best) {
        state.best = state.score;
        bestEl.textContent = String(state.best);
        localStorage.setItem('runnerBest', String(state.best));
      }
    }

    if (collision(state.player, obstacle)) {
      state.running = false;
      state.gameOver = true;
      return;
    }
  }

  state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10);
}

function drawBackground() {
  const nightAmount = getNightAmount();
  ctx.fillStyle = mixColor('#9cd4ff', '#101936', nightAmount);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = mixColor('#ffd166', '#f4f1c9', nightAmount);
  ctx.beginPath();
  ctx.arc(canvas.width - 120, 70, 32, 0, Math.PI * 2);
  ctx.fill();

  if (nightAmount > 0.2) {
    ctx.fillStyle = `rgba(255, 255, 220, ${nightAmount})`;
    for (let index = 0; index < 18; index += 1) {
      const x = (index * 83 + 35) % canvas.width;
      const y = 24 + ((index * 47) % 105);
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.fillStyle = mixColor('#8ecae6', '#263b63', nightAmount);
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

function drawGround() {
  const nightAmount = getNightAmount();
  ctx.fillStyle = mixColor('#2a6f3f', '#142b2a', nightAmount);
  ctx.fillRect(0, groundY, canvas.width, 40);

  ctx.strokeStyle = mixColor('#d9f99d', '#718b78', nightAmount);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 8);
  ctx.lineTo(canvas.width, groundY + 8);
  ctx.stroke();
}

function drawPlayer() {
  const { x, y, width, height } = state.player;
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 8, y + 8, 6, 6);
  ctx.fillRect(x + 16, y + 8, 6, 6);
}

function drawObstacles() {
  for (const obstacle of state.obstacles) {
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

function drawText() {
  if (!state.running && !state.gameOver && !state.victory) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Start', canvas.width / 2, canvas.height / 2);
  }

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Start or R to restart', canvas.width / 2, canvas.height / 2 + 60);
  }

  if (state.victory) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Start or R to play again', canvas.width / 2, canvas.height / 2 + 60);
  }
}

function render() {
  drawBackground();
  drawGround();
  drawObstacles();
  drawPlayer();
  drawText();
}

function gameLoop(timestamp) {
  const delta = Math.min(timestamp - state.lastFrame || 16, 100);
  state.lastFrame = timestamp;

  state.worldTime = (state.worldTime + delta) % DAY_CYCLE_MS;
  updateTimeIndicator();

  if (state.running) {
    update(delta);
  }

  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (['Space', 'ArrowUp', 'KeyW', 'KeyJ'].includes(event.code)) {
    event.preventDefault();
    jump();
  }

  if (event.code === 'KeyR' && (state.gameOver || state.victory)) {
    resetGame();
  }
});

startBtn.addEventListener('click', () => {
  resetGame();
});

speedSlider.addEventListener('input', () => {
  applySpeedSettings();
});

applySpeedSettings();
updateTimeIndicator();
resetGame();
state.running = false;
requestAnimationFrame(gameLoop);
