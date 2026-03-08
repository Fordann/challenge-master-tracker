// Prisma 7 configuration (CommonJS)
module.exports = {
  migrate: {
    url: process.env.DATABASE_URL || '',
  },
}
