(() => {
  const boardSize = 15;
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('status');
  const restartBtn = document.getElementById('restart-btn');

  const padding = 30;
  const gridSize = (canvas.width - padding * 2) / (boardSize - 1);

  let board = createBoard();
  let currentPlayer = 1; // 1:黑棋, 2:白棋
  let winner = null;

  function createBoard() {
    return Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  }

  function updateStatus() {
    if (winner) {
      statusEl.textContent = `游戏结束：${winner === 1 ? '黑棋' : '白棋'}获胜！`;
      return;
    }
    statusEl.textContent = `当前回合：${currentPlayer === 1 ? '黑棋' : '白棋'}`;
  }

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f7d794';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 1;

    for (let i = 0; i < boardSize; i += 1) {
      const pos = padding + i * gridSize;

      ctx.beginPath();
      ctx.moveTo(padding, pos);
      ctx.lineTo(canvas.width - padding, pos);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos, padding);
      ctx.lineTo(pos, canvas.height - padding);
      ctx.stroke();
    }

    drawPieces();
  }

  function drawPieces() {
    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        if (board[row][col] === 0) continue;

        const x = padding + col * gridSize;
        const y = padding + row * gridSize;

        ctx.beginPath();
        ctx.arc(x, y, gridSize * 0.38, 0, Math.PI * 2);
        if (board[row][col] === 1) {
          const gradient = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, gridSize * 0.38);
          gradient.addColorStop(0, '#666');
          gradient.addColorStop(1, '#111');
          ctx.fillStyle = gradient;
        } else {
          const gradient = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, gridSize * 0.38);
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(1, '#ddd');
          ctx.fillStyle = gradient;
        }
        ctx.fill();
      }
    }
  }

  function getGridPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.round((x - padding) / gridSize);
    const row = Math.round((y - padding) / gridSize);

    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      return null;
    }

    return { row, col };
  }

  function countInDirection(row, col, rowStep, colStep, player) {
    let count = 0;
    let r = row + rowStep;
    let c = col + colStep;

    while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
      count += 1;
      r += rowStep;
      c += colStep;
    }

    return count;
  }

  function checkWin(row, col, player) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    return directions.some(([dr, dc]) => {
      const total =
        1 +
        countInDirection(row, col, dr, dc, player) +
        countInDirection(row, col, -dr, -dc, player);
      return total >= 5;
    });
  }

  function handleClick(event) {
    if (winner) return;

    const pos = getGridPosition(event);
    if (!pos) return;

    const { row, col } = pos;
    if (board[row][col] !== 0) return;

    board[row][col] = currentPlayer;

    if (checkWin(row, col, currentPlayer)) {
      winner = currentPlayer;
    } else {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    drawBoard();
    updateStatus();
  }

  function resetGame() {
    board = createBoard();
    currentPlayer = 1;
    winner = null;
    drawBoard();
    updateStatus();
  }

  canvas.addEventListener('click', handleClick);
  restartBtn.addEventListener('click', resetGame);

  resetGame();
})();
