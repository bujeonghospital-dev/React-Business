-- Add new visit reference column used by CRM "เปิด Visit" flow.
ALTER TABLE "BJH-Server"."b_appointment"
ADD COLUMN IF NOT EXISTS "vn" varchar(64);
