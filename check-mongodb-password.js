// Check and encode MongoDB password for connection string
// Run: node check-mongodb-password.js

const actualPassword = 'aFRIHUB'; // Your actual password from MongoDB Atlas

// Check if encoding is needed
const hasSpecialChars = /[@:/?#\[\]%\s]/.test(actualPassword);

console.log('='.repeat(60));
console.log('MongoDB Password Analysis');
console.log('='.repeat(60));
console.log(`\nOriginal Password: ${actualPassword}`);
console.log(`Contains special characters: ${hasSpecialChars ? 'YES ⚠️' : 'NO ✅'}`);
console.log(`\nURL Encoded Password: ${encodeURIComponent(actualPassword)}`);
console.log('\n' + '='.repeat(60));
console.log('Your MongoDB Connection String:');
console.log('='.repeat(60));

const encodedPassword = encodeURIComponent(actualPassword);
const connectionString = `mongodb+srv://AFROMERT:${encodedPassword}@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub`;

console.log(`\n${connectionString}\n`);

if (hasSpecialChars) {
  console.log('⚠️  WARNING: Your password contains special characters!');
  console.log('   Always use the URL-encoded version above in your .env file\n');
} else {
  console.log('✅ Your password is safe - no special characters detected');
  console.log('   You can use it as-is, but encoded version works too!\n');
}
