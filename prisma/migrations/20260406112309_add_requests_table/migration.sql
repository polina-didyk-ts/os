-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requests_ticketNumber_key" ON "requests"("ticketNumber");

-- CreateIndex
CREATE INDEX "requests_userId_idx" ON "requests"("userId");

-- CreateIndex
CREATE INDEX "requests_ticketNumber_idx" ON "requests"("ticketNumber");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
