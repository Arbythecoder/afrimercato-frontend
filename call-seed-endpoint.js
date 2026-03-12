/**
 * Call the production seed endpoint to populate vendors
 */

const https = require('https');

const options = {
  hostname: 'afrimercato-backend-production-0329.up.railway.app',
  port: 443,
  path: '/api/admin/seed-vendors',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🌐 Calling seed endpoint...');
console.log('📍 URL: https://afrimercato-backend-production-0329.up.railway.app/api/admin/seed-vendors\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response Status:', res.statusCode);
    console.log('📋 Response Body:\n');

    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));

      if (jsonData.success) {
        console.log('\n✅ SUCCESS! Demo vendors have been seeded to production!');
        console.log('\n📧 Login Credentials:');
        if (jsonData.data && jsonData.data.credentials) {
          jsonData.data.credentials.forEach(cred => {
            console.log(`  - ${cred.email} / ${cred.password}`);
          });
        }
        console.log('\n🎉 You can now login at: https://arbythecoder.github.io/afrimercato-frontend/#/login');
      } else {
        console.log('\n⚠️ Seeding completed with issues. Check the response above.');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error calling endpoint:', error.message);
  console.error('\nPossible causes:');
  console.error('  1. Railway deployment still in progress (wait 30 seconds)');
  console.error('  2. Network connectivity issue');
  console.error('  3. Railway service is down');
  console.error('\n💡 Alternative: Open this URL in your browser:');
  console.error('   https://afrimercato-backend-production-0329.up.railway.app/api/admin/seed-vendors');
  console.error('   (Use a browser extension like "HTTP Request Maker" to send POST request)');
});

req.end();
