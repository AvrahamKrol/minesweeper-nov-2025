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
var gEmptyCellsCount;

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

const gLevel = {
  level: 'easy',
  size: EASY,
  mines: 0,
};

const gIntervals = {
  timerId: null,
};

function onInit() {
  console.log('Game isOn:', gGame.isOn);
  gBoard = buildBoard(gLevel.size);
  renderBoard(gBoard, gLevel.level);
}

function buildBoard(size) {
  const board = [];
  for (var i = 0; i < size; i++) {
    board.push([]);
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 4,
        isRevealed: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  return board;
}

function onCellClicked(el, ev) {
  if (ev.button !== 0) return;
  const pos = getPos(el);
  const cell = gBoard[pos.i][pos.j];

  if (cell.isMarked) return;

  if (!cell.isRevealed) {
    cell.isRevealed = true;
    el.classList.add('revealed');

    if (!gGame.isOn) {
      gGame.isOn = true;
      startTimer();
      updateMinesCount();
      const size = gLevel.mines;
      placeBombs(size, gBoard);
    }
    gGame.revealedCount++;
    console.log(gEmptyCellsCount);
    console.log('gGame.revealedCount: ', gGame.revealedCount);

    if (gEmptyCellsCount === gGame.revealedCount) gameOver('winner');
  }
  if (cell.isRevealed && cell.isMine) {
    el.classList.add('mine-hit');
    renderCell(pos, BOMB);
    revealMines(gBoard);
    gameOver();
  }
}

function onCellMarked(el, ev) {
  ev.preventDefault();

  const pos = getPos(el);
  const cell = gBoard[pos.i][pos.j];
  const isMarked = cell.isMarked;

  if (cell.isRevealed) return;

  if (!isMarked && gLevel.mines - gGame.markedCount !== 0) {
    cell.isMarked = true;
    gGame.markedCount++;
    renderCell(pos, FLAG);
    updateMinesCount();
  } else if (isMarked && gLevel.mines) {
    cell.isMarked = false;
    gGame.markedCount--;
    renderCell(pos, '');
    updateMinesCount();
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
