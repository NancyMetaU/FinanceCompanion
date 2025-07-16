/*
  Warnings:

  - You are about to drop the column `readTags` on the `UserArticleContext` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserArticleContext" DROP COLUMN "readTags",
ADD COLUMN     "readArticles" JSONB DEFAULT '{}';
