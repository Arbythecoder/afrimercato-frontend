// Quick script to clean up vendors collection
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/afrimercato', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  // Drop problematic indexes
  const indexesToDrop = ['email_1', 'businessName_1'];

  for (const indexName of indexesToDrop) {
    try {
      await mongoose.connection.db.collection('vendors').dropIndex(indexName);
      console.log(`✓ Dropped ${indexName} index`);
    } catch (error) {
      console.log(`Note: ${indexName} index did not exist or already dropped`);
    }
  }

  // Show current vendors
  const vendors = await mongoose.connection.db.collection('vendors').find({}).toArray();
  console.log(`\nFound ${vendors.length} vendor(s):`);
  vendors.forEach(v => {
    console.log(`- Store: ${v.storeName || 'N/A'}, User: ${v.user || 'N/A'}`);
  });

  console.log('\n✓ Cleanup complete');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
