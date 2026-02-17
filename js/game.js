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
var gHintCells = [];

var gGame = {
  isOn: false,
  revealedCount: 0,
  hintsCount: 3,
  markedCount: 0,
  secsPassed: 0,
  bestTime: null,
  lives: 3,
};

const gHistoryState = [];
const gLevel = {
  level: 'easy',
  size: EASY,
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
  ev.preventDefault();
  // *Forbid to click on cells after game is over
  if (!gGame.isOn && gGame.revealedCount) return;

  // *to disable on Mac when clicked on touch pad as a right click
  if (ev.button !== 0) return;

  const cell = gBoard[i][j];

  if (cell.isMarked) return;

  if (!cell.isRevealed) {
    // First start
    if (!gGame.isOn) {
      //*if not here than mine may be placed on the first clicked cell
      revealCell(cell, el);

      gGame.isOn = true;
      startTimer();
      updateMinesCount();
      const size = gLevel.mines;
      placeMines(size, gBoard);
      setMinesNegsCount(gBoard);
    }
    if (gIsHint) {
      expandReveal(gBoard, i, j);
      setTimeout(() => hideReveal(el, { i, j }), 1500);
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
      setTimeout(() => hideReveal(el, { i, j }), 1500);
    }
    if (gGame.lives === 0) {
      revealMines(gBoard);
      checkGameOver();
    }
  }
  console.log(gGame.revealedCount);
}

function onCellMarked(el, ev, i, j) {
  ev.preventDefault();
  // *let to add flags only after game started
  if (!gGame.isOn && gGame.revealedCount) return;

  const cell = gBoard[i][j];
  const isMarked = cell.isMarked;

  if (cell.isRevealed) return;

  //* let to add flags only if quantity of flags is not bigger than quantity of mines
  if (!isMarked && gLevel.mines - gGame.markedCount !== 0) {
    cell.isMarked = true;
    gGame.markedCount++;
    renderCell({ i, j }, FLAG);
    updateMinesCount();
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
    renderCell({ i, j }, '');
    updateMinesCount();
  }
  console.log(gGame.revealedCount);
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
