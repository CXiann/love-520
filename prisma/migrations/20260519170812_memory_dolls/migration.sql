-- CreateTable
CREATE TABLE "MemoryDoll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "memoryTitle" TEXT NOT NULL,
    "memoryStory" TEXT NOT NULL,
    "memoryDate" DATETIME,
    "sortOrder" INTEGER NOT NULL
);
