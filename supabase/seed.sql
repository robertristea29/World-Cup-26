-- ============================================================
-- World Cup 2026 Group Stage Fixtures — all 72 matches
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- Kickoff times are in Romanian time (EEST = UTC+3, summer)
-- Source: Official FIFA schedule (CEST times + 1 hour = Romanian time)
-- Team names are in Romanian
-- ============================================================

insert into public.matches (home_team, away_team, kickoff_time, group_name, matchday) values

-- GROUP A
('Mexic', 'Africa de Sud',            '2026-06-11 22:00:00+03', 'A', 1),
('Coreea de Sud', 'Cehia',            '2026-06-12 05:00:00+03', 'A', 1),
('Cehia', 'Africa de Sud',            '2026-06-18 19:00:00+03', 'A', 2),
('Mexic', 'Coreea de Sud',            '2026-06-19 04:00:00+03', 'A', 2),
('Africa de Sud', 'Coreea de Sud',    '2026-06-25 04:00:00+03', 'A', 3),
('Cehia', 'Mexic',                    '2026-06-25 04:00:00+03', 'A', 3),

-- GROUP B
('Canada', 'Bosnia și Herțegovina',   '2026-06-12 22:00:00+03', 'B', 1),
('Qatar', 'Elveția',                  '2026-06-13 22:00:00+03', 'B', 1),
('Elveția', 'Bosnia și Herțegovina',  '2026-06-18 22:00:00+03', 'B', 2),
('Canada', 'Qatar',                   '2026-06-19 01:00:00+03', 'B', 2),
('Elveția', 'Canada',                 '2026-06-24 22:00:00+03', 'B', 3),
('Bosnia și Herțegovina', 'Qatar',    '2026-06-24 22:00:00+03', 'B', 3),

-- GROUP C
('Brazilia', 'Maroc',                 '2026-06-14 01:00:00+03', 'C', 1),
('Haiti', 'Scoția',                   '2026-06-14 04:00:00+03', 'C', 1),
('Scoția', 'Maroc',                   '2026-06-20 01:00:00+03', 'C', 2),
('Brazilia', 'Haiti',                 '2026-06-20 03:30:00+03', 'C', 2),
('Maroc', 'Haiti',                    '2026-06-25 01:00:00+03', 'C', 3),
('Scoția', 'Brazilia',                '2026-06-25 01:00:00+03', 'C', 3),

-- GROUP D
('SUA', 'Paraguay',                   '2026-06-13 04:00:00+03', 'D', 1),
('Australia', 'Turcia',               '2026-06-14 07:00:00+03', 'D', 1),
('SUA', 'Australia',                  '2026-06-19 22:00:00+03', 'D', 2),
('Turcia', 'Paraguay',                '2026-06-20 06:00:00+03', 'D', 2),
('Turcia', 'SUA',                     '2026-06-26 05:00:00+03', 'D', 3),
('Paraguay', 'Australia',             '2026-06-26 05:00:00+03', 'D', 3),

-- GROUP E
('Germania', 'Curaçao',               '2026-06-14 20:00:00+03', 'E', 1),
('Coasta de Fildeș', 'Ecuador',       '2026-06-15 02:00:00+03', 'E', 1),
('Germania', 'Coasta de Fildeș',      '2026-06-20 23:00:00+03', 'E', 2),
('Ecuador', 'Curaçao',                '2026-06-21 03:00:00+03', 'E', 2),
('Curaçao', 'Coasta de Fildeș',       '2026-06-25 23:00:00+03', 'E', 3),
('Ecuador', 'Germania',               '2026-06-25 23:00:00+03', 'E', 3),

-- GROUP F
('Olanda', 'Japonia',                 '2026-06-14 23:00:00+03', 'F', 1),
('Suedia', 'Tunisia',                 '2026-06-15 05:00:00+03', 'F', 1),
('Olanda', 'Suedia',                  '2026-06-20 20:00:00+03', 'F', 2),
('Tunisia', 'Japonia',                '2026-06-21 07:00:00+03', 'F', 2),
('Tunisia', 'Olanda',                 '2026-06-26 02:00:00+03', 'F', 3),
('Japonia', 'Suedia',                 '2026-06-26 02:00:00+03', 'F', 3),

