import { allQuestions, currentQuiz } from "./index.js";
/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 *
 * This class handles displaying and interacting with a single question.
 *
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 *
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 *
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 *
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 *
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */

export default class Question {
  constructor(index, quizInstance) {
    this.index = index;
    this.quiz = quizInstance;
    this.category = allQuestions[this.index].category;
    this.questionsLenght = allQuestions.length;
    this.question = allQuestions[this.index].question;
    this.difficulty = allQuestions[this.index].difficulty;
    this.correctAnswer = allQuestions[this.index].correct_answer;
    this.wrongAnswers = allQuestions[this.index].incorrect_answers;
    this.allAnswers = [this.correctAnswer, ...this.wrongAnswers].sort();
    this.answerd = false;
    this.timeRemaining = 15;
    this.timerInterval = null;
    this.warningPlayed = false;

    console.log("index", this.index);
    console.log("category", this.category);
    console.log("questionsLenght", this.questionsLenght);
    console.log("question", this.question);
    console.log("correctAnswer", this.correctAnswer);
    console.log("wrongAnswers", this.wrongAnswers);
    console.log("allAnswers", this.allAnswers);
  }
  displayQuestion() {
    let progress = Math.floor(((this.index + 1) / allQuestions.length) * 100);
    let emoji;
    if (this.difficulty == "easy") {
      emoji = "fa-solid fa-face-smile";
    } else if (this.difficulty == "medium") {
      emoji = "fa-solid fa-face-meh";
    } else {
      emoji = "fa-solid fa-skull";
    }

    document.getElementById(
      "questionsContainer"
    ).innerHTML = `<div class="game-card question-card">
      
      <div class="xp-bar-container">
        <div class="xp-bar-header">
          <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
          <span class="xp-value">Question ${this.index + 1}/${
      this.questionsLenght
    }</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width:${progress}%"></div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-badge category">
          <i class="fa-solid fa-bookmark"></i>
          <span>${this.category}</span>
        </div>
        <div class="stat-badge difficulty ${this.difficulty}">
          <i class="${emoji}"></i>
          <span>${this.difficulty}</span>
        </div>
        <div class="stat-badge timer">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="timer-value">15</span>s
        </div>
        <div class="stat-badge counter">
          <i class="fa-solid fa-gamepad"></i>
          <span>${this.index + 1}/${this.questionsLenght}</span>
        </div>
      </div>

      <h2 class="question-text">${this.question}</h2>

      <div class="answers-grid">
      ${this.allAnswers
        .map((choice, i) => {
          return `
        <button class="answer-btn" data-answer="${choice}">
          <span class="answer-key">${i + 1}</span>
          <span class="answer-text">${choice}</span>
        </button>`;
        })
        .join("")}
  

      </div>

      <p class="keyboard-hint">
        <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
      </p>

      <div class="score-panel">
        <div class="score-item">
          <div class="score-item-label">Score</div>
          <div class="score-item-value">${currentQuiz.score}</div>
        </div>
      </div>
    </div>`;
    let allChoices = document.querySelectorAll(".answer-btn");
    allChoices.forEach((answer) => {
      answer.addEventListener("click", (e) => {
        console.log("answer Click");
        console.log(e.target.dataset.answer);
        this.checkAnswer(e.target, e.target.dataset.answer);
      });
    });
    this.timer();
  }
  checkAnswer(btnClicked, userAnswer) {
    if (this.answerd == true) {
      return;
    }
    if (userAnswer == this.correctAnswer) {
      console.log("Correct");
      btnClicked.classList.add("correct");
      currentQuiz.score++;
      console.log(currentQuiz.score);
      let corrctSound = new Audio("/Audio/correct-6033.mp3");
      corrctSound.play();
    } else {
      console.log("Wrong");
      btnClicked.classList.add("wrong");
      let WrongSound = new Audio("/Audio/wronganswer-37702.mp3");
      WrongSound.play();
    }
    this.answerd = true;
    this.stopTimer();
    this.index++;
    setTimeout(() => {
      this.nextQuestion();
    }, 1000);
  }
  nextQuestion() {
    if (this.index < allQuestions.length) {
      let newQuestion = new Question(this.index, this.quiz);
      newQuestion.displayQuestion();
    } else {
      document.getElementById(
        "questionsContainer"
      ).innerHTML = `    <div class="game-card results-card">
      <h2 class="results-title">Quiz Complete!</h2>
      <p class="results-score-display">${currentQuiz.score}/${
        allQuestions.length
      }</p>
      <p class="results-percentage">${Math.floor(
        (currentQuiz.score / allQuestions.length) * 100
      )}% Accuracy</p>
      
      <div class="new-record-badge">
        <i class="fa-solid fa-star"></i>${
          Math.floor((currentQuiz.score / allQuestions.length) * 100) >= 50
            ? "New High Score!"
            : "Faild"
        } 
      </div>
      
      <div class="leaderboard">
        <h4 class="leaderboard-title">
          <i class="fa-solid fa-trophy"></i> Leaderboard
        </h4>
        <ul class="leaderboard-list">
          <li class="leaderboard-item gold">
            <span class="leaderboard-rank">#1</span>
            <span class="leaderboard-name">${this.quiz.playerName}</span>
            <span class="leaderboard-score">${Math.floor(
              (currentQuiz.score / allQuestions.length) * 100
            )} %</span>
          </li>

        </ul>
      </div>
      
      <div class="action-buttons">
        <button class="btn-restart">
          <i class="fa-solid fa-rotate-right"></i>${
            Math.floor((currentQuiz.score / allQuestions.length) * 100) >= 50
              ? "Play Again"
              : "Try Again"
          } 
        </button>
      </div>
    </div>`;
      document
        .querySelector(".btn-restart")
        .addEventListener("click", () => window.location.reload());
    }
  }

