// Prisma 7 configuration file
// Move connection URLs for Migrate here.

const config = {
  migrate: {
    // URL used by prisma migrate
    url: process.env.DATABASE_URL || '',
  },
}

export default config
