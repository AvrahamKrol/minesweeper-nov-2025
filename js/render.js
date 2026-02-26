'use strict';

function renderBoard(board, level) {
  var str = `<table class="board ${level}">`;
  for (var i = 0; i < board.length; i++) {
    str += '<tr class="row">';
    for (var j = 0; j < board[0].length; j++) {
      const isRevealed = board[i][j].isRevealed;
      const minesAroundCount = board[i][j].minesAroundCount;
      const minesCount =
        isRevealed && minesAroundCount > 0 ? minesAroundCount : '';
      str += `<td class="cell cell-${i}-${j} ${isRevealed ? 'revealed' : ''}" oncontextmenu="onCellMarked(this,event, ${i}, ${j});" 
      onmousedown="onCellClicked(this,event, ${i}, ${j})" data-number=${minesCount}>${minesCount}</td>`;
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

function renderCellsAfterTerminate(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const currCellEl = document.querySelector(`.cell-${i}-${j}`);
      const currCell = board[i][j];
      if (!currCell.isMine && !currCell.isMarked && currCell.isRevealed) {
        if (currCell.minesAroundCount === 0) {
          currCellEl.innerText = '';
        } else {
          currCellEl.innerText = currCell.minesAroundCount;
          currCellEl.dataset.number = currCellEl.innerText;
        }
      }
    }
  }
}

function renderTimer() {
  const timer = document.querySelector('.timer-counter');
  const formattedCount = formateNum(gGame.secsPassed);
  timer.innerText = formattedCount;
}

function renderFlagsCount() {
  const flagsCount = document.querySelector('.mines-counter');
  const remaining = gLevel.mines - gGame.markedCount;
  if (remaining < 0) remaining = 0;
  const formattedMinesCount = formateNum(remaining);
  flagsCount.innerText = formattedMinesCount;
}

function renderMinesCount() {
  const minesCount = document.querySelector('.mines');
  minesCount.innerText = gLevel.mines;
}

function renderBestTime() {
  const time = document.querySelector('.time');
  gGame.bestTime = JSON.parse(localStorage.getItem(`${gLevel.level}`)) || '';
  time.innerText = gGame.bestTime ? gGame.bestTime + ' sec' : '';
}

function renderLives() {
  const lives = document.querySelector('.lives-count');
  const mines = getMinesCount();
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