  timer() {
    const timerValue = document.querySelector(".timer-value");
    const timerBadge = document.querySelector(".stat-badge.timer");

    this.timeRemaining = 15;
    timerValue.textContent = this.timeRemaining;

    timerBadge.classList.remove("warning");
    this.warningPlayed = false;

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      timerValue.textContent = this.timeRemaining;

      if (this.timeRemaining <= 5) {
        timerBadge.classList.add("warning");
        if (!this.warningPlayed) {
          const timerAudio = new Audio("/Audio/5-second.mp3");
          timerAudio.play();
          this.warningPlayed = true;
        }
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
  handleTimeUp() {
    if (this.answerd) return;

    this.answerd = true;

    const answersGrid = document.querySelector(".answers-grid");

    // رسالة TIME UP
    const timeUpMsg = document.createElement("div");
    timeUpMsg.className = "time-up-message";
    timeUpMsg.textContent = "TIME'S UP!";
    answersGrid.before(timeUpMsg);

    // إظهار الإجابة الصح
    document.querySelectorAll(".answer-btn").forEach((btn) => {
      if (btn.dataset.answer === this.correctAnswer) {
        btn.classList.add("correct-reveal");
      }
      btn.classList.add("disabled");
    });

    setTimeout(() => {
      this.index++;
      this.nextQuestion();
    }, 1500);
  }

  // TODO: Create constructor(quiz, container, onQuizEnd)
  // 1. Store the three parameters
  // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
  // 3. Store index: this.index = quiz.currentQuestionIndex
  // 4. Decode and store: question, correctAnswer, category
  // 5. Decode wrong answers (use .map())
  // 6. Shuffle all answers
  // 7. Initialize: answered = false, timerInterval = null, timeRemaining

  // TODO: Create decodeHtml(html) method
  // Use DOMParser to decode HTML entities

  // TODO: Create shuffleAnswers() method
  // 1. Combine wrongAnswers and correctAnswer into one array
  // 2. Shuffle using Fisher-Yates algorithm
  // 3. Return shuffled array

  // TODO: Create getProgress() method
  // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
  // Round to whole number

  // TODO: Create displayQuestion() method
  // 1. Create HTML string for the question card
  //    (See index.html for the structure to use)
  // 2. Use template literals with ${} for dynamic data
  // 3. Set this.container.innerHTML = yourHTML
  // 4. Call this.addEventListeners()
  // 5. Call this.startTimer()

  // TODO: Create addEventListeners() method
  // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
  // 2. Add click event to each: call this.checkAnswer(button)
  // 3. Add keyboard support: listen for keys 1-4
  //    Valid keys are: ['1', '2', '3', '4']

  // TODO: Create removeEventListeners() method
  // Remove any keyboard listeners you added

  // TODO: Create startTimer() method
  // 1. Get timer display element
  // 2. Use setInterval to run every 1000ms (1 second)
  // 3. Decrement timeRemaining
  // 4. Update the display
  // 5. If timeRemaining <= 10 seconds, add 'warning' class
  // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()

  // TODO: Create stopTimer() method
  // Use clearInterval(this.timerInterval)

  // TODO: Create handleTimeUp() method
  // 1. Set answered = true
  // 2. Call removeEventListeners()
  // 3. Show correct answer (add 'correct' class)
  // 4. Show "TIME'S UP!" message
  // 5. Call animateQuestion() after a delay

  // TODO: Create checkAnswer(choiceElement) method
  // 1. If already answered, return early
  // 2. Set answered = true
  // 3. Stop the timer
  // 4. Get selected answer from data-answer attribute
  // 5. Compare with correctAnswer (case insensitive)
  // 6. If correct: add 'correct' class, call quiz.incrementScore()
  // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
  // 8. Disable other buttons (add 'disabled' class)
  // 9. Call animateQuestion()

  // TODO: Create highlightCorrectAnswer() method
  // Find the button with correct answer and add 'correct-reveal' class

  // TODO: Create getNextQuestion() method
  // 1. Call quiz.nextQuestion()
  // 2. If returns true: create new Question and display it
  // 3. If returns false: show results using quiz.endQuiz()
  //    Also add click listener to Play Again button

  // TODO: Create animateQuestion(duration) method
  // 1. Wait for 1500ms (transition delay)
  // 2. Add 'exit' class to question card
  // 3. Wait for duration
  // 4. Call getNextQuestion()
}
