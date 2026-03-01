'use strict';

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
      board[i][j].minesAroundCount = 0;
      countMinesAround({ i, j }, board);
    }
  }
}

function getRandomCellPos(isSafe = false) {
  if (isSafe) {
    gGame.safeCells = getEmptyCellsPosns(gBoard, isSafe);
    if (gGame.safeCells.length === 0) return;
    const length = gGame.safeCells.length;
    const randomIdx = getRandomIntInclusive(0, length - 1);
    return gGame.safeCells[randomIdx];
  } else {
    const emptyCells = getEmptyCellsPosns(gBoard);
    if (emptyCells.length === 0) return;
    const length = emptyCells.length;
    const randomIdx = getRandomIntInclusive(0, length - 1);
    return emptyCells[randomIdx];
  }
}

function getEmptyCellsPosns(board) {
  const emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const cell = board[i][j];
      if (cell.isMine) continue;
      if (cell.isRevealed) continue;
      if (cell.isMarked) continue;
      emptyCells.push({ i, j });
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

function placeMines(size, board, terminated) {
  if (terminated) {
    for (var i = 0; i < gGame.minesPosns.length; i++) {
      const cellPos = { i: gGame.minesPosns[i].i, j: gGame.minesPosns[i].j };
      board[cellPos.i][cellPos.j].isMine = true;
      renderCell(cellPos, BOMB);
    }
  } else {
    for (var i = 0; i < size; i++) {
      const cellPos = getRandomCellPos();
      gGame.minesPosns.push(cellPos);
      board[cellPos.i][cellPos.j].isMine = true;
    }
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
  if (gGame.isOn) gGame.revealedCount++;
  if (cell.minesAroundCount > 0) {
    el.innerText = cell.minesAroundCount;
    el.dataset.number = el.innerText;
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
  if (!gGame.revealedCount) {
    gGame.revealedCount++;
    return;
  }

  gHintCells = [];

  for (var x = i - 1; x <= i + 1; x++) {
    if (x < 0 || x > board.length - 1) continue;
    for (var y = j - 1; y <= j + 1; y++) {
      if (y < 0 || y > board[0].length - 1) continue;
      const currCell = board[x][y];
      if (currCell.isRevealed || currCell.isMarked) continue;
      if (!currCell.isRevealed) {
        gHintCells.push({ i: x, j: y });
      }
      const currCellEl = document.querySelector(`.cell-${x}-${y}`);
      currCell.isRevealed = true;
      currCellEl.classList.add('revealed');

      if (currCell.minesAroundCount > 0) {
        currCellEl.innerText = currCell.minesAroundCount;
        currCellEl.dataset.number = currCellEl.innerText;
      }
      if (currCell.isMine) {
        currCellEl.classList.add('mine-hit');
        renderCell({ i: x, j: y }, BOMB);
      }

      if (!gIsHint) {
        gGame.revealedCount++;
        if (currCell.minesAroundCount > 0) {
          currCellEl.innerText = currCell.minesAroundCount;
          currCellEl.dataset.number = currCellEl.innerText;
        } else if (currCell.minesAroundCount === 0) {
          expandReveal(gBoard, x, y);
        }
      }
    }
  }
}

function expandRevealArea(board, startRow, endRow, startCol, endCol) {
  gHintCells = [];
  for (var x = startRow; x <= endRow; x++) {
    for (var y = startCol; y <= endCol; y++) {
      const currCell = board[x][y];
      if (currCell.isRevealed || currCell.isMarked) continue;
      // if (!currCell.isRevealed) {
      gHintCells.push({ i: x, j: y });
      // }
      const currCellEl = document.querySelector(`.cell-${x}-${y}`);
      currCell.isRevealed = true;
      currCellEl.classList.add('revealed');

      if (currCell.minesAroundCount > 0) {
        currCellEl.innerText = currCell.minesAroundCount;
        currCellEl.dataset.number = currCellEl.innerText;
      }
      if (currCell.isMine) {
        currCellEl.classList.add('mine-hit');
        renderCell({ i: x, j: y }, BOMB);
      }
    }
  }
}

function hideReveal(cellEl, i, j) {
  if (gIsSafe) {
    for (var x = 0; x < gGame.safeCells.length; x++) {
      const pos = gGame.safeCells[x];
      const currCell = gBoard[pos.i][pos.j];
      const currCellEl = document.querySelector(`.cell-${pos.i}-${pos.j}`);
      currCell.isRevealed = false;
      currCellEl.classList.remove('empty');
    }
    // gIsSafe = false;
  }
  if (gIsHint || gMega.isMega) {
    for (var x = 0; x < gHintCells.length; x++) {
      const pos = gHintCells[x];
      const currCell = gBoard[pos.i][pos.j];
      if (currCell.isMarked) continue;
      const currCellEl = document.querySelector(`.cell-${pos.i}-${pos.j}`);
      currCell.isRevealed = false;
      currCellEl.classList.remove('revealed', 'selected-1', 'selected-2');
      currCellEl.innerText = '';
      if (currCell.isMine) {
        currCellEl.classList.remove('mine-hit');
        renderCell({ i: pos.i, j: pos.j }, '');
      }
    }
    gIsHint = false;
    gMega.isMega = false;
    gHintCells = [];
  } else {
    const cell = gBoard[i][j];
    if (!cell.isMine && !gIsSafe) {
      gGame.revealedCount--;
    }

    cellEl.classList.remove('mine-hit');
    cellEl.classList.remove('revealed');
    cell.isRevealed = false;
    renderCell({ i, j }, '');
  }
  gIsSafe = false;
}

function checkGameOver() {
  const smileyEl = document.querySelector('.smiley-icon');
  const totalCells = getTotalSafeCells();

  if (gGame.revealedCount === totalCells - gLevel.mines) {
    smileyEl.innerText = WINNER;
    showMessage();
    if (!gGame.bestTime || gGame.secsPassed < gGame.bestTime) {
      saveBestTime(gLevel.level);
      renderBestTime();
    }
    endGame();
    return;
  }

  if (gGame.lives === 0) {
    smileyEl.innerText = LOOSE;
    showMessage('lose');
    endGame();
    return;
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
    minesPosns: [],
    markedCellPosns: [],
    safeCells: [],
  };

  gMega = {
    isMega: false,
    firstCell: {},
    secondCell: {},
    count: 0,
  };

  gIntervals.timerId = null;
  gLevel.mines = 0;
  gGame.secsPassed = 0;
  gGame.hintsCount = 3;

  onInit();
  renderFlagsCount();
  renderTimer();
  renderBestTime();
}
