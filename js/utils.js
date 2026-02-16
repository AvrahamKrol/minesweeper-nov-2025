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

function renderBestTime() {
  const time = document.querySelector('.time');
  console.log(gLevel.level);
  gGame.bestTime = JSON.parse(localStorage.getItem(`${gLevel.level}`)) || '';
  console.log(gGame.bestTime);
  time.innerText = gGame.bestTime ? gGame.bestTime + ' sec' : '';
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
      const currCell = board[x][y];
      if (currCell.isMine || currCell.isRevealed) continue;
      const currCellEl = document.querySelector(`.cell-${x}-${y}`);
      currCell.isRevealed = true;
      gGame.revealedCount++;
      currCellEl.classList.add('revealed');
      if (currCell.minesAroundCount > 0) {
        currCellEl.innerText = currCell.minesAroundCount;
      } else if (currCell.minesAroundCount === 0) {
        for (var k = x - 1; k <= x + 1; k++) {
          if (k < 0 || k > board.length - 1) continue;
          for (var z = y - 1; z <= y + 1; z++) {
            if (z < 0 || z > board[0].length - 1) continue;
            const currCell = board[k][z];
            if (currCell.isMine || currCell.isRevealed) continue;
            const currCellEl = document.querySelector(`.cell-${k}-${z}`);
            currCell.isRevealed = true;
            gGame.revealedCount++;
            currCellEl.classList.add('revealed');
            if (currCell.minesAroundCount > 0) {
              currCellEl.innerText = currCell.minesAroundCount;
            }
          }
        }
      }
    }
  }
}

// function recurseExpandReveal(board, i, j) {
//   for (var x = 0; x < board.length; x++) {
//     for (var y = 0; y < board[0].length; y++) {
//       expandReveal(board, i, j);
//       const cell = board[x][j];
//       if (cell.minesAroundCount === 0) {
//         expandReveal(board, x, y);
//       }
//     }
//   }
// }

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

function saveBestTime(level) {
  switch (level) {
    case 'easy':
      localStorage.setItem('easy', JSON.stringify(gGame.secsPassed));
      break;
    case 'medium':
      localStorage.setItem('medium', JSON.stringify(gGame.secsPassed));
      break;
    case 'hard':
      localStorage.setItem('hard', JSON.stringify(gGame.secsPassed));
    default:
      return;
  }
}

function formateNum(num) {
  return String(num).padStart(3, '0');
}

function restart() {
  const message = document.querySelector('.message');
  const smileyEl = document.querySelector('.smiley');

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

  onInit();
  renderMinesCount(gLevel.mines);
  renderTimer();
  renderBestTime();
}
