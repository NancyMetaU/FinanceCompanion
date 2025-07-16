/*
  Warnings:

  - Made the column `feedback` on table `UserArticleContext` required. This step will fail if there are existing NULL values in that column.
  - Made the column `readArticles` on table `UserArticleContext` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserArticleContext" ALTER COLUMN "feedback" SET NOT NULL,
ALTER COLUMN "readArticles" SET NOT NULL,
ALTER COLUMN "readArticles" SET DEFAULT '[]';
