import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const QUIZ_ID = "general-quiz-demo-2";
const TIME_LIMIT = 60;

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Madrid", "Paris", "Rome", "Lisbon"],
    answer: 1
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Mercury"],
    answer: 2
  },
  {
    question: "How many continents are there?",
    options: ["Five", "Six", "Seven", "Eight"],
    answer: 2
  },
  {
    question: "What is 9 × 7?",
    options: ["56", "63", "72", "67"],
    answer: 1
  },
  {
    question: "Which ocean is the largest?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: 3
  },
  {
    question: "Which animal is known as the largest land animal?",
    options: ["Giraffe", "Elephant", "Rhino", "Hippo"],
    answer: 1
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Hydrogen", "Carbon dioxide", "Nitrogen"],
    answer: 2
  },
  {
    question: "Which country is famous for the pyramids of Giza?",
    options: ["Mexico", "Egypt", "Peru", "India"],
    answer: 1
  },
  {
    question: "What is the freezing point of water in Celsius?",
    options: ["0°C", "10°C", "32°C", "-10°C"],
    answer: 0
  },
  {
    question: "Which language is primarily spoken in Brazil?",
    options: ["Spanish", "French", "Portuguese", "Italian"],
    answer: 2
  }
];

const startScreen = document.querySelector("#start-screen");
const quizScreen = document.querySelector("#quiz-screen");
const completeScreen = document.querySelector("#complete-screen");
const usernameInput = document.querySelector("#username");
const startBtn = document.querySelector("#start-btn");
const nextBtn = document.querySelector("#next-btn");
const answersEl = document.querySelector("#answers");
const questionText = document.querySelector("#question-text");
const progressLabel = document.querySelector("#progress-label");
const progressBar = document.querySelector("#progress-bar");
const timerEl = document.querySelector("#timer");
const startError = document.querySelector("#start-error");
const submitStatus = document.querySelector("#submit-status");

let current = 0;
let selected = null;
let answers = [];
let remaining = TIME_LIMIT;
let timerId = null;
let startedAt = null;
let username = "";

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);

function startQuiz() {
  username = usernameInput.value.trim();

  if (username.length < 2) {
    startError.textContent = "Enter a name or username.";
    return;
  }

  startError.textContent = "";
  startedAt = new Date();
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  renderQuestion();

  timerId = window.setInterval(() => {
    remaining -= 1;
    timerEl.textContent = remaining;
    timerEl.classList.toggle("warning", remaining <= 10);

    if (remaining <= 0) finishQuiz(true);
  }, 1000);
}

function renderQuestion() {
  selected = null;
  nextBtn.disabled = true;

  const item = questions[current];
  progressLabel.textContent = `Question ${current + 1} of ${questions.length}`;
  progressBar.style.width = `${((current + 1) / questions.length) * 100}%`;
  questionText.textContent = item.question;
  answersEl.innerHTML = "";

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.textContent = option;

    button.addEventListener("click", () => {
      selected = index;
      document.querySelectorAll(".answer").forEach(el => el.classList.remove("selected"));
      button.classList.add("selected");
      nextBtn.disabled = false;
    });

    answersEl.appendChild(button);
  });

  nextBtn.textContent = current === questions.length - 1 ? "Submit Quiz" : "Next";
}

function nextQuestion() {
  if (selected === null) return;

  answers[current] = selected;

  if (current === questions.length - 1) {
    finishQuiz(false);
    return;
  }

  current += 1;
  renderQuestion();
}

async function finishQuiz(timedOut) {
  if (timerId) window.clearInterval(timerId);
  timerId = null;

  if (timedOut && selected !== null && answers[current] === undefined) {
    answers[current] = selected;
  }

  const completedAt = new Date();
  const durationSeconds = Math.min(
    TIME_LIMIT,
    Math.max(0, Math.round((completedAt - startedAt) / 1000))
  );

  const score = questions.reduce(
    (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
    0
  );

  quizScreen.classList.add("hidden");
  completeScreen.classList.remove("hidden");
  submitStatus.textContent = "Submitting results...";

  const payload = {
    quiz_id: QUIZ_ID,
    username,
    score,
    total_questions: questions.length,
    duration_seconds: durationSeconds,
    timed_out: timedOut,
    answers,
    user_agent: navigator.userAgent
  };

  const { error } = await supabase.from("quiz_results").insert(payload);

  if (error) {
    console.error(error);
    submitStatus.textContent = "The quiz finished, but the result could not be saved.";
  } else {
    submitStatus.textContent = "Result saved successfully.";
  }
}
