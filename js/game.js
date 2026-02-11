'use strict';

const EASY = 4;
const MEDIUM = 8;
const HARD = 12;

var gBoard;
var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
var gLevel = {
  level: 'easy',
  size: EASY,
  mines: 2,
};

function onInit() {
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

function onSetLevel(el) {
  if (!el) return;

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

  const size = gLevel.size;
  const gameLevel = gLevel.level;

  setActive(gLevel.level);
  gBoard = buildBoard(size);
  renderBoard(gBoard, gameLevel);
}
