/*
  Warnings:

  - You are about to drop the column `chatId` on the `ChatMessage` table. All the data in the column will be lost.
  - Added the required column `connectionId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chatId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "chatId",
ADD COLUMN     "connectionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
