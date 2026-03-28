-- CreateTable
CREATE TABLE "ImportRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DocumentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "filename" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DocumentRecord" ("createdAt", "filename", "id", "summary", "type") SELECT "createdAt", "filename", "id", "summary", "type" FROM "DocumentRecord";
DROP TABLE "DocumentRecord";
ALTER TABLE "new_DocumentRecord" RENAME TO "DocumentRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