-- GROUP G
('Belgia', 'Egipt',                   '2026-06-15 22:00:00+03', 'G', 1),
('Iran', 'Noua Zeelandă',             '2026-06-16 04:00:00+03', 'G', 1),
('Belgia', 'Iran',                    '2026-06-21 22:00:00+03', 'G', 2),
('Noua Zeelandă', 'Egipt',            '2026-06-22 04:00:00+03', 'G', 2),
('Noua Zeelandă', 'Belgia',           '2026-06-27 06:00:00+03', 'G', 3),
('Egipt', 'Iran',                     '2026-06-27 06:00:00+03', 'G', 3),

-- GROUP H
('Spania', 'Capul Verde',             '2026-06-15 19:00:00+03', 'H', 1),
('Arabia Saudită', 'Uruguay',         '2026-06-16 01:00:00+03', 'H', 1),
('Spania', 'Arabia Saudită',          '2026-06-21 19:00:00+03', 'H', 2),
('Uruguay', 'Capul Verde',            '2026-06-22 01:00:00+03', 'H', 2),
('Capul Verde', 'Arabia Saudită',     '2026-06-27 03:00:00+03', 'H', 3),
('Uruguay', 'Spania',                 '2026-06-27 03:00:00+03', 'H', 3),

-- GROUP I
('Franța', 'Senegal',                 '2026-06-16 22:00:00+03', 'I', 1),
('Irak', 'Norvegia',                  '2026-06-17 01:00:00+03', 'I', 1),
('Franța', 'Irak',                    '2026-06-23 00:00:00+03', 'I', 2),
('Norvegia', 'Senegal',               '2026-06-23 03:00:00+03', 'I', 2),
('Norvegia', 'Franța',                '2026-06-26 22:00:00+03', 'I', 3),
('Senegal', 'Irak',                   '2026-06-26 22:00:00+03', 'I', 3),

-- GROUP J
('Argentina', 'Algeria',              '2026-06-17 04:00:00+03', 'J', 1),
('Austria', 'Iordania',               '2026-06-17 07:00:00+03', 'J', 1),
('Argentina', 'Austria',              '2026-06-22 20:00:00+03', 'J', 2),
('Iordania', 'Algeria',               '2026-06-23 06:00:00+03', 'J', 2),
('Algeria', 'Austria',                '2026-06-28 05:00:00+03', 'J', 3),
('Iordania', 'Argentina',             '2026-06-28 05:00:00+03', 'J', 3),

-- GROUP K
('Portugalia', 'R.D. Congo',          '2026-06-17 20:00:00+03', 'K', 1),
('Uzbekistan', 'Columbia',            '2026-06-18 05:00:00+03', 'K', 1),
('Portugalia', 'Uzbekistan',          '2026-06-23 20:00:00+03', 'K', 2),
('Columbia', 'R.D. Congo',            '2026-06-24 05:00:00+03', 'K', 2),
('Columbia', 'Portugalia',            '2026-06-28 02:30:00+03', 'K', 3),
('R.D. Congo', 'Uzbekistan',          '2026-06-28 02:30:00+03', 'K', 3),

-- GROUP L
('Anglia', 'Croația',                 '2026-06-17 23:00:00+03', 'L', 1),
('Ghana', 'Panama',                   '2026-06-18 02:00:00+03', 'L', 1),
('Anglia', 'Ghana',                   '2026-06-23 23:00:00+03', 'L', 2),
('Panama', 'Croația',                 '2026-06-24 02:00:00+03', 'L', 2),
('Panama', 'Anglia',                  '2026-06-28 00:00:00+03', 'L', 3),
('Croația', 'Ghana',                  '2026-06-28 00:00:00+03', 'L', 3);
