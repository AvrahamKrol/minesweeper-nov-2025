'use strict';

function renderBoard(board, level) {
  var str = `<table class="board ${level}">`;
  for (var i = 0; i < board.length; i++) {
    str += '<tr class="row">';
    for (var j = 0; j < board[0].length; j++) {
      str += `<td class="cell cell-${i}-${j}" oncontextmenu="return false;" onmousedown="onCellClicked(this, event)"></td>`;
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
