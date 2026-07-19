(function () {
  "use strict";

  const QUIZ_ID = "general-quiz-demo-2";
  const LIMIT = 10;

  const body = document.getElementById("leaderboardBody");
  const status = document.getElementById("status");
  const refreshBtn = document.getElementById("refreshBtn");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function rankLabel(rank) {
    if (rank === 1) return "🥇 1";
    if (rank === 2) return "🥈 2";
    if (rank === 3) return "🥉 3";
    return String(rank);
  }

  async function loadLeaderboard() {
    refreshBtn.disabled = true;
    status.textContent = "Loading leaderboard…";
    body.innerHTML = "";

    try {
      const { data, error } = await window.supabaseClient.rpc(
        "get_quiz_leaderboard",
        { p_quiz_id: QUIZ_ID, p_limit: LIMIT }
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        status.textContent = "No results yet. Be the first Signal Hunter!";
        return;
      }

      body.innerHTML = data.map((row) => `
        <tr>
          <td class="rank">${rankLabel(Number(row.rank))}</td>
          <td>${escapeHtml(row.username)}</td>
          <td><strong>${Number(row.score)}/${Number(row.total_questions)}</strong></td>
          <td>${Number(row.duration_seconds)}s</td>
        </tr>
      `).join("");

      status.textContent = `Showing the top ${data.length} participants.`;
    } catch (error) {
      console.error("Leaderboard error:", error);
      status.textContent = "The leaderboard could not be loaded. Check the Supabase SQL setup.";
    } finally {
      refreshBtn.disabled = false;
    }
  }

  refreshBtn.addEventListener("click", loadLeaderboard);
  loadLeaderboard();
})();
