
// scripts/create-database.js
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl.split('/').pop();

// Connect to default 'postgres' database to create the new database
const defaultClient = new Client({
  connectionString: databaseUrl.replace(`/${databaseName}`, '/postgres'),
});

async function createDatabase() {
  console.log(`📦 Creating database: ${databaseName}`);
  
  try {
    await defaultClient.connect();
    await defaultClient.query(`CREATE DATABASE ${databaseName}`);
    console.log(`✅ Database ${databaseName} created successfully!`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`⚠️ Database ${databaseName} already exists.`);
    } else {
      console.error('❌ Error creating database:', error.message);
      process.exit(1);
    }
  } finally {
    await defaultClient.end();
  }
}

createDatabase();