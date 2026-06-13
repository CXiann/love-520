-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isDecoy" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_GalleryItem" ("caption", "id", "imageUrl", "sortOrder") SELECT "caption", "id", "imageUrl", "sortOrder" FROM "GalleryItem";
DROP TABLE "GalleryItem";
ALTER TABLE "new_GalleryItem" RENAME TO "GalleryItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
