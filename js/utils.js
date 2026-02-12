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

function renderTimer(count) {
  const timer = document.querySelector('.timer-counter');
  timer.innerText = count;
}

function renderMinesCount() {
  const minesCounter = document.querySelector('.mines-counter');
  const remaining = gLevel.mines - gGame.markedCount;
  const formattedMinesCount = formateNum(remaining);
  minesCounter.innerText = formattedMinesCount;
}

function renderCell(pos, value) {
  const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
  elCell.innerHTML = value;
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
  const formattedCount = formateNum(gGame.secsPassed);
  renderTimer(formattedCount);
}

function updateMinesCount() {
  if (!gLevel.mines && !gGame.markedCount) {
    gLevel.mines = Math.floor(gLevel.size ** 2 * 0.16);
    renderMinesCount();
    return;
  }

  renderMinesCount();

  // if (gLevel.mines) {
  //   gLevel.mines--;
  // } else {
  //   gLevel.mines++;
  //   renderMinesCount();
  // }
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

function setBombs(size) {
  for (var k = 0; k < size; k++) {
    const cell = getRandomCell(gBoard);
    cell.cell.isMine = true;
    console.log(cell);
  }
}

function getRandomCell() {
  const emptyCells = getCells(gBoard);
  if (!emptyCells.length) return;

  const length = emptyCells.length;
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
        cell: gBoard[i][j],
      });
    }
  }
  return emptyCells;
}

function getPos(el) {
  const elClasses = el.className.split(' ');
  const i = elClasses[1].split('-')[1];
  const j = elClasses[1].split('-')[2];
  return { i, j };
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formateNum(num) {
  return String(num).padStart(3, '0');
}

function restart() {
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
  renderMinesCount(gLevel.mines);
}
