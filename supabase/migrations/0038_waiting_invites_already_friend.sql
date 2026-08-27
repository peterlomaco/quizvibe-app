-- 0038_waiting_invites_already_friend — Deny + pre-friend-confirmation popup
-- for invite acceptance (Waiting Invites feature). Applied via Supabase SQL
-- Editor (manual, project convention — not auto-run).
--
-- Adds already_friend so the RECIPIENT's device can know, without reading
-- the host's private local friends list, whether accepting this invite will
-- also add them to the host's QuizVibe friends. The host already knows this
-- at send-time (a Friend.id starting with "pending-" means not-yet-friend —
-- see src/screens/LobbyScreen.tsx handleInviteFriend).
alter table public.waiting_invites
  add column if not exists already_friend boolean not null default false;
