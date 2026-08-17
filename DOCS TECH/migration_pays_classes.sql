-- Migration : notion de "pays" pour les classes
-- Ajoute classes.pays et initialise la liste des pays disponibles dans
-- la table configuration (clé/valeur générique existante, valeur JSON).

alter table classes add column if not exists pays text default 'France';

insert into configuration (key, value) values
  ('pays_disponibles', '["France","Belgique","Italie"]')
on conflict (key) do nothing;
