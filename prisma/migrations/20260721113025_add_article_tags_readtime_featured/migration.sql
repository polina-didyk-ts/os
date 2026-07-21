-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readTime" INTEGER,
ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "articles_featured_idx" ON "articles"("featured");
