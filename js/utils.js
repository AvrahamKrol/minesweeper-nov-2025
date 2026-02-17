'use strict';

function renderBoard(board, level) {
  var str = `<table class="board ${level}">`;
  for (var i = 0; i < board.length; i++) {
    str += '<tr class="row">';
    for (var j = 0; j < board[0].length; j++) {
      // const isRevealed = board[i][j].isRevealed ? 'revealed' : '';
      str += `<td class="cell cell-${i}-${j}" oncontextmenu="onCellMarked(this,event, ${i}, ${j});" onmousedown="onCellClicked(this,event, ${i}, ${j})"></td>`;
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
  gGame.bestTime = JSON.parse(localStorage.getItem(`${gLevel.level}`)) || '';
  time.innerText = gGame.bestTime ? gGame.bestTime + ' sec' : '';
}

function renderLives() {
  const lives = document.querySelector('.lives-count');
  const mines = getMinesCount();
  console.log('mines:', mines);
  if (gGame.lives > mines) {
    lives.innerText = mines;
    gGame.lives = mines;
  } else {
    lives.innerText = gGame.lives;
  }
}

function renderHints(size) {
  const hintsEl = document.querySelector('.controls.hints');
  hintsEl.innerHTML = null;
  if (size === 0) hintsEl.classList.add('hidden');
  if (size !== 0) hintsEl.classList.remove('hidden');
  for (var i = 0; i < size; i++) {
    hintsEl.innerHTML += '<span>💡</span>';
  }
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
    gLevel.mines = getMinesCount();
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

function getMinesCount() {
  return Math.floor(gLevel.size ** 2 * 0.16);
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeMines(size, board) {
  for (var i = 0; i < size; i++) {
    const cell = getRandomCell(gBoard);
    const cellPos = { i: cell.i, j: cell.j };
    console.log(cellPos);
    board[cellPos.i][cellPos.j].isMine = true;
  }
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
  //* if it's a first click
  if (!gGame.revealedCount) gGame.revealedCount++;

  for (var x = i - 1; x <= i + 1; x++) {
    if (x < 0 || x > board.length - 1) continue;
    for (var y = j - 1; y <= j + 1; y++) {
      if (y < 0 || y > board[0].length - 1) continue;
      const currCell = board[x][y];
      if (currCell.isRevealed || currCell.isMarked) continue;
      const currCellEl = document.querySelector(`.cell-${x}-${y}`);
      currCell.isRevealed = true;
      currCellEl.classList.add('revealed');

      if (currCell.minesAroundCount > 0) {
        currCellEl.innerText = currCell.minesAroundCount;
      }
      if (currCell.isMine) {
        currCellEl.classList.add('mine-hit');
        renderCell({ i: x, j: y }, BOMB);
      }

      if (!gIsHint) {
        gGame.revealedCount++;
        if (currCell.minesAroundCount > 0) {
          currCellEl.innerText = currCell.minesAroundCount;
        } else if (currCell.minesAroundCount === 0) {
          expandReveal(gBoard, x, y);
        }
      }
    }
  }
}

function hideReveal(cellEl, pos) {
  if (gIsHint) {
    for (var x = pos.i - 1; x <= pos.i + 1; x++) {
      if (x < 0 || x > gBoard.length - 1) continue;
      for (var y = pos.j - 1; y <= pos.j + 1; y++) {
        if (y < 0 || y > gBoard[0].length - 1) continue;
        const currCell = gBoard[x][y];
        //! if(currCell.isRevealed) continue - then opened cell do not close
        //! but if no to use it then it closes even cells that were opened
        //! before that
        if (currCell.isMarked) continue;
        const currCellEl = document.querySelector(`.cell-${x}-${y}`);
        currCell.isRevealed = false;
        currCellEl.classList.remove('revealed');
        currCellEl.innerText = '';
        if (currCell.isMine) {
          currCellEl.classList.remove('mine-hit');
          renderCell({ i: x, j: y }, '');
        }
      }
    }
    gIsHint = false;
  } else {
    gGame.revealedCount--;
    cellEl.classList.remove('mine-hit');
    cellEl.classList.remove('revealed');
    gBoard[pos.i][pos.j].isRevealed = false;
    renderCell(pos, '');
    console.log(gGame.revealedCount);
  }
}

function checkGameOver(status) {
  const smileyEl = document.querySelector('.smiley-icon');

  if (status === 'winner') {
    smileyEl.innerText = WINNER;
    showMessage('win');
  } else {
    smileyEl.innerText = LOOSE;
    showMessage('loose');
  }
  stopTimer();
  gGame.isOn = false;
}

function showMessage(status) {
  const message = document.querySelector('.message');
  if (status === 'loose') {
    message.innerText = 'You lost 😔. Try again! 💪';
  } else {
    message.innerText = '🎉🎉🎉 You won! 🎉🎉🎉';
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

function onGiveHint(el) {
  //* not allowed before the start of game
  if (!gGame.isOn) return;

  const inner = el.innerText.toLowerCase();
  gIsHint = true;
  if (inner !== 'mega hint') {
    gGame.hintsCount--;
    renderHints(gGame.hintsCount);
  } else {
    el.classList.add('hidden');
  }
}

function restart() {
  const message = document.querySelector('.message');
  const smileyIconEl = document.querySelector('.smiley-icon');
  const megaHintEl = document.querySelector('.controls.mega-hint');

  message.innerText = '';
  smileyIconEl.innerText = SMILEY;
  megaHintEl.classList.remove('hidden');

  if (gIntervals.timerId) {
    stopTimer();
  }

  gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    bestTime: null,
    lives: 3,
  };

  gIntervals.timerId = null;
  gLevel.mines = 0;
  gGame.secsPassed = 0;
  gGame.hintsCount = 3;

  onInit();
  renderMinesCount(gLevel.mines);
  renderTimer();
  renderBestTime();
}
