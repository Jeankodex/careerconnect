
// scripts/migrate-up.js
require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running database migrations...');
console.log(`📁 Database: ${process.env.DATABASE_URL}`);

try {
  execSync('npx node-pg-migrate up', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('✅ Migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}