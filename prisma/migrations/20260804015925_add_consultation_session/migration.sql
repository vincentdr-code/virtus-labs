-- CreateTable
CREATE TABLE "ConsultationSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT,
    "clientName" TEXT,
    "title" TEXT NOT NULL,
    "transcript" TEXT,
    "insights" TEXT,
    "prototypeHtml" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsultationSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
