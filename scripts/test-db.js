// scripts/test-db.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  console.log(`📁 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')}`);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    // Test connection
    const result = await pool.query('SELECT NOW() as now');
    console.log('✅ Database connection successful!');
    console.log(`🕐 Server time: ${result.rows[0].now}`);
    
    // Get PostgreSQL version
    const versionResult = await pool.query('SELECT version()');
    console.log(`📦 PostgreSQL Version: ${versionResult.rows[0].version.split(',')[0]}`);
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Tables found: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(t => console.log(`   - ${t.table_name}`));
    
    // Count records in key tables
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);
    
    const jobCount = await pool.query('SELECT COUNT(*) FROM jobs');
    console.log(`💼 Total jobs: ${jobCount.rows[0].count}`);
    
    const applicationCount = await pool.query('SELECT COUNT(*) FROM applications');
    console.log(`📄 Total applications: ${applicationCount.rows[0].count}`);
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.code === '28P01') {
      console.error('   → Authentication failed. Check your database credentials in .env.local');
    } else if (error.code === '3D000') {
      console.error('   → Database does not exist. Run: npm run db:create');
    }
  } finally {
    await pool.end();
  }
}

testDatabase();