// Script to verify all vendors
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/afrimercato')
.then(async () => {
  console.log('Connected to MongoDB');

  // Verify all vendors
  const result = await mongoose.connection.db.collection('vendors').updateMany(
    {},
    { $set: { isVerified: true, verificationStatus: 'approved' } }
  );

  console.log(`✓ Updated ${result.modifiedCount} vendor(s)`);

  // Show verified vendors
  const vendors = await mongoose.connection.db.collection('vendors').find({}).toArray();
  console.log(`\nVerified Vendors:`);
  vendors.forEach(v => {
    console.log(`- ${v.storeName}: ${v.isVerified ? '✓ VERIFIED' : '✗ NOT VERIFIED'}`);
  });

  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
