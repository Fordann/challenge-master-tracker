// Prisma 7 configuration (CommonJS) — used during build/runtime where TS isn't compiled
module.exports = {
  migrate: {
    // URL used by prisma migrate
    url: process.env.DATABASE_URL || '',
  },
}
