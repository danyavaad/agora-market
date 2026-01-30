-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "photo_url" TEXT;

-- CreateTable
CREATE TABLE "feed_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feed_likes_post_id_consumer_id_key" ON "feed_likes"("post_id", "consumer_id");

-- AddForeignKey
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
