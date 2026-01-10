// MongoDB Connection Diagnostics
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('\n🔍 MongoDB Connection Diagnostics\n');
console.log('=' .repeat(60));

// Extract connection details
const match = uri.match(/mongodb:\/\/([^:]+):([^@]+)@([^/]+)/);
if (match) {
  const [, username, , hosts] = match;
  console.log('Username:', username);
  console.log('Hosts:', hosts);
  console.log('Database:', uri.includes('afrimercato') ? 'afrimercato' : 'unknown');
}

console.log('=' .repeat(60));
console.log('\n⏳ Attempting connection (15 second timeout)...\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS! Connection working!\n');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('\n✨ Everything is fine! You can now start your backend.\n');
  process.exit(0);
})
.catch(err => {
  console.error('❌ CONNECTION FAILED!\n');
  console.error('Error:', err.message);
  console.error('\n' + '=' .repeat(60));
  console.error('POSSIBLE CAUSES:');
  console.error('=' .repeat(60));

  if (err.message.includes('authentication')) {
    console.error('\n❌ Wrong credentials (username/password)');
    console.error('\n🔧 FIX:');
    console.error('1. Go to MongoDB Atlas → Database Access');
    console.error('2. Check username matches: AFROMERT');
    console.error('3. Reset password if needed');
    console.error('4. Update .env file with correct password');
  } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
    console.error('\n❌ Cluster hostname not found');
    console.error('\n🔧 FIX:');
    console.error('1. Cluster might be deleted');
    console.error('2. Go to MongoDB Atlas and check cluster exists');
    console.error('3. Get new connection string if needed');
  } else if (err.message.includes('IP') || err.message.includes('whitelist')) {
    console.error('\n❌ IP whitelist issue (even though you have 0.0.0.0/0)');
    console.error('\n🔧 FIX:');
    console.error('1. Cluster might be PAUSED');
    console.error('2. Go to MongoDB Atlas → Clusters');
    console.error('3. Look for "PAUSED" status');
    console.error('4. Click "Resume" if paused');
    console.error('5. Wait 2-3 minutes for cluster to start');
  } else {
    console.error('\n❌ Unknown error');
    console.error('\n🔧 FIX:');
    console.error('1. Go to MongoDB Atlas');
    console.error('2. Check if cluster is running (not paused)');
    console.error('3. Check Database Access for correct username');
    console.error('4. Get fresh connection string from "Connect" button');
  }

  console.error('\n' + '=' .repeat(60));
  console.error('IMMEDIATE ACTION:');
  console.error('=' .repeat(60));
  console.error('\n1. Open MongoDB Atlas: https://cloud.mongodb.com');
  console.error('2. Go to your cluster: afrihub');
  console.error('3. Check if it says "PAUSED" anywhere');
  console.error('4. If paused, click "Resume"');
  console.error('5. Wait 3-5 minutes');
  console.error('6. Run this script again\n');

  process.exit(1);
});

setTimeout(() => {
  console.error('\n⏱️  Connection timed out after 15 seconds\n');
  console.error('This usually means:');
  console.error('→ Cluster is PAUSED');
  console.error('→ Cluster is being created/updated');
  console.error('→ Network connectivity issues\n');
  console.error('Check MongoDB Atlas cluster status!\n');
  process.exit(1);
}, 16000);