const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const saveBankConnection = async ({
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

module.exports = { saveBankConnection };
