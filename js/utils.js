'use strict';

function renderBoard(board, level) {
  var str = `<table class="board ${level}">`;
  for (var i = 0; i < board.length; i++) {
    str += '<tr class="row">';
    for (var j = 0; j < board[0].length; j++) {
      str += `<td class="cell cell-${i}-${j}" oncontextmenu="onCellMarked(this,event);" onmousedown="onCellClicked(this,event)"></td>`;
    }
  }
  str += '</table>';

  const container = document.querySelector('.board-container');
  container.innerHTML = str;
}

function renderCell(pos, value) {
  const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
  elCell.innerHTML = value;
}

function renderTimer() {
  const timer = document.querySelector('.timer-counter');
  const formattedCount = formateNum(gGame.secsPassed);
  timer.innerText = formattedCount;
}

function renderMinesCount() {
  const minesCounter = document.querySelector('.mines-counter');
  const remaining = gLevel.mines - gGame.markedCount;
  const formattedMinesCount = formateNum(remaining);
  minesCounter.innerText = formattedMinesCount;
}

function startTimer() {
  updateTimer();
  gIntervals.timerId = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(gIntervals.timerId);
  gIntervals.timerId = null;
}

function updateTimer() {
  gGame.secsPassed++;
  renderTimer();
}

function updateMinesCount() {
  if (!gLevel.mines && !gGame.markedCount) {
    gLevel.mines = Math.floor(gLevel.size ** 2 * 0.16);
    renderMinesCount();
    return;
  }

  renderMinesCount();
}

function setActive(level) {
  const btns = document.querySelectorAll('.difficulty-btn');
  btns.forEach((btn) => {
    const btnLevel = btn.innerText.split(' ')[0];
    if (btnLevel.toLowerCase() === level) btn.classList.add('active');
    else {
      btn.classList.remove('active');
    }
  });
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      countMinesAround({ i, j }, board);
    }
  }
}

function placeBombs(size, board) {
  for (var i = 0; i < size; i++) {
    const cell = getRandomCell(gBoard);
    const cellPos = { i: cell.i, j: cell.j };
    board[cellPos.i][cellPos.j].isMine = true;
    console.log(cell);
  }
}

function getRandomCell() {
  const emptyCells = getCells(gBoard);
  const length = emptyCells.length;
  if (!emptyCells.length) return;

  const randomIdx = getRandomIntInclusive(0, length - 1);
  return emptyCells[randomIdx];
}

function getCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const cell = board[i][j];
      if (cell.isMine) continue;
      if (cell.isRevealed) continue;
      emptyCells.push({
        i,
        j,
      });
    }
  }
  console.log(emptyCells.length);
  return emptyCells;
}

function getPos(el) {
  const elClasses = el.className.split(' ');
  const i = +elClasses[1].split('-')[1];
  const j = +elClasses[1].split('-')[2];
  return { i, j };
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function revealMines(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const cell = board[i][j];
      if (cell.isMine) {
        const cellEl = document.querySelector(`.cell-${i}-${j}`);
        cell.isRevealed = true;
        cellEl.classList.add('revealed');
        cellEl.classList.add('mine-hit');
        renderCell({ i, j }, BOMB);
      }
    }
  }
}

function revealCell(cell, el) {
  cell.isRevealed = true;
  el.classList.add('revealed');

  if (cell.minesAroundCount > 0) {
    el.innerText = cell.minesAroundCount;
  }
}

function countMinesAround({ i, j }, board) {
  for (var x = i - 1; x <= i + 1; x++) {
    if (x < 0 || x > board.length - 1) continue;
    for (var y = j - 1; y <= j + 1; y++) {
      if (y < 0 || y > board[x].length - 1) continue;
      if (x === i && y === j) continue;
      const cell = board[x][y];

      if (cell.isMine) {
        board[i][j].minesAroundCount++;
      }
    }
  }
}

function expandReveal(board, i, j) {
  if (!gGame.revealedCount) gGame.revealedCount++;

  for (var x = i - 1; x <= i + 1; x++) {
    if (x < 0 || x > board.length - 1) continue;
    for (var y = j - 1; y <= j + 1; y++) {
      if (y < 0 || y > board[0].length - 1) continue;
      const cell = board[x][y];
      if (cell.isMine || cell.isRevealed) continue;
      const currCellEl = document.querySelector(`.cell-${x}-${y}`);
      console.log(gGame.revealedCount);
      cell.isRevealed = true;
      gGame.revealedCount++;
      currCellEl.classList.add('revealed');
      if (board[x][y].minesAroundCount > 0) {
        currCellEl.innerText = board[x][y].minesAroundCount;
      }
    }
  }
}

function checkGameOver(status) {
  const smileyEl = document.querySelector('.smiley');

  if (status === 'winner') {
    smileyEl.innerText = WINNER;
    showMessage('win');
  } else {
    smileyEl.innerText = LOOSE;
    showMessage('loose');
  }
  stopTimer();
}

function showMessage(status) {
  const message = document.querySelector('.message');
  if (status === 'loose') {
    message.innerText = 'You lost 😔. Try again! 💪';
  } else {
    message.innerText = '🎉🎉🎉You won!🎉🎉🎉';
  }
}

function formateNum(num) {
  return String(num).padStart(3, '0');
}

function restart() {
  const message = document.querySelector('.message');
  const smileyEl = document.querySelector('.smiley');
  const size = gLevel.size;
  const gameLevel = gLevel.level;

  message.innerText = '';
  smileyEl.innerText = SMILEY;

  if (gIntervals.timerId) {
    stopTimer();
  }

  gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
  };

  gIntervals.timerId = null;
  gLevel.mines = 0;
  gGame.secsPassed = 0;

  gBoard = buildBoard(size);
  renderBoard(gBoard, gameLevel);
  renderMinesCount(gLevel.mines);
  renderTimer();
}
