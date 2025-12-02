// Test script to check API response
const https = require('https');
const http = require('http');

// Try to fetch from localhost dev server
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/customer-data',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success && result.data) {
        console.log('Total records:', result.data.length);
        console.log('Columns:', result.columns);
        
        // Check first record to see column values
        if (result.data.length > 0) {
          console.log('\nFirst record sample:');
          const first = result.data[0];
          console.log('Keys:', Object.keys(first));
          console.log('รหัสลูกค้า value:', first['รหัสลูกค้า']);
          console.log('customer_code value:', first['customer_code']);
        }
        
        // Count customers with/without CN
        let withCN = 0;
        let withoutCN = 0;
        
        result.data.forEach(row => {
          const cn = row['รหัสลูกค้า'] || row['customer_code'];
          if (cn && cn.toString().trim() !== '') {
            withCN++;
          } else {
            withoutCN++;
          }
        });
        
        console.log('\nWith CN (existing):', withCN);
        console.log('Without CN (new):', withoutCN);
        
        // Show sample records with CN
        const withCNRecords = result.data.filter(row => {
          const cn = row['รหัสลูกค้า'] || row['customer_code'];
          return cn && cn.toString().trim() !== '';
        }).slice(0, 5);
        
        if (withCNRecords.length > 0) {
          console.log('\nSample records WITH CN:');
          withCNRecords.forEach(r => {
            console.log(`  - ${r['ชื่อ'] || r['customer_name']} : CN = ${r['รหัสลูกค้า'] || r['customer_code']}`);
          });
        }
      } else {
        console.log('API returned:', result);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw data:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
