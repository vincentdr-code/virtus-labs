-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trade" TEXT NOT NULL,
    "metro" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceTier" TEXT NOT NULL DEFAULT 'TRADE_PRESS',
    "category" TEXT NOT NULL DEFAULT 'market',
    "importance" INTEGER NOT NULL DEFAULT 1,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScanRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsNew" INTEGER NOT NULL DEFAULT 0,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "log" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_sourceUrl_key" ON "NewsItem"("sourceUrl");

-- CreateIndex
CREATE INDEX "NewsItem_trade_metro_idx" ON "NewsItem"("trade", "metro");

-- CreateIndex
CREATE INDEX "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");
