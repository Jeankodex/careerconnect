require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

(async function(){
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='companies' ORDER BY ordinal_position");
    console.log('Columns for companies:');
    res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
