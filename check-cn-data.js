require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkData() {
  const client = await pool.connect();
  try {
    // Check columns
    const colRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'BJH-Server' 
      AND table_name = 'bjh_master_customers'
    `);
    console.log('Columns in bjh_master_customers:', colRes.rows.map(r => r.column_name));
    
    // Check sample data with customer_code
    const sampleRes = await client.query(`
      SELECT customer_code, customer_name 
      FROM "BJH-Server".bjh_master_customers 
      WHERE customer_code IS NOT NULL AND customer_code != ''
      LIMIT 10
    `);
    console.log('\nSample customers with CN:', sampleRes.rows);
    console.log('Count with CN:', sampleRes.rowCount);
    
    // Count total
    const countRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN customer_code IS NOT NULL AND customer_code != '' THEN 1 END) as with_cn,
        COUNT(CASE WHEN customer_code IS NULL OR customer_code = '' THEN 1 END) as without_cn
      FROM "BJH-Server".bjh_master_customers
    `);
    console.log('\nCounts:', countRes.rows[0]);
    
  } finally {
    client.release();
    pool.end();
  }
}

checkData().catch(console.error);
