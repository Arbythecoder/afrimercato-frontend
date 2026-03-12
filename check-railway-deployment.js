/**
 * Check if Railway deployment is complete
 */

const https = require('https');

const checkEndpoint = (path, name) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'afrimercato-backend-production-0329.up.railway.app',
      port: 443,
      path: path,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`\n✓ ${name}`);
        console.log(`  Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`  Response:`, JSON.stringify(json, null, 2).substring(0, 200));
        } catch (e) {
          console.log(`  Response:`, data.substring(0, 200));
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`\n✗ ${name}`);
      console.log(`  Error: ${error.message}`);
      resolve({ error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`\n✗ ${name}`);
      console.log(`  Timeout`);
      resolve({ error: 'timeout' });
    });

    req.end();
  });
};

(async () => {
  console.log('🔍 Checking Railway deployment status...\n');
  console.log('=' .repeat(60));

  await checkEndpoint('/api/health', 'Health Check');
  await checkEndpoint('/api/admin/seed-vendors', 'Admin Seed Endpoint (POST)');
  await checkEndpoint('/api/admin/check-vendors', 'Admin Check Endpoint');

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 If admin endpoints show 404/500, Railway is still deploying.');
  console.log('   Wait 30-60 seconds and run: node call-seed-endpoint.js');
})();
