-- CreateTable
CREATE TABLE "UserArticleContext" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readTags" JSONB DEFAULT '{}',
    "feedback" JSONB DEFAULT '{}',
    "savedArticles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserArticleContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserArticleContext_userId_key" ON "UserArticleContext"("userId");

-- AddForeignKey
ALTER TABLE "UserArticleContext" ADD CONSTRAINT "UserArticleContext_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
