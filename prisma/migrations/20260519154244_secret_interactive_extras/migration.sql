-- AlterTable
ALTER TABLE "SecretContent" ADD COLUMN "envelopeTeaser" TEXT;
ALTER TABLE "SecretContent" ADD COLUMN "passwordHints" TEXT;
ALTER TABLE "SecretContent" ADD COLUMN "quizJson" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "easterEggStarMessage" TEXT;
