(function () {
  "use strict";

  const QUIZ_ID = "tacocat-chapters-1-10-2026";
  const TOTAL_QUESTIONS = 10;
  const TIME_LIMIT_SECONDS = 180;
  const LOCAL_ATTEMPT_KEY = `tacocat_attempt_${QUIZ_ID}`;
  const SESSION_KEY = `tacocat_session_${QUIZ_ID}`;
  const TAB_GRACE_MS = 2000;

  const questionBank = [
    { q: "Who is the main character of the TacoCat story?", options: ["Shadow", "TacoCat", "Lyra", "Explorer"], answer: "TacoCat" },
    { q: "What legendary object starts TacoCat's journey?", options: ["Ancient Map", "Legendary Taco", "Crystal", "Golden Helmet"], answer: "Legendary Taco" },
    { q: "What mysterious event interrupts TacoCat's peaceful day?", options: ["Meteor shower", "Unknown Signal", "Alien attack", "Volcano eruption"], answer: "Unknown Signal" },
    { q: "What color is the mysterious signal?", options: ["Red", "Green", "Purple", "Yellow"], answer: "Purple" },
    { q: "Where do the coordinates lead TacoCat?", options: ["Moon Base", "Taco Mountain", "Hidden Forest", "Desert"], answer: "Taco Mountain" },
    { q: "What appears on TacoCat's scanner?", options: ["Enemy ships", "Treasure", "Coordinates", "Food"], answer: "Coordinates" },
    { q: "What warning appears at the Beacon?", options: ["Mission Failed", "Danger Ahead", "Unauthorized Access Detected", "Access Granted"], answer: "Unauthorized Access Detected" },
    { q: "What does TacoCat discover inside the Beacon?", options: ["A spaceship", "A weapon", "Strange technology", "Food supplies"], answer: "Strange technology" },
    { q: "What message suddenly appears in Chapter 5?", options: ["RUN AWAY", "WELCOME HOME", "WE FOUND YOU.", "GAME OVER"], answer: "WE FOUND YOU." },
    { q: "How does TacoCat feel after the Chapter 5 message?", options: ["Happy", "Afraid and confused", "Excited", "Sleepy"], answer: "Afraid and confused" },
    { q: "What clue does TacoCat find in Chapter 6?", options: ["A key", "A crystal", "Footprints", "Coins"], answer: "Footprints" },
    { q: "Where are the footprints found?", options: ["Space Station", "River", "Taco Mountain", "City"], answer: "Taco Mountain" },
    { q: "Who leaves the warning in Chapter 7?", options: ["Shadow", "Lyra", "Lost Explorer", "Vector"], answer: "Lost Explorer" },
    { q: "What does the Chapter 7 warning say?", options: ["GO HOME", "KEEP WALKING", "DON'T TRUST THE SIGNAL.", "RUN FAST"], answer: "DON'T TRUST THE SIGNAL." },
    { q: "What alarming message appears in Chapter 8?", options: ["THEY ARE COMING", "SIGNAL LOST", "HE FOUND US.", "MISSION COMPLETE"], answer: "HE FOUND US." },
    { q: "Where does the danger seem to come from in Chapter 8?", options: ["The sky", "The ocean", "Below", "The forest"], answer: "Below" },
    { q: "What is the title of Chapter 9?", options: ["The Signal", "Lost Mission", "The Descent", "The Return"], answer: "The Descent" },
    { q: "What does TacoCat descend into in Chapter 9?", options: ["A volcano", "A cave", "An underground facility", "The ocean"], answer: "An underground facility" },
    { q: "What does the mysterious voice say in Chapter 9?", options: ["Welcome back.", "Run.", "You were never supposed to come this far.", "Goodbye."], answer: "You were never supposed to come this far." },
    { q: "What is the mysterious room in Chapter 10 called?", options: ["Control Room", "Secret Vault", "Zero Chamber", "Hidden Base"], answer: "Zero Chamber" },
    { q: "What symbol is on the giant door in Chapter 10?", options: ["X", "Triangle", "Number 0", "Star"], answer: "Number 0" },
    { q: "How many chapters are included in this quiz?", options: ["8", "9", "10", "12"], answer: "10" },
    { q: "What is TacoCat trying to uncover?", options: ["Treasure", "Food", "The mystery behind the signal", "A new planet"], answer: "The mystery behind the signal" },
    { q: "What is the official TacoCat community called?", options: ["Taco Army", "Taco Club", "Taco Crew", "Taco Hunters"], answer: "Taco Crew" },
    { q: "What is the TacoCat project slogan?", options: ["To the Moon", "Meme Forever", "It's more than a memecoin. It's a story.", "Cats Rule"], answer: "It's more than a memecoin. It's a story." }
  ];

  let questions = [];
  let answers = [];
  let currentIndex = 0;
  let secondsRemaining = TIME_LIMIT_SECONDS;
  let timerId = null;
  let startedAt = 0;
  let username = "";
  let finishing = false;
  let quizActive = false;
  let hiddenTimerId = null;
  let tabSwitches = 0;

  const el = (id) => document.getElementById(id);

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function normalizeUsername(value) {
    return value.trim().replace(/^@+/, "").replace(/\s+/g, "_").toLowerCase();
  }

  function show(cardId) {
    ["startCard", "quizCard", "doneCard"].forEach((id) => {
      if (el(id)) el(id).classList.add("hidden");
    });
    if (el(cardId)) el(cardId).classList.remove("hidden");
  }

  function setStartMessage(message, isError) {
    const box = el("startMessage");
    if (!box) return;
    box.textContent = message;
    box.classList.toggle("error-note", Boolean(isError));
  }

  function setDone(title, message) {
    const titleNode = el("doneTitle");
    const noteNode = el("doneNote");
    if (titleNode) titleNode.textContent = title;
    if (noteNode) noteNode.textContent = message;
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function updateTimer() {
    const timer = el("timer");
    if (!timer) return;
    timer.textContent = formatTime(secondsRemaining);
    timer.className = secondsRemaining <= 30 ? "timer low" : "timer";
  }

  function saveSession() {
    if (!quizActive || finishing) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      questions,
      answers,
      currentIndex,
      startedAt,
      username,
      tabSwitches
    }));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function alreadySubmitted(normalizedUsername) {
    if (localStorage.getItem(LOCAL_ATTEMPT_KEY) === normalizedUsername) return true;

    const { data, error } = await window.supabaseClient
      .from("quiz_results")
      .select("id")
      .eq("quiz_id", QUIZ_ID)
      .eq("username_normalized", normalizedUsername)
      .limit(1);

    if (error) {
      console.error("Attempt check failed:", error);
      throw new Error("Could not verify your attempt. Please try again.");
    }
    return Array.isArray(data) && data.length > 0;
  }

  function startTimer() {
    if (timerId) window.clearInterval(timerId);
    updateTimer();
    timerId = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      secondsRemaining = Math.max(0, TIME_LIMIT_SECONDS - elapsedSeconds);
      updateTimer();
      saveSession();
      if (secondsRemaining <= 0) finish(true, "time_expired");
    }, 250);
  }

  async function begin() {
    const rawUsername = el("username") ? el("username").value : "";
    username = normalizeUsername(rawUsername);

    if (username.length < 2) {
      setStartMessage("Please enter a valid Telegram or X username.", true);
      return;
    }

    const startButton = el("startBtn");
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = "Checking...";
    }

    try {
      if (await alreadySubmitted(username)) {
        setStartMessage("This username has already completed the quiz.", true);
        return;
      }

      questions = shuffle(questionBank)
        .slice(0, TOTAL_QUESTIONS)
        .map((item) => ({ ...item, options: shuffle(item.options) }));
      answers = new Array(TOTAL_QUESTIONS).fill(null);
      currentIndex = 0;
      secondsRemaining = TIME_LIMIT_SECONDS;
      startedAt = Date.now();
      finishing = false;
      quizActive = true;
      tabSwitches = 0;

      saveSession();
      show("quizCard");
      renderQuestion();
      startTimer();
    } catch (error) {
      setStartMessage(error.message || "Could not start the quiz.", true);
    } finally {
      if (startButton) {
        startButton.disabled = false;
        startButton.textContent = "Start Quiz";
      }
    }
  }

  function renderQuestion() {
    const item = questions[currentIndex];
    if (!item) return;
    if (el("progress")) el("progress").textContent = `Question ${currentIndex + 1} of ${TOTAL_QUESTIONS}`;
    if (el("question")) el("question").textContent = item.q;
    if (el("options")) el("options").innerHTML = "";
    if (el("nextBtn")) {
      el("nextBtn").disabled = answers[currentIndex] === null;
      el("nextBtn").textContent = currentIndex === TOTAL_QUESTIONS - 1 ? "Submit" : "Next";
    }

    item.options.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.textContent = choice;

      if (answers[currentIndex] === choice) button.classList.add("selected");

      button.addEventListener("click", () => {
        document.querySelectorAll(".option").forEach((node) => node.classList.remove("selected"));
        button.classList.add("selected");
        answers[currentIndex] = choice;
        if (el("nextBtn")) el("nextBtn").disabled = false;
        saveSession();
      });

      if (el("options")) el("options").appendChild(button);
    });
  }

  function next() {
    if (answers[currentIndex] === null || finishing) return;
    if (currentIndex === TOTAL_QUESTIONS - 1) {
      finish(false, "completed");
    } else {
      currentIndex += 1;
      saveSession();
      renderQuestion();
    }
  }

  function getCrewRank(score) {
    if (score === 10) return "SIGNAL GUARDIAN";
    if (score >= 8) return "SIGNAL HUNTER";
    if (score >= 6) return "EXPLORER";
    return "RECRUIT";
  }

  function launchConfetti() {
    const colors = ["#7c3aed", "#22d3ee", "#facc15", "#ffffff"];
    for (let i = 0; i < 90; i += 1) {
      const piece = document.createElement("span");
      piece.className = "tacocat-confetti";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 4200);
    }
  }

  function ensureConfettiStyles() {
    if (document.getElementById("tacocatConfettiStyles")) return;
    const style = document.createElement("style");
    style.id = "tacocatConfettiStyles";
    style.textContent = `
      .tacocat-confetti {
        position: fixed;
        top: -20px;
        width: 10px;
        height: 16px;
        z-index: 9999;
        pointer-events: none;
        animation: tacocatConfettiFall 3.6s linear forwards;
      }
      @keyframes tacocatConfettiFall {
        0% { opacity: 1; transform: translateY(-20px) rotate(0deg); }
        100% { opacity: 0; transform: translateY(110vh) rotate(720deg); }
      }
    `;
    document.head.appendChild(style);
  }

  async function finish(timedOut, finishReason) {
    if (finishing || !quizActive) return;
    finishing = true;
    quizActive = false;
    if (timerId) window.clearInterval(timerId);
    if (hiddenTimerId) window.clearTimeout(hiddenTimerId);
    timerId = null;
    hiddenTimerId = null;

    const rawElapsedMs = Math.max(1, Date.now() - startedAt);
    const elapsedMs = Math.min(TIME_LIMIT_SECONDS * 1000, rawElapsedMs);
    const elapsedSeconds = Math.min(TIME_LIMIT_SECONDS, Math.max(1, Math.ceil(elapsedMs / 1000)));

    const score = questions.reduce(
      (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
      0
    );

    const payload = {
      quiz_id: QUIZ_ID,
      username,
      username_normalized: username,
      score,
      total_questions: TOTAL_QUESTIONS,
      duration_seconds: elapsedSeconds,
      duration_ms: elapsedMs,
      timed_out: Boolean(timedOut),
      finish_reason: finishReason || (timedOut ? "time_expired" : "completed"),
      tab_switches: tabSwitches,
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent
    };

    setDone("TRANSMITTING RESULT...", "Uploading mission data to Taco Crew HQ...");
    show("doneCard");

    const { error } = await window.supabaseClient.from("quiz_results").insert([payload]);

    if (error) {
      console.error("Result save failed:", error);
      finishing = false;
      setDone(
        "TRANSMISSION FAILED",
        error.code === "23505"
          ? "This username already has a result for this quiz."
          : "Your result could not be submitted. Please contact a TacoCat admin."
      );
      return;
    }

    clearSession();
    localStorage.setItem(LOCAL_ATTEMPT_KEY, username);
    const rank = getCrewRank(score);
    const finalTime = formatTime(elapsedSeconds);
    setDone(
      "MISSION COMPLETE",
      `SIGNAL DECODED\n\nScore: ${score} / ${TOTAL_QUESTIONS}\nTime: ${finalTime}\nCrew Rank: ${rank}\n\nTransmission received for @${username}.`
    );

    if (score === TOTAL_QUESTIONS) {
      ensureConfettiStyles();
      launchConfetti();
    }

    const leaderboardButton = el("leaderboardBtn");
    if (leaderboardButton) leaderboardButton.classList.remove("hidden");
  }

  function restoreSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    try {
      const state = JSON.parse(raw);
      const elapsedSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
      if (!state.username || !Array.isArray(state.questions) || elapsedSeconds >= TIME_LIMIT_SECONDS) {
        clearSession();
        return false;
      }

      questions = state.questions;
      answers = state.answers;
      currentIndex = state.currentIndex;
      startedAt = state.startedAt;
      username = state.username;
      tabSwitches = state.tabSwitches || 0;
      secondsRemaining = TIME_LIMIT_SECONDS - elapsedSeconds;
      finishing = false;
      quizActive = true;

      show("quizCard");
      renderQuestion();
      startTimer();
      return true;
    } catch (error) {
      console.error("Session restore failed:", error);
      clearSession();
      return false;
    }
  }

  function protectQuiz() {
    ["copy", "cut", "paste", "contextmenu"].forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        if (quizActive) event.preventDefault();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!quizActive) return;
      const key = event.key.toLowerCase();
      const blocked = event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && ["u", "s", "p"].includes(key));
      if (blocked) event.preventDefault();
    });

    document.addEventListener("visibilitychange", () => {
      if (!quizActive || finishing) return;

      if (document.hidden) {
        hiddenTimerId = window.setTimeout(() => {
          if (document.hidden && quizActive && !finishing) {
            tabSwitches += 1;
            saveSession();
            finish(true, "left_page");
          }
        }, TAB_GRACE_MS);
      } else if (hiddenTimerId) {
        window.clearTimeout(hiddenTimerId);
        hiddenTimerId = null;
      }
    });

    window.addEventListener("beforeunload", (event) => {
      if (!quizActive || finishing) return;
      saveSession();
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function init() {
    protectQuiz();

    if (el("startBtn")) el("startBtn").addEventListener("click", begin);
    if (el("nextBtn")) el("nextBtn").addEventListener("click", next);
    if (el("username")) {
      el("username").addEventListener("keydown", (event) => {
        if (event.key === "Enter") begin();
      });
    }
    if (el("leaderboardBtn")) {
      el("leaderboardBtn").addEventListener("click", () => {
        window.location.href = "leaderboard/";
      });
    }

    restoreSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
