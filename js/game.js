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
var gState;
var gPrevBoardState = [];
var gIsHint = false;
var gIsSafe = false;
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
  safeCells: [],
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
  gState = {
    board: structuredClone(gBoard),
    revealedCount: gGame.revealedCount,
    hintsCount: gGame.hintsCount,
    markedCount: gGame.markedCount,
    secsPassed: gGame.secsPassed,
    lives: gGame.lives,
    minesPosns: gGame.minesPosns,
    markedCellPosns: gGame.markedCellPosns,
    safeCells: gGame.safeCells,
  };
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
  console.log('gState:', gState);

  if (!gMega.isMega) {
    // *to disable on Mac when clicked on touch pad as a right click
    if (ev.button !== 0) return;

    // *Forbid to click on cells after game is over
    if (!gGame.isOn && gGame.revealedCount) return;

    const cell = gBoard[i][j];

    if (cell.isMarked) return;

    if (gIsHint) {
      expandReveal(gBoard, i, j);
      setTimeout(() => hideReveal(el), 1500);
      return;
    }

    if (!cell.isRevealed && !cell.isMine) {
      // if (gIntervals.safeTimer) {
      //   clearInterval(gIntervals.safeTimer);
      // }
      // *First start
      if (!gGame.isOn) {
        revealCell(cell, el);

        gGame.isOn = true;
        startTimer();
        updateFlagsCount();
        const size = gLevel.mines;
        placeMines(size, gBoard);
        setMinesNegsCount(gBoard);
        renderMinesCount();
      }
      //* save state on each new click
      gState = {
        board: structuredClone(gBoard),
        revealedCount: gGame.revealedCount,
        hintsCount: gGame.hintsCount,
        markedCount: gGame.markedCount,
        secsPassed: gGame.secsPassed,
        lives: gGame.lives,
        minesPosns: gGame.minesPosns,
        markedCellPosns: gGame.markedCellPosns,
        safeCells: gGame.safeCells,
      };

      // *when  cell is empty reveal all empty cells
      if (cell.minesAroundCount === 0 && !cell.isMine) {
        gPrevBoardState.push(gState);
        expandReveal(gBoard, i, j);
      } else {
        revealCell(cell, el);
        gPrevBoardState.push(gState);
        gGame.revealedCount++;
      }
      //*check if won
      console.log('revealedCount:', gGame.revealedCount);
      checkGameOver();
      if (!gGame.bestTime) {
        saveBestTime(gLevel.level);
        renderBestTime();
      } else if (gGame.secsPassed < gGame.bestTime) {
        saveBestTime(gLevel.level);
        renderBestTime();
      }
    }
    if (cell.isMine) {
      if (gIsHint) return;
      gPrevBoardState.push(gState);
      gGame.lives--;
      renderLives();
      el.classList.add('mine-hit');
      renderCell({ i, j }, BOMB);
      if (gGame.lives !== 0) {
        setTimeout(() => hideReveal(el, i, j), 1500);
      }
      if (gGame.lives === 0) {
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
  // gPrevBoardState = state;
  const cell = gBoard[i][j];
  const isMarked = cell.isMarked;

  if (cell.isRevealed) return;

  //* let to add flags only if quantity of flags is not bigger than quantity of mines
  if (!isMarked && gLevel.mines - gGame.markedCount !== 0) {
    cell.isMarked = true;
    gGame.markedCount++;
    markedCellIdx = findIdx(i, j, 'mines');
    gGame.markedCellPosns.push(gGame.minesPosns.splice(markedCellIdx, 1)[0]);

    renderCell({ i, j }, FLAG);
    updateFlagsCount();
    setMinesNegsCount(gBoard);
    checkGameOver();
    if (!gGame.bestTime) {
      saveBestTime(gLevel.level);
      renderBestTime();
    } else if (gGame.secsPassed < gGame.bestTime) {
      saveBestTime(gLevel.level);
      renderBestTime();
    }
  } else if (isMarked && gLevel.mines) {
    cell.isMarked = false;
    gGame.markedCount--;

    if (gGame.markedCellPosns.length > 0) {
      markedCellIdx = findIdx(i, j);
      gGame.minesPosns.push(gGame.markedCellPosns.splice(markedCellIdx, 1));
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

function onSafeClick() {
  if (gGame.isOn) {
    console.log('safeCells:', gGame.safeCells);
    gIsSafe = true;
    const cell = getRandomCellPos(gBoard, true);
    const safeCellEl = document.querySelector(`.cell-${cell.i}-${cell.j}`);
    safeCellEl.classList.add('empty');
    gIntervals.safeTimer = setTimeout(
      () => hideReveal(safeCellEl, cell.i, cell.j),
      1500,
    );
  }
}

function onUndo() {
  var prevState = gPrevBoardState.pop();
  console.log('prevState:', prevState);
  for (var x = 0; x < gBoard.length; x++) {
    for (var y = 0; y < gBoard[0].length; y++) {
      const cell = gBoard[x][y];
      const cellEl = document.querySelector(`.cell-${x}-${y}`);
      if (!cell.isMine) {
        cell.isMarked = prevState.board[x][y].isMarked;
        cell.isMine = prevState.board[x][y].isMine;
        cell.isRevealed = prevState.board[x][y].isRevealed;
        cell.minesAroundCount = prevState.board[x][y].minesAroundCount;
        cell.renderFlagsCount = prevState.board[x][y].renderFlagsCount;
      }
    }
  }
  // setMinesNegsCount(gBoard);
  renderBoard(gBoard, gLevel.level);
  prevState = null;
}
