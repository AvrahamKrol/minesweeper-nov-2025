'use strict';

const EASY = 4;
const MEDIUM = 8;
const HARD = 12;
const FLAG = '🚩';
const BOMB = '💣';
const SMILEY = '😊';
const LOOSE = '🤕';
const WINNER = '😎';

var gBoard;
var gIsHint = false;
var gIsMega = false;
var gHintCells = [];

var gGame = {
  isOn: false,
  revealedCount: 0,
  hintsCount: 3,
  markedCount: 0,
  secsPassed: 0,
  bestTime: null,
  lives: 3,
  minesPosns: [],
  markedCellPosns: [],
};

var gMega = {
  isMega: false,
  firstCell: {},
  secondCell: {},
  count: 0,
};

const gHistoryState = [];
const gLevel = {
  level: 'medium',
  size: MEDIUM,
  mines: 0,
};

const gIntervals = {
  timerId: null,
};

function onInit() {
  renderBestTime();
  renderHints(gGame.hintsCount);
  gBoard = buildBoard(gLevel.size);
  renderBoard(gBoard, gLevel.level);
  renderLives();
  // saveBoardState(gBoard, gGame);
}

function buildBoard(size) {
  const board = [];
  for (var i = 0; i < size; i++) {
    board.push([]);
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        renderFlagsCount: 0,
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  return board;
}

function onCellClicked(el, ev, i, j) {
  if (!gMega.isMega) {
    // *to disable on Mac when clicked on touch pad as a right click
    if (ev.button !== 0) return;

    // *Forbid to click on cells after game is over
    if (!gGame.isOn && gGame.revealedCount) return;

    const cell = gBoard[i][j];

    if (cell.isMarked) return;

    if (!cell.isRevealed) {
      // First start
      if (!gGame.isOn) {
        //*if not here than mine may be placed on the first clicked cell
        revealCell(cell, el);

        gGame.isOn = true;
        startTimer();
        updateFlagsCount();
        const size = gLevel.mines;
        placeMines(size, gBoard);
        setMinesNegsCount(gBoard);
        renderMinesCount();
      }

      if (gIsHint) {
        expandReveal(gBoard, i, j);
        setTimeout(() => hideReveal(el), 1500);
        return;
        // *when  cell is empty reveal all empty cells
      } else if (cell.minesAroundCount === 0 && !cell.isMine) {
        expandReveal(gBoard, i, j);
        // saveBoardState(gBoard, gGame);
      } else {
        revealCell(cell, el);
        gGame.revealedCount++;
        // saveBoardState(gBoard, gGame);
      }
      //*check if won
      if (gGame.revealedCount + gGame.markedCount === gBoard.length ** 2) {
        checkGameOver('winner');
        if (!gGame.bestTime) {
          saveBestTime(gLevel.level);
          renderBestTime();
        } else if (gGame.secsPassed < gGame.bestTime) {
          saveBestTime(gLevel.level);
          renderBestTime();
        }
      }
    }
    if (cell.isMine) {
      if (gIsHint) return;
      gGame.lives--;
      renderLives();
      el.classList.add('mine-hit');
      renderCell({ i, j }, BOMB);
      if (gGame.lives !== 0) {
        setTimeout(() => hideReveal(el, i, j), 1500);
      }
      if (gGame.lives === 0) {
        revealMines(gBoard);
        checkGameOver();
      }
    }
    console.log(gGame.revealedCount);
  } else {
    if (gMega.count === 0) {
      el.classList.add('selected-1');
      ((gMega.firstCell.i = i), (gMega.firstCell.j = j), gMega.count++);
    } else {
      el.classList.add('selected-2');
      ((gMega.secondCell.i = i), (gMega.secondCell.j = j));
      const startRow = gMega.firstCell.i;
      const endRow = gMega.secondCell.i;
      const startCol = gMega.firstCell.j;
      const endCol = gMega.secondCell.j;
      expandRevealArea(gBoard, startRow, endRow, startCol, endCol);
      setTimeout(() => hideReveal(el), 1500);
    }
  }
}

function onCellMarked(el, ev, i, j) {
  ev.preventDefault();
  var markedCellIdx;
  // *let to add flags only after game started
  if (!gGame.isOn && gGame.revealedCount) return;

  const cell = gBoard[i][j];
  const isMarked = cell.isMarked;

  if (cell.isRevealed) return;

  //* let to add flags only if quantity of flags is not bigger than quantity of mines
  if (!isMarked && gLevel.mines - gGame.markedCount !== 0) {
    cell.isMarked = true;
    gGame.markedCount++;
    markedCellIdx = findMarkedIdx(i, j, true);
    var markedCellPosns = gGame.minesPosns.splice(markedCellIdx, 1)[0];
    gGame.markedCellPosns.push(markedCellPosns);

    renderCell({ i, j }, FLAG);
    updateFlagsCount();
    setMinesNegsCount(gBoard);
    if (gGame.revealedCount + gGame.markedCount === gBoard.length ** 2) {
      checkGameOver('winner');
      if (!gGame.bestTime) {
        saveBestTime(gLevel.level);
        renderBestTime();
      } else if (gGame.secsPassed < gGame.bestTime) {
        saveBestTime(gLevel.level);
        renderBestTime();
      }
    }
  } else if (isMarked && gLevel.mines) {
    cell.isMarked = false;
    gGame.markedCount--;

    if (gGame.markedCellPosns.length > 0) {
      markedCellIdx = findMarkedIdx(i, j);
      gGame.minesPosns.push(gGame.markedCellPosns[markedCellIdx]);
      gGame.markedCellPosns.splice(markedCellIdx, 1);
    }
    renderCell({ i, j }, '');
    updateFlagsCount();
    setMinesNegsCount(gBoard);
  }
}

function onSetLevel(el) {
  if (!el) return;

  const prevLevel = gLevel.level;

  const level = el.innerText.split(' ')[0].toLowerCase();

  switch (level) {
    case 'easy':
      gLevel.level = 'easy';
      gLevel.size = EASY;
      break;
    case 'medium':
      gLevel.level = 'medium';
      gLevel.size = MEDIUM;
      break;
    case 'hard':
      gLevel.level = 'hard';
      gLevel.size = HARD;
      break;
    default:
      return null;
  }

  if (prevLevel === gLevel.level) return;
  const gameLevel = gLevel.level;
  setActive(gameLevel);
  restart();
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

function onIsMega(el) {
  if (!gGame.isOn) return;
  gMega.isMega = true;
  el.classList.add('hidden');
}

function onTerminateMines(el) {
  if (!gGame.isOn) return;
  if (!gGame.minesPosns.length === 0) return;
  const minesPosns = gGame.minesPosns;
  for (var i = 0; i < 3; i++) {
    const length = minesPosns.length;
    const randomIdx = getRandomIntInclusive(0, length - 1);
    const cellPos = minesPosns[randomIdx];
    const cell = gBoard[cellPos.i][cellPos.j];
    if (!cell.isMarked) {
      cell.isMine = false;
      renderCell(cellPos, '');
      minesPosns.splice(randomIdx, 1);
    }
  }
  gLevel.mines = gGame.minesPosns.length + gGame.markedCellPosns.length;
  renderMinesCount();
  updateFlagsCount();
  setMinesNegsCount(gBoard);
  renderCellsAfterTerminate(gBoard);
  el.classList.add('hidden');
}
