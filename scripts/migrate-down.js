
// scripts/migrate-down.js
require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Rolling back last migration...');

try {
  execSync('npx node-pg-migrate down', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('✅ Rollback completed!');
} catch (error) {
  console.error('❌ Rollback failed:', error.message);
  process.exit(1);
}