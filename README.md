# TacoCat Leaderboard Update

## 1. Supabase
Open Supabase → SQL Editor → New Query.
Paste everything from:

`supabase/leaderboard.sql`

Press **Run**. You should see: `Success. No rows returned`.

## 2. GitHub
Upload the complete `leaderboard` folder to the root of the repository.

The final files should be:

- `leaderboard/index.html`
- `leaderboard/leaderboard.css`
- `leaderboard/leaderboard.js`

Do not move or rename `assets/js/supabase.js`.

## 3. Open the leaderboard
After GitHub Pages updates, open:

`https://tacocatwebsite-project.github.io/tacocat/leaderboard/`

## 4. Optional button on the quiz
Add this link near the quiz buttons:

```html
<a href="/tacocat/leaderboard/">View Top 10 Leaderboard</a>
```

Ranking rules:
1. Highest score.
2. Fastest completion time.
3. Earliest submission if both are tied.

Security:
The public leaderboard only returns username, score, time, and submission date.
It does not reveal answers or user-agent information.
