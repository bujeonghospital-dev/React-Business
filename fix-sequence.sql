-- Fix PostgreSQL sequence for bjh_all_leads table
-- Run this SQL in your database to reset the sequence to the correct value

-- 1. Check current max ID
SELECT MAX(id) FROM "BJH-Server".bjh_all_leads;

-- 2. Reset sequence to start after the current max ID
-- This will set the sequence to the correct value
SELECT setval(
  '"BJH-Server".bjh_all_leads_id_seq',
  (SELECT COALESCE(MAX(id), 0) FROM "BJH-Server".bjh_all_leads),
  true
);

-- 3. Verify the sequence value
-- This will show the current value of the sequence
SELECT last_value FROM "BJH-Server".bjh_all_leads_id_seq;

-- 4. Test what the next ID will be
-- This shows the next value that will be used for insert
SELECT nextval('"BJH-Server".bjh_all_leads_id_seq');

-- 5. Check sequence info
SELECT * FROM pg_sequences WHERE schemaname = 'BJH-Server' AND sequencename = 'bjh_all_leads_id_seq';

-- Alternative using pg_get_serial_sequence (if the above doesn't work):
-- SELECT setval(
--   pg_get_serial_sequence('"BJH-Server".bjh_all_leads', 'id'),
--   (SELECT COALESCE(MAX(id), 0) FROM "BJH-Server".bjh_all_leads),
--   true
-- );
