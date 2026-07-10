ALTER TABLE "Request"
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "idempotencyHash" TEXT;

CREATE UNIQUE INDEX "Request_idempotencyKey_key"
ON "Request"("idempotencyKey");
