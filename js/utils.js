'use strict';

function renderBoard(board, level) {
  var str = `<table class="board ${level}">`;
  for (var i = 0; i < board.length; i++) {
    str += '<tr class="row">';
    for (var j = 0; j < board[0].length; j++) {
      str += `<td class="cell cell-${i}-${j}" onclick="onCellClicked(this, event)"></td>`;
    }
  }
  str += '</table>';

  const container = document.querySelector('.board-container');
  container.innerHTML = str;
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

function getPos(el) {
  const elClasses = el.className.split(' ');
  const i = elClasses[1].split('-')[1];
  const j = elClasses[1].split('-')[2];
  return { i, j };
}
