
require('dotenv').config({ path: '.env.local' });

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsDirectory: 'migrations',
  dir: 'migrations',
  tableName: 'migrations',
  verbose: true,
  validateChecksums: false,
};