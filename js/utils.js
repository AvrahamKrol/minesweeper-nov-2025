'use strict';

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

function endGame() {
  stopTimer();
  revealMines(gBoard);
  gGame.isOn = false;
}

function updateFlagsCount() {
  if (!gLevel.mines && !gGame.markedCount) {
    gLevel.mines = getMinesCount();
    renderFlagsCount();
    return;
  }

  renderFlagsCount();
}

function findIdx(i, j, toFind) {
  if (toFind === 'mines') {
    return gGame.minesPosns.findIndex((mine) => mine.i === i && mine.j === j);
  } else if (toFind === 'safe') {
    return gGame.safeCells.findIndex((mine) => mine.i === i && mine.j === j);
  } else
    return gGame.markedCellPosns.findIndex(
      (mine) => mine.i === i && mine.j === j,
    );
}

function showMessage(status) {
  const message = document.querySelector('.message');
  if (status === 'lose') {
    message.innerText = 'You lost 😔. Try again! 💪';
    return;
  }
  message.innerText = '🎉🎉🎉 You won! 🎉🎉🎉';
}

function saveBestTime(level) {
  console.log(gGame.secsPassed);
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

function getTotalSafeCells() {
  return gBoard.length ** 2;
}
