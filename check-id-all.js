require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');

console.log('DB_HOST:', process.env.DB_HOST);

const pool = new Pool({
  host: process.env.DB_HOST || 'n8n.bjhbangkok.com',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: false
});

async function checkTable() {
  try {
    // Check max id_all
    const maxResult = await pool.query('SELECT MAX(id_all) as max_id FROM "BJH-Server".bjh_master_customers');
    console.log('Max id_all:', maxResult.rows[0]);

    // Check table structure for id_all
    const structResult = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'BJH-Server' AND table_name = 'bjh_master_customers' 
      AND column_name = 'id_all'
    `);
    console.log('id_all column info:', structResult.rows[0]);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

checkTable();
