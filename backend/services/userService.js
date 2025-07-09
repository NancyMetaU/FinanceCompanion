const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (id, email) => {
  return await prisma.user.create({
    data: {
      id,
      email,
    },
  });
};

module.exports = {
  createUser,
};
