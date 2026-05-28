-- Seed seguro: apenas dados default para estrutura compartilhada.
-- Nao cria usuarios de auth e nao insere dados sensiveis.

insert into public.profiles (id, name, email)
values
  ('00000000-0000-0000-0000-000000000001', 'Demo User', 'demo@studyquest.local')
on conflict (id) do nothing;

insert into public.user_academic_profile (
  user_id, weak_subjects, strong_subjects, selected_topics, onboarding_completed
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    false
  )
on conflict (user_id) do nothing;

insert into public.user_progress (
  user_id, player, subjects, completed_quest_ids, selected_title, unlocked_titles
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '{"name":"Demo User","title":"Aprendiz","level":1,"xp":0,"nextLevelXp":250,"streak":1,"completedQuests":0,"gold":120,"badge":"Primeira Chama"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'Aprendiz',
    '["Aprendiz"]'::jsonb
  )
on conflict (user_id) do nothing;

insert into public.user_competitive (
  user_id, competitive_points, wins, losses, draws, best_combo, average_accuracy, highest_score, most_played_subject, history
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    0, 0, 0, 0, 0, 0, 0, 'all', '[]'::jsonb
  )
on conflict (user_id) do nothing;

