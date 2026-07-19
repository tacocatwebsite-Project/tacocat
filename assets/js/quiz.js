(function () {
  "use strict";

  const QUIZ_ID = "tacocat-chapters-1-10-2026";
  const TOTAL_QUESTIONS = 10;
  const TIME_LIMIT_SECONDS = 180;
  const LOCAL_ATTEMPT_KEY = `tacocat_attempt_${QUIZ_ID}`;

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
    ["startCard", "quizCard", "doneCard"].forEach((id) => el(id).classList.add("hidden"));
    el(cardId).classList.remove("hidden");
  }

  function setStartMessage(message, isError) {
    const box = el("startMessage");
    box.textContent = message;
    box.classList.toggle("error-note", Boolean(isError));
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function updateTimer() {
    const timer = el("timer");
    timer.textContent = formatTime(secondsRemaining);
    timer.className = secondsRemaining <= 30 ? "timer low" : "timer";
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

  async function begin() {
    const rawUsername = el("username").value;
    username = normalizeUsername(rawUsername);

    if (username.length < 2) {
      setStartMessage("Please enter a valid Telegram or X username.", true);
      return;
    }

    const startButton = el("startBtn");
    startButton.disabled = true;
    startButton.textContent = "Checking...";

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

      show("quizCard");
      renderQuestion();
      updateTimer();

      timerId = window.setInterval(() => {
        secondsRemaining -= 1;
        updateTimer();
        if (secondsRemaining <= 0) finish(true);
      }, 1000);
    } catch (error) {
      setStartMessage(error.message || "Could not start the quiz.", true);
    } finally {
      startButton.disabled = false;
      startButton.textContent = "Start Quiz";
    }
  }

  function renderQuestion() {
    const item = questions[currentIndex];
    el("progress").textContent = `Question ${currentIndex + 1} of ${TOTAL_QUESTIONS}`;
    el("question").textContent = item.q;
    el("options").innerHTML = "";
    el("nextBtn").disabled = answers[currentIndex] === null;
    el("nextBtn").textContent = currentIndex === TOTAL_QUESTIONS - 1 ? "Submit" : "Next";

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
        el("nextBtn").disabled = false;
      });

      el("options").appendChild(button);
    });
  }

  function next() {
    if (answers[currentIndex] === null || finishing) return;
    if (currentIndex === TOTAL_QUESTIONS - 1) finish(false);
    else {
      currentIndex += 1;
      renderQuestion();
    }
  }

  async function finish(timedOut) {
    if (finishing) return;
    finishing = true;
    if (timerId) window.clearInterval(timerId);
    timerId = null;

    const elapsed = Math.min(
      TIME_LIMIT_SECONDS,
      Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    );

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
      duration_seconds: elapsed,
      timed_out: Boolean(timedOut),
      answers,
      user_agent: navigator.userAgent
    };

    el("doneNote").textContent = "Submitting your result...";
    show("doneCard");

    const { error } = await window.supabaseClient.from("quiz_results").insert([payload]);

    if (error) {
      console.error("Result save failed:", error);
      el("doneNote").textContent = error.code === "23505"
        ? "This username already has a result for this quiz."
        : "Your result could not be submitted. Please contact a TacoCat admin.";
      return;
    }

    localStorage.setItem(LOCAL_ATTEMPT_KEY, username);
    el("doneNote").textContent = `Result submitted for @${username}.`;
  }

  el("startBtn").addEventListener("click", begin);
  el("nextBtn").addEventListener("click", next);
  el("username").addEventListener("keydown", (event) => {
    if (event.key === "Enter") begin();
  });
})();
