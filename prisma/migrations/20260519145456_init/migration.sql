-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "partnerName" TEXT NOT NULL,
    "yourName" TEXT NOT NULL,
    "relationshipStart" DATETIME NOT NULL,
    "first520Date" DATETIME,
    "heroImageUrl" TEXT,
    "chapter1ImageUrl" TEXT,
    "chapter2ImageUrl" TEXT,
    "chapter1Copy" TEXT,
    "chapter2Copy" TEXT,
    "musicUrl" TEXT
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SecretContent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrl" TEXT
);
