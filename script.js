// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const startPage = document.getElementById('start-page');
const countdownPage = document.getElementById('countdown-page');
// Start Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionsAmount = 0;
let equationsArray = [];
let playerGuesses = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let axisY = 0;

// Render best scores to DOM
const renderBestScores = function () {
  bestScores.forEach((aBestScore, index) => {
    aBestScore.textContent = `${bestScoreArray[index].bestScore}s`;
  });
};

// Get saved scores from local storage if they exist
const getSavedBestScores = function () {
  // Check local torage for existing best scores
  if (localStorage.getItem('bestscores')) {
    // If they exist, update the array
    bestScoreArray = JSON.parse(localStorage.bestscores);
  } else {
    // If they don't exist, create the array
    bestScoreArray = [
      {
        questions: 10,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 25,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 50,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 99,
        bestScore: finalTimeDisplay,
      },
    ];
    // Set the best score array to local storage
    localStorage.setItem('bestscores', JSON.stringify(bestScoreArray));
  }
  //
  renderBestScores();
};

// Update the best score array
const updateBestScore = function () {
  bestScoreArray.forEach((scoreObject, index) => {
    // Check for the correct exercise
    if (questionsAmount == scoreObject.questions) {
      // Save best score in a constant
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // If the score is not zero or we have a better score, update the best score
      if (savedBestScore === 0 || finalTime < savedBestScore)
        bestScoreArray[index].bestScore = finalTimeDisplay;
    }
  });
  //
  renderBestScores();
  //
  localStorage.setItem('bestscores', JSON.stringify(bestScoreArray));
};

// Restart the game when play again is clicked
const playAgain = function () {
  // Listen for the click event on the play again button
  gamePage.addEventListener('click', startTimer);
  // Hide the score page and show the start page
  scorePage.hidden = true;
  startPage.hidden = false;
  // Remove highlight from all radios
  radioContainers.forEach(container =>
    container.classList.remove('selected-label')
  );
  // Empty the equations array, the player guesses
  equationsArray = [];
  playerGuesses = [];
  // Scroll the page up to see the first question
  axisY = 0;
  // Hide the play again button
  playAgainBtn.hidden = true;
};

// Show score page
const showScorePage = function () {
  // Hide game page, show score page
  gamePage.hidden = true;
  scorePage.hidden = false;
  // Show the play again button after 1 sec
  setInterval(() => {
    playAgainBtn.hidden = false;
  }, 1000);
};

// Render the scores to DOM
const renderScores = function () {
  // Round the times to 1 decimal
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  finalTimeDisplay = finalTime.toFixed(1);
  // Fill the DOM elements text content
  baseTimeEl.textContent = `Base time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  //
  updateBestScore();
  // Scroll to top of the page
  itemContainer.scrollTo({ top: 0, behaviour: 'instant' });
  //
  showScorePage();
};

// Stop the timer and get the time results
const checkTime = function () {
  if (playerGuesses.length == questionsAmount) {
    // Stop the timer
    clearInterval(timer);
    // Push equations evaluations in an array
    const equationsEvaluated = equationsArray.map(
      equation => equation.evaluated
    );
    // Create an array with the resulted values from comparing evaluation array to guesses array
    const results = playerGuesses.map(
      (value, index) => value === equationsEvaluated[index]
    );
    // Increase the penalty time for each false result
    results.forEach(result => {
      if (result === false) penaltyTime += 0.5;
    });
    // Compute the final time
    finalTime = timePlayed + penaltyTime;
    // Render scores to DOM
    renderScores();
  }
};

// Count each 0.1 sec
const addTime = function () {
  timePlayed += 0.1;
  checkTime();
};

// Start the timer when game page is clicked
const startTimer = function () {
  // Reset all timers
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  // Set the timer to count
  timer = setInterval(addTime, 100);
  // Don't call the add event listener more than once
  gamePage.removeEventListener('click', startTimer);
};

// Scroll functionality to highlight each selected equation and push player's guess to array
const select = function (guessedTrue) {
  // Scroll 80px at each button click
  axisY += 80;
  itemContainer.scroll(0, axisY);
  // Push player's choice response to array
  return guessedTrue ? playerGuesses.push('true') : playerGuesses.push('false');
};

// Hide the countdown and show the game page
const showGamePage = function () {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

// Generate random number
const getRandomInt = function (max) {
  return Math.floor(Math.random() * max);
};

// Create correct & incorrect random equations
const createEquations = function () {
  // Random number of correct equations
  const correctEquations = getRandomInt(questionsAmount);
  console.log('correct eq:', correctEquations);
  // Number of wrong equations
  const wrongEquations = questionsAmount - correctEquations;
  console.log('wrong eq:', wrongEquations);
  // Create correct equations and push to object, alomg with the evaluation true
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Create wrong equations and push to object, along with the evaluation false
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  //
  randomize(equationsArray);
};

// Render equations to DOM
const renderEquations = function () {
  equationsArray.forEach(equation => {
    // Create elements
    const item = document.createElement('div');
    item.classList.add('item');
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append elements
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
};

// Dynamically add correct & incorrect equations
const populateGamePage = function () {
  // Empty container
  itemContainer.textContent = '';
  // Create space on top
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Create highlight item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);
  // Create the equations and render them in the DOM
  createEquations();
  renderEquations();
  // Create space below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
};

// Countdown 3, 2, 1, Go!
function countDownStart() {
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = 'Go!';
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

// Show countdown page
const showCountdown = function () {
  // Show countwdown
  countdownPage.hidden = false;
  // Hide start page
  startPage.hidden = true;
  //
  populateGamePage();
  //
  countDownStart();
};

// Get the number of questions from the selected radio
const getQuestionsAmount = function () {
  let radioInputNumber;
  radioInputs.forEach(input => {
    if (input.checked) radioInputNumber = input.value;
  });
  return radioInputNumber;
};

// Submit actions
const submit = function (event) {
  event.preventDefault();
  // Get the questions amount
  questionsAmount = getQuestionsAmount();
  console.log('questionAmount:', questionsAmount);
  // Show countdown page or alert the user if he hasn't selected a number of questions
  if (questionsAmount) {
    showCountdown();
  } else {
    alert('Please choose an excercise...');
  }
};

// Highlight the selected radio input
startForm.addEventListener('click', function () {
  radioContainers.forEach(container => {
    // Remove highlight from all radios
    container.classList.remove('selected-label');
    // Highlight only the selected radio
    if (container.children[1].checked)
      container.classList.add('selected-label');
  });
});

// Event listeners
gamePage.addEventListener('click', startTimer);
startForm.addEventListener('submit', submit);

// Initilization
getSavedBestScores();
