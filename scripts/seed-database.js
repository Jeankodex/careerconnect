
// scripts/seed-database.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  console.log('🌱 Seeding database with default data...');
  
  try {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if admin exists
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@careerconnect.com']);
    
    if (adminCheck.rows.length === 0) {
      // Create Admin User
      const adminResult = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['admin@careerconnect.com', hashedPassword, 'admin', true, true]
      );
      console.log('✅ Admin user created');
      
      // Create Candidate User
      const candidateResult = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['candidate@example.com', hashedPassword, 'candidate', true, true]
      );
      console.log('✅ Candidate user created');
      
      // Create Candidate Profile
      await pool.query(
        `INSERT INTO candidate_profiles (user_id, first_name, last_name, location, headline, years_experience)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [candidateResult.rows[0].id, 'John', 'Doe', 'San Francisco, CA', 'Senior Developer', 6]
      );
      
      // Create Recruiter User
      const recruiterResult = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['recruiter@example.com', hashedPassword, 'recruiter', true, true]
      );
      console.log('✅ Recruiter user created');
      
      // Create Recruiter Profile
      await pool.query(
        `INSERT INTO recruiter_profiles (user_id, first_name, last_name, department, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [recruiterResult.rows[0].id, 'Jane', 'Smith', 'HR', 'Talent Acquisition Manager']
      );
      
      console.log('✅ Seed data inserted successfully!');
    } else {
      console.log('⚠️ Seed data already exists, skipping...');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();