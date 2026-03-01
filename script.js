const SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
const history = [];
let gameOver = false;

const canvas = document.getElementById('board');
const statusEl = document.getElementById('status');
const undoButton = document.getElementById('undo');
const restartButton = document.getElementById('restart');
const ctx = canvas.getContext('2d');

let cellSize = canvas.width / (SIZE + 1);
let offset = cellSize;

function setStatus(message) {
  statusEl.textContent = message;
}

function inBounds(x, y) {
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function resizeCanvas() {
  const size = Math.min(680, Math.max(320, canvas.clientWidth));
  canvas.width = size;
  canvas.height = size;
  cellSize = size / (SIZE + 1);
  offset = cellSize;
  drawBoard();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e5ba73';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#7a4e12';
  ctx.lineWidth = 1;
  for (let i = 0; i < SIZE; i++) {
    const pos = offset + i * cellSize;

    ctx.beginPath();
    ctx.moveTo(offset, pos);
    ctx.lineTo(offset + (SIZE - 1) * cellSize, pos);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pos, offset);
    ctx.lineTo(pos, offset + (SIZE - 1) * cellSize);
    ctx.stroke();
  }

  const stars = [3, 7, 11];
  stars.forEach((x) => {
    stars.forEach((y) => {
      drawStar(x, y);
    });
  });

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== EMPTY) {
        drawStone(x, y, board[y][x]);
      }
    }
  }
}

function drawStar(x, y) {
  const px = offset + x * cellSize;
  const py = offset + y * cellSize;
  ctx.beginPath();
  ctx.arc(px, py, Math.max(2, cellSize * 0.08), 0, Math.PI * 2);
  ctx.fillStyle = '#6b3f0d';
  ctx.fill();
}

function drawStone(x, y, color) {
  const px = offset + x * cellSize;
  const py = offset + y * cellSize;
  const radius = Math.max(8, cellSize * 0.42);

  const gradient = ctx.createRadialGradient(px - radius * 0.35, py - radius * 0.35, radius * 0.1, px, py, radius);
  if (color === BLACK) {
    gradient.addColorStop(0, '#4a4a4a');
    gradient.addColorStop(1, '#0f0f0f');
  } else {
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#d1d5db');
  }

  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function countDirection(x, y, dx, dy, color) {
  let count = 0;
  let nx = x + dx;
  let ny = y + dy;

  while (inBounds(nx, ny) && board[ny][nx] === color) {
    count++;
    nx += dx;
    ny += dy;
  }

  return count;
}

function isWinningMove(x, y, color) {
  for (const [dx, dy] of DIRECTIONS) {
    const count = 1 + countDirection(x, y, dx, dy, color) + countDirection(x, y, -dx, -dy, color);
    if (count >= 5) {
      return true;
    }
  }
  return false;
}

function patternScore(total, openEnds) {
  if (total >= 5) return 100000;
  if (total === 4 && openEnds === 2) return 20000;
  if (total === 4 && openEnds === 1) return 4000;
  if (total === 3 && openEnds === 2) return 1200;
  if (total === 3 && openEnds === 1) return 300;
  if (total === 2 && openEnds === 2) return 80;
  if (total === 2 && openEnds === 1) return 20;
  return 6;
}

function evaluatePoint(x, y, color) {
  let score = 0;
  for (const [dx, dy] of DIRECTIONS) {
    const forward = countDirection(x, y, dx, dy, color);
    const backward = countDirection(x, y, -dx, -dy, color);
    const total = forward + backward + 1;

    let openEnds = 0;
    const fx = x + (forward + 1) * dx;
    const fy = y + (forward + 1) * dy;
    const bx = x - (backward + 1) * dx;
    const by = y - (backward + 1) * dy;

    if (inBounds(fx, fy) && board[fy][fx] === EMPTY) openEnds++;
    if (inBounds(bx, by) && board[by][bx] === EMPTY) openEnds++;

    score += patternScore(total, openEnds);
  }

  // 中央优先，减少边角无意义落子
  const center = (SIZE - 1) / 2;
  score += 28 - (Math.abs(x - center) + Math.abs(y - center));

  return score;
}

function findBestMove() {
  let best = null;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== EMPTY) continue;

      if (isWinningMove(x, y, WHITE)) return { x, y };
      if (isWinningMove(x, y, BLACK)) {
        if (!best || best.priority < 1) {
          best = { x, y, score: Number.MAX_SAFE_INTEGER, priority: 1 };
        }
        continue;
      }

      const attack = evaluatePoint(x, y, WHITE);
      const defense = evaluatePoint(x, y, BLACK);
      const score = attack * 1.2 + defense;

      if (!best || score > best.score || (score === best.score && Math.random() > 0.5)) {
        best = { x, y, score, priority: 0 };
      }
    }
  }

  return best;
}

function placeStone(x, y, color) {
  if (!inBounds(x, y) || board[y][x] !== EMPTY || gameOver) {
    return false;
  }

  board[y][x] = color;
  history.push({ x, y, color });
  drawBoard();

  if (isWinningMove(x, y, color)) {
    gameOver = true;
    setStatus(color === BLACK ? '你赢了！' : 'AI 胜利！');
  }

  return true;
}

function aiMove() {
  if (gameOver) return;
  const move = findBestMove();
  if (!move) {
    setStatus('平局：棋盘已满');
    gameOver = true;
    return;
  }

  placeStone(move.x, move.y, WHITE);
  if (!gameOver) {
    setStatus('你的回合（黑棋）');
  }
}

function handlePlayerMove(event) {
  if (gameOver) return;

  const point = getCanvasPoint(event);
  const x = Math.round((point.x - offset) / cellSize);
  const y = Math.round((point.y - offset) / cellSize);

  if (!placeStone(x, y, BLACK)) {
    return;
  }

  if (!gameOver) {
    setStatus('AI 思考中...');
    setTimeout(aiMove, 180);
  }
}

function restart() {
  for (let y = 0; y < SIZE; y++) {
    board[y].fill(EMPTY);
  }
  history.length = 0;
  gameOver = false;
  setStatus('你的回合（黑棋）');
  drawBoard();
}

function undo() {
  if (history.length < 2 || gameOver) {
    setStatus('无法悔棋（需要至少下完一轮）');
    return;
  }

  const lastAi = history.pop();
  const lastPlayer = history.pop();
  board[lastAi.y][lastAi.x] = EMPTY;
  board[lastPlayer.y][lastPlayer.x] = EMPTY;
  setStatus('已悔棋，你的回合（黑棋）');
  drawBoard();
}

canvas.addEventListener('click', handlePlayerMove);
restartButton.addEventListener('click', restart);
undoButton.addEventListener('click', undo);
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
