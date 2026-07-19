-- TacoCat public leaderboard
-- Run this once in Supabase SQL Editor.
-- It exposes ONLY username, score, time and submission date.
-- Private fields such as answers and user_agent remain hidden.

create or replace function public.get_quiz_leaderboard(
  p_quiz_id text default 'general-quiz-demo-2',
  p_limit integer default 10
)
returns table (
  rank bigint,
  username text,
  score integer,
  total_questions integer,
  duration_seconds integer,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    row_number() over (
      order by
        qr.score desc,
        qr.duration_seconds asc,
        qr.created_at asc
    ) as rank,
    qr.username,
    qr.score,
    qr.total_questions,
    qr.duration_seconds,
    qr.created_at
  from public.quiz_results qr
  where qr.quiz_id = p_quiz_id
  order by
    qr.score desc,
    qr.duration_seconds asc,
    qr.created_at asc
  limit greatest(1, least(coalesce(p_limit, 10), 100));
$$;

revoke all on function public.get_quiz_leaderboard(text, integer) from public;
grant execute on function public.get_quiz_leaderboard(text, integer) to anon;
grant execute on function public.get_quiz_leaderboard(text, integer) to authenticated;
