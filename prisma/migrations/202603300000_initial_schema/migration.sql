DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
    CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FormType') THEN
    CREATE TYPE "FormType" AS ENUM ('ADOPTION', 'CAT', 'GIVE_UP', 'FOSTER', 'VOLUNTEER');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Request" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "type" "FormType" NOT NULL,
  "status" "Status" NOT NULL DEFAULT 'PENDING',
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "data" JSONB NOT NULL,
  "files" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "rejectionReason" TEXT,
  CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Request_token_key" ON "Request"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE INDEX IF NOT EXISTS "Request_createdAt_idx" ON "Request"("createdAt");
CREATE INDEX IF NOT EXISTS "Request_status_type_createdAt_idx" ON "Request"("status", "type", "createdAt");
