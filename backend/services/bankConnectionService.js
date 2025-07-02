const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const savePlaidConnection = async ({
  userId,
  accessToken,
  itemId,
  institution = "Unknown",
}) => {
  return await prisma.plaidConnection.create({
    data: {
      userId,
      accessToken,
      itemId,
      institution,
    },
  });
};

module.exports = { savePlaidConnection };
