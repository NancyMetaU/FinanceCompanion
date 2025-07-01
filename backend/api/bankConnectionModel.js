import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const saveBankConnection = async ({
  userId,
  accessToken,
  itemId,
  institution = "Unknown",
}) => {
  return await prisma.bankConnection.create({
    data: {
      userId,
      accessToken,
      itemId,
      institution,
    },
  });
};
