(() => {
  const boardSize = 15;
  const padding = 30;

  function initGame() {
    const canvas = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (!canvas || !statusEl || !startBtn || !restartBtn) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      statusEl.textContent = '浏览器不支持 Canvas，无法开始游戏';
      return;
    }

    const gridSize = (canvas.width - padding * 2) / (boardSize - 1);

    let board = createBoard();
    let currentPlayer = 1;
    let winner = null;
    let gameStarted = false;

    function createBoard() {
      return Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    }

    function updateStatus(extra = '') {
      if (!gameStarted) {
        statusEl.textContent = '点击“开始对局”后由黑棋先手';
        return;
      }

      if (winner) {
        statusEl.textContent = `游戏结束：${winner === 1 ? '黑棋' : '白棋'}获胜！`;
        return;
      }

      const base = `当前回合：${currentPlayer === 1 ? '黑棋' : '白棋'}`;
      statusEl.textContent = extra ? `${base}（${extra}）` : base;
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

          const gradient = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, gridSize * 0.38);
          if (board[row][col] === 1) {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#111');
          } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
          }
          ctx.fillStyle = gradient;
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
        const total = 1 + countInDirection(row, col, dr, dc, player) + countInDirection(row, col, -dr, -dc, player);
        return total >= 5;
      });
    }

    function handleCanvasClick(event) {
      if (!gameStarted) {
        statusEl.textContent = '请先点击“开始对局”';
        return;
      }

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

    function startGame() {
      board = createBoard();
      currentPlayer = 1;
      winner = null;
      gameStarted = true;
      drawBoard();
      updateStatus('已开始');
    }

    function resetGame() {
      board = createBoard();
      currentPlayer = 1;
      winner = null;
      drawBoard();

      if (gameStarted) {
        updateStatus('已重置');
      } else {
        statusEl.textContent = '点击“开始对局”后由黑棋先手';
      }
    }

    canvas.addEventListener('click', handleCanvasClick);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);

    resetGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
})();
