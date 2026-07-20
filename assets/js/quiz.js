(function () {
  "use strict";

  const QUIZ_ID = "tacocat-chapters-1-10-2026";
  const TOTAL_QUESTIONS = 10;

  // 120 segundos = 2 minutos
  const QUIZ_TIME_LIMIT = 120;

  const LOCAL_ATTEMPT_KEY = `tacocat_attempt_${QUIZ_ID}`;
  const SESSION_KEY = `tacocat_session_${QUIZ_ID}`;
  const SOUND_KEY = "tacocat_quiz_sound";
  const TAB_GRACE_MS = 2000;

  const questionBank = [
    {
      q: "Who is the main character of the TacoCat story?",
      options: ["Shadow", "TacoCat", "Lyra", "Explorer"],
      answer: "TacoCat"
    },
    {
      q: "What legendary object starts TacoCat's journey?",
      options: ["Ancient Map", "Legendary Taco", "Crystal", "Golden Helmet"],
      answer: "Legendary Taco"
    },
    {
      q: "What mysterious event interrupts TacoCat's peaceful day?",
      options: ["Meteor shower", "Unknown Signal", "Alien attack", "Volcano eruption"],
      answer: "Unknown Signal"
    },
    {
      q: "What color is the mysterious signal?",
      options: ["Red", "Green", "Purple", "Yellow"],
      answer: "Purple"
    },
    {
      q: "Where do the coordinates lead TacoCat?",
      options: ["Moon Base", "Taco Mountain", "Hidden Forest", "Desert"],
      answer: "Taco Mountain"
    },
    {
      q: "What appears on TacoCat's scanner?",
      options: ["Enemy ships", "Treasure", "Coordinates", "Food"],
      answer: "Coordinates"
    },
    {
      q: "What warning appears at the Beacon?",
      options: [
        "Mission Failed",
        "Danger Ahead",
        "Unauthorized Access Detected",
        "Access Granted"
      ],
      answer: "Unauthorized Access Detected"
    },
    {
      q: "What does TacoCat discover inside the Beacon?",
      options: ["A spaceship", "A weapon", "Strange technology", "Food supplies"],
      answer: "Strange technology"
    },
    {
      q: "What message suddenly appears in Chapter 5?",
      options: ["RUN AWAY", "WELCOME HOME", "WE FOUND YOU.", "GAME OVER"],
      answer: "WE FOUND YOU."
    },
    {
      q: "How does TacoCat feel after the Chapter 5 message?",
      options: ["Happy", "Afraid and confused", "Excited", "Sleepy"],
      answer: "Afraid and confused"
    },
    {
      q: "What clue does TacoCat find in Chapter 6?",
      options: ["A key", "A crystal", "Footprints", "Coins"],
      answer: "Footprints"
    },
    {
      q: "Where are the footprints found?",
      options: ["Space Station", "River", "Taco Mountain", "City"],
      answer: "Taco Mountain"
    },
    {
      q: "Who leaves the warning in Chapter 7?",
      options: ["Shadow", "Lyra", "Lost Explorer", "Vector"],
      answer: "Lost Explorer"
    },
    {
      q: "What does the Chapter 7 warning say?",
      options: ["GO HOME", "KEEP WALKING", "DON'T TRUST THE SIGNAL.", "RUN FAST"],
      answer: "DON'T TRUST THE SIGNAL."
    },
    {
      q: "What alarming message appears in Chapter 8?",
      options: ["THEY ARE COMING", "SIGNAL LOST", "HE FOUND US.", "MISSION COMPLETE"],
      answer: "HE FOUND US."
    },
    {
      q: "Where does the danger seem to come from in Chapter 8?",
      options: ["The sky", "The ocean", "Below", "The forest"],
      answer: "Below"
    },
    {
      q: "What is the title of Chapter 9?",
      options: ["The Signal", "Lost Mission", "The Descent", "The Return"],
      answer: "The Descent"
    },
    {
      q: "What does TacoCat descend into in Chapter 9?",
      options: ["A volcano", "A cave", "An underground facility", "The ocean"],
      answer: "An underground facility"
    },
    {
      q: "What does the mysterious voice say in Chapter 9?",
      options: [
        "Welcome back.",
        "Run.",
        "You were never supposed to come this far.",
        "Goodbye."
      ],
      answer: "You were never supposed to come this far."
    },
    {
      q: "What is the mysterious room in Chapter 10 called?",
      options: ["Control Room", "Secret Vault", "Zero Chamber", "Hidden Base"],
      answer: "Zero Chamber"
    },
    {
      q: "What symbol is on the giant door in Chapter 10?",
      options: ["X", "Triangle", "Number 0", "Star"],
      answer: "Number 0"
    },
    {
      q: "How many chapters are included in this quiz?",
      options: ["8", "9", "10", "12"],
      answer: "10"
    },
    {
      q: "What is TacoCat trying to uncover?",
      options: ["Treasure", "Food", "The mystery behind the signal", "A new planet"],
      answer: "The mystery behind the signal"
    },
    {
      q: "What is the official TacoCat community called?",
      options: ["Taco Army", "Taco Club", "Taco Crew", "Taco Hunters"],
      answer: "Taco Crew"
    },
    {
      q: "What is the TacoCat project slogan?",
      options: [
        "To the Moon",
        "Meme Forever",
        "It's more than a memecoin. It's a story.",
        "Cats Rule"
      ],
      answer: "It's more than a memecoin. It's a story."
    }
  ];

  let questions = [];
  let answers = [];
  let currentIndex = 0;
  let secondsRemaining = QUIZ_TIME_LIMIT;

  let timerId = null;
  let startedAt = 0;
  let username = "";
  let finishing = false;
  let quizActive = false;
  let hiddenTimerId = null;
  let tabSwitches = 0;
  let audioContext = null;

  let soundEnabled = localStorage.getItem(SOUND_KEY) !== "off";

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
    return value
      .trim()
      .replace(/^@+/, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }

  function show(cardId) {
    ["startCard", "countdownCard", "quizCard", "doneCard"].forEach((id) => {
      el(id)?.classList.add("hidden");
    });

    el(cardId)?.classList.remove("hidden");
  }

  function setStartMessage(message, isError) {
    const box = el("startMessage");

    if (!box) {
      return;
    }

    box.textContent = message;
    box.classList.toggle("error-note", Boolean(isError));
  }

  function formatTime(total) {
    const safe = Math.max(0, total);
    const minutes = Math.floor(safe / 60);
    const seconds = String(safe % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

  function getCrewRank(score) {
    if (score === 10) {
      return "SIGNAL GUARDIAN";
    }

    if (score >= 8) {
      return "SIGNAL HUNTER";
    }

    if (score >= 6) {
      return "EXPLORER";
    }

    return "RECRUIT";
  }

  function updateSoundButton() {
    const button = el("soundBtn");

    if (!button) {
      return;
    }

    button.textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
    button.classList.toggle("muted", !soundEnabled);
    button.setAttribute("aria-pressed", String(soundEnabled));
  }

  function beep(
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.045
  ) {
    if (!soundEnabled) {
      return;
    }

    try {
      audioContext =
        audioContext ||
        new (window.AudioContext || window.webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.value = volume;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
      );

      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Sound unavailable:", error);
    }
  }

  function successSound() {
    beep(520, 0.1, "sine");

    setTimeout(() => {
      beep(660, 0.11, "sine");
    }, 110);

    setTimeout(() => {
      beep(820, 0.18, "sine");
    }, 230);
  }

  function updateTimer() {
    const timer = el("timer");

    if (!timer) {
      return;
    }

    timer.textContent = formatTime(secondsRemaining);
    timer.className = secondsRemaining <= 30 ? "timer low" : "timer";
  }

  function updateProgress() {
    const progressBar = el("progressBar");

    if (progressBar) {
      progressBar.style.width =
        `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%`;
    }
  }

  function saveSession() {
    if (!quizActive || finishing) {
      return;
    }

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        questions,
        answers,
        currentIndex,
        startedAt,
        username,
        tabSwitches
      })
    );
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function alreadySubmitted(name) {
    if (localStorage.getItem(LOCAL_ATTEMPT_KEY) === name) {
      return true;
    }

    if (!window.supabaseClient) {
      throw new Error("Supabase is not connected. Please try again.");
    }

    const { data, error } = await window.supabaseClient
      .from("quiz_results")
      .select("id")
      .eq("quiz_id", QUIZ_ID)
      .eq("username_normalized", name)
      .limit(1);

    if (error) {
      console.error("Attempt verification error:", error);

      throw new Error(
        "Could not verify your attempt. Please try again."
      );
    }

    return Array.isArray(data) && data.length > 0;
  }

  function startTimer() {
    if (timerId) {
      clearInterval(timerId);
    }

    updateTimer();

    timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);

      secondsRemaining = Math.max(
        0,
        QUIZ_TIME_LIMIT - elapsed
      );

      updateTimer();
      saveSession();

      if (secondsRemaining <= 0) {
        finish(true, "time_expired");
      }
    }, 250);
  }

  async function runCountdown() {
    show("countdownCard");

    const number = el("countdownNumber");
    const text = el("countdownText");

    for (const value of ["3", "2", "1"]) {
      if (number) {
        number.textContent = value;
        number.style.animation = "none";

        void number.offsetWidth;

        number.style.animation = "";
      }

      beep(value === "1" ? 700 : 440, 0.12, "square", 0.025);

      await new Promise((resolve) => {
        setTimeout(resolve, 800);
      });
    }

    if (number) {
      number.textContent = "GO!";
    }

    if (text) {
      text.textContent = "MISSION START";
    }

    beep(900, 0.18, "sine", 0.04);

    await new Promise((resolve) => {
      setTimeout(resolve, 550);
    });
  }

  async function begin() {
    username = normalizeUsername(el("username")?.value || "");

    if (username.length < 2) {
      setStartMessage(
        "Please enter a valid Telegram or X username.",
        true
      );

      return;
    }

    const button = el("startBtn");

    if (!button) {
      return;
    }

    button.disabled = true;
    button.textContent = "Checking...";

    try {
      const submitted = await alreadySubmitted(username);

      if (submitted) {
        setStartMessage(
          "This username has already completed the quiz.",
          true
        );

        return;
      }

      questions = shuffle(questionBank)
        .slice(0, TOTAL_QUESTIONS)
        .map((item) => ({
          ...item,
          options: shuffle(item.options)
        }));

      answers = new Array(TOTAL_QUESTIONS).fill(null);
      currentIndex = 0;
      secondsRemaining = QUIZ_TIME_LIMIT;
      finishing = false;
      quizActive = false;
      tabSwitches = 0;

      await runCountdown();

      startedAt = Date.now();
      quizActive = true;

      saveSession();
      show("quizCard");
      renderQuestion();
      startTimer();
    } catch (error) {
      console.error("Quiz start error:", error);

      setStartMessage(
        error.message || "Could not start the quiz.",
        true
      );

      show("startCard");
    } finally {
      button.disabled = false;
      button.textContent = "🚀 Start Mission";
    }
  }

  function renderQuestion() {
    const item = questions[currentIndex];

    if (!item) {
      return;
    }

    const progress = el("progress");
    const question = el("question");
    const options = el("options");
    const nextButton = el("nextBtn");

    if (progress) {
      progress.textContent =
        `Question ${currentIndex + 1} of ${TOTAL_QUESTIONS}`;
    }

    if (question) {
      question.textContent = item.q;
    }

    if (!options || !nextButton) {
      return;
    }

    options.innerHTML = "";

    nextButton.disabled = answers[currentIndex] === null;
    nextButton.textContent =
      currentIndex === TOTAL_QUESTIONS - 1
        ? "Submit Mission"
        : "Next";

    updateProgress();

    item.options.forEach((choice) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "option";
      button.textContent = choice;

      if (answers[currentIndex] === choice) {
        button.classList.add("selected");
      }

      button.addEventListener("click", () => {
        document
          .querySelectorAll(".option")
          .forEach((node) => node.classList.remove("selected"));

        button.classList.add("selected");

        answers[currentIndex] = choice;
        nextButton.disabled = false;

        beep(520, 0.07, "sine", 0.025);
        saveSession();
      });

      options.appendChild(button);
    });
  }

  function next() {
    if (answers[currentIndex] === null || finishing) {
      return;
    }

    beep(610, 0.06, "sine", 0.02);

    if (currentIndex === TOTAL_QUESTIONS - 1) {
      finish(false, "completed");
    } else {
      currentIndex += 1;

      saveSession();
      renderQuestion();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  function launchConfetti() {
    const colors = [
      "#7c3aed",
      "#22d3ee",
      "#facc15",
      "#ffffff",
      "#6de7ba"
    ];

    for (let i = 0; i < 100; i += 1) {
      const piece = document.createElement("span");

      piece.className = "tacocat-confetti";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      piece.style.transform =
        `rotate(${Math.random() * 360}deg)`;

      document.body.appendChild(piece);

      setTimeout(() => {
        piece.remove();
      }, 4300);
    }
  }

  async function finish(timedOut, reason) {
    if (finishing || !quizActive) {
      return;
    }

    finishing = true;
    quizActive = false;

    clearInterval(timerId);
    clearTimeout(hiddenTimerId);

    timerId = null;
    hiddenTimerId = null;

    const elapsedMs = Math.min(
      QUIZ_TIME_LIMIT * 1000,
      Math.max(1, Date.now() - startedAt)
    );

    const elapsedSeconds = Math.min(
      QUIZ_TIME_LIMIT,
      Math.max(1, Math.ceil(elapsedMs / 1000))
    );

    const score = questions.reduce((total, question, index) => {
      return total + (
        answers[index] === question.answer ? 1 : 0
      );
    }, 0);

    const rank = getCrewRank(score);

    const payload = {
      quiz_id: QUIZ_ID,
      username,
      username_normalized: username,
      score,
      total_questions: TOTAL_QUESTIONS,
      duration_seconds: elapsedSeconds,
      duration_ms: elapsedMs,
      timed_out: Boolean(timedOut),
      finish_reason:
        reason || (timedOut ? "time_expired" : "completed"),
      tab_switches: tabSwitches,
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent
    };

    show("doneCard");

    const doneTitle = el("doneTitle");
    const doneNote = el("doneNote");
    const shareCard = el("shareCard");

    if (doneTitle) {
      doneTitle.textContent = "TRANSMITTING RESULT...";
    }

    if (doneNote) {
      doneNote.textContent =
        "Uploading mission data to Taco Crew HQ...";
    }

    shareCard?.classList.add("hidden");

    try {
      const { error } = await window.supabaseClient
        .from("quiz_results")
        .insert([payload]);

      if (error) {
        throw error;
      }

      clearSession();
      localStorage.setItem(LOCAL_ATTEMPT_KEY, username);

      if (doneTitle) {
        doneTitle.textContent = "MISSION COMPLETE";
      }

      if (doneNote) {
        doneNote.textContent =
          `SIGNAL DECODED\nTransmission received for @${username}.`;
      }

      if (el("resultScore")) {
        el("resultScore").textContent =
          `${score} / ${TOTAL_QUESTIONS}`;
      }

      if (el("resultTime")) {
        el("resultTime").textContent =
          formatTime(elapsedSeconds);
      }

      if (el("resultRank")) {
        el("resultRank").textContent = rank;
      }

      shareCard?.classList.remove("hidden");
      el("leaderboardBtn")?.classList.remove("hidden");

      successSound();

      if (score === TOTAL_QUESTIONS) {
        launchConfetti();
      }
    } catch (error) {
      console.error("Result submission error:", error);

      finishing = false;

      if (doneTitle) {
        doneTitle.textContent = "TRANSMISSION FAILED";
      }

      if (doneNote) {
        doneNote.textContent =
          error.code === "23505"
            ? "This username already has a result for this quiz."
            : "Your result could not be submitted. Please contact a TacoCat admin.";
      }
    }
  }

  function restoreSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);

    if (!raw) {
      return false;
    }

    try {
      const state = JSON.parse(raw);

      const elapsed = Math.floor(
        (Date.now() - state.startedAt) / 1000
      );

      if (
        !state.username ||
        !Array.isArray(state.questions) ||
        elapsed >= QUIZ_TIME_LIMIT
      ) {
        clearSession();
        return false;
      }

      questions = state.questions;
      answers = state.answers;
      currentIndex = state.currentIndex;
      startedAt = state.startedAt;
      username = state.username;
      tabSwitches = state.tabSwitches || 0;

      secondsRemaining = QUIZ_TIME_LIMIT - elapsed;
      finishing = false;
      quizActive = true;

      show("quizCard");
      renderQuestion();
      startTimer();

      return true;
    } catch (error) {
      console.error("Session restore error:", error);

      clearSession();
      return false;
    }
  }

  function protectQuiz() {
    ["copy", "cut", "paste", "contextmenu"].forEach((name) => {
      document.addEventListener(name, (event) => {
        if (quizActive) {
          event.preventDefault();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!quizActive) {
        return;
      }

      const key = event.key.toLowerCase();

      const blocked =
        event.key === "F12" ||
        (
          event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(key)
        ) ||
        (
          event.ctrlKey &&
          ["u", "s", "p"].includes(key)
        );

      if (blocked) {
        event.preventDefault();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!quizActive || finishing) {
        return;
      }

      if (document.hidden) {
        hiddenTimerId = setTimeout(() => {
          if (
            document.hidden &&
            quizActive &&
            !finishing
          ) {
            tabSwitches += 1;

            saveSession();
            finish(true, "left_page");
          }
        }, TAB_GRACE_MS);
      } else if (hiddenTimerId) {
        clearTimeout(hiddenTimerId);
        hiddenTimerId = null;
      }
    });

    window.addEventListener("beforeunload", (event) => {
      if (!quizActive || finishing) {
        return;
      }

      saveSession();

      event.preventDefault();
      event.returnValue = "";
    });
  }

  function init() {
    protectQuiz();
    updateSoundButton();

    el("startBtn")?.addEventListener("click", begin);
    el("nextBtn")?.addEventListener("click", next);

    el("username")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        begin();
      }
    });

    el("leaderboardBtn")?.addEventListener("click", () => {
      window.location.href = "./leaderboard/";
    });

    el("soundBtn")?.addEventListener("click", () => {
      soundEnabled = !soundEnabled;

      localStorage.setItem(
        SOUND_KEY,
        soundEnabled ? "on" : "off"
      );

      updateSoundButton();

      if (soundEnabled) {
        beep(660, 0.08);
      }
    });

    restoreSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
