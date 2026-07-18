---
layout: default
title: Home
---

<div class="hero">

<div class="hero-title">

<h1>THE SIGNAL WAS RECEIVED</h1>

</div>

<div class="hero-scroll">

<h2>Transmission Log</h2>

<p>
The signal has arrived...
<br><br>
One taco.
<br>
One cat.
<br>
One mission.
<br><br>
Soon the adventure begins.
</p>

</div>

</div>

<section class="story">

<h1>The Story So Far</h1>

<div class="chapter-grid">

<div class="chapter-card">Chapter 1</div>

<div class="chapter-card">Chapter 2</div>

<div class="chapter-card">Chapter 3</div>

<div class="chapter-card">Chapter 4</div>

</div>

</section>

<section class="gallery">

<h1>Meme Gallery</h1>

<h3>The Funniest Tacos in the Universe</h3>

<div class="meme-grid">

<div class="meme"></div>

<div class="meme"></div>

<div class="meme"></div>

<div class="meme"></div>

<div class="meme"></div>

<div class="meme"></div>

</div>

</section>

<section class="crew">

<h1>Meet the Taco Crew</h1>

<h3>A Crew of Misfits. One Mission.</h3>

<div class="crew-grid">

<div class="crew-card">Tacocat</div>

<div class="crew-card">Character</div>

<div class="crew-card">Character</div>

<div class="crew-card">Character</div>

<div class="crew-card">Character</div>

<div class="crew-card">Character</div>

</div>

</section>

<section class="behind">
  
<h1>Behind the Scenes</h1>

<h3>Building the Universe One Taco at a Time</h3>

<div class="behind-box">

<div class="behind-image">

Image Here

</div>

<div class="behind-text">

Talk about how Tacocat was created.

Share sketches.

Explain the world.

Introduce the creators.

</div>

</div>

</section>

<section class="quiz">

<h1>TacoCat Practice Quiz</h1>

<div class="wrap">

  <div id="startCard" class="card">
    <h2>TacoCat Practice Quiz</h2>

    <p>Enter a username and answer 10 easy questions in 60 seconds.</p>

    <div class="note">
      Practice version. Your score stays hidden after submission.
    </div>

    <input
      id="username"
      autocomplete="off"
      autocapitalize="none"
      placeholder="X or Telegram username">

    <button id="startBtn" class="primary gap" type="button">
      Start Quiz
    </button>

    <button id="adminBtn" class="secondary gap" type="button">
      Private Results Panel
    </button>

  </div>

  <div id="quizCard" class="card hidden">

    <div class="top">
      <strong id="progress">Question 1 of 10</strong>
      <span id="timer" class="timer">60</span>
    </div>

    <div id="question" class="question"></div>

    <div id="options"></div>

    <button id="nextBtn" class="primary gap" type="button" disabled>
      Next
    </button>

  </div>

  <div id="doneCard" class="card hidden">

    <h2>Mission Complete</h2>

    <p>Your result was submitted and remains hidden.</p>

    <div id="doneNote" class="note"></div>

    <button id="againBtn" class="primary gap" type="button">
      Try Another Username
    </button>

    <button id="doneAdminBtn" class="secondary gap" type="button">
      Open Private Panel
    </button>

  </div>

</div>

</section>
