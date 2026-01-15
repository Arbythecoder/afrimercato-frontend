// =================================================================
// ENCRYPTION SYSTEM TEST
// =================================================================
// Tests bank account encryption/decryption functionality
// Run with: node test-encryption.js

require('dotenv').config();
const { encrypt, decrypt, maskData, testEncryption } = require('./src/utils/encryption');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// =================================================================
// TEST 1: Basic Encryption/Decryption
// =================================================================
async function test1_BasicEncryption() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 1: Basic Encryption/Decryption', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const testData = [
      '1234567890', // Account number
      '12-34-56', // Sort code
      'Test Bank Account', // Account name
      'sensitive@data.com' // Email
    ];

    for (const data of testData) {
      const encrypted = encrypt(data);
      const decrypted = decrypt(encrypted);

      log(`\nOriginal:  ${data}`, 'yellow');
      log(`Encrypted: ${encrypted.substring(0, 50)}...`, 'yellow');
      log(`Decrypted: ${decrypted}`, 'yellow');

      if (decrypted === data) {
        log('✓ Match!', 'green');
      } else {
        log('✗ Mismatch!', 'red');
        return false;
      }
    }

    log('\n✓ Basic encryption test passed', 'green');
    return true;
  } catch (error) {
    log(`✗ Basic encryption test failed: ${error.message}`, 'red');
    return false;
  }
}

// =================================================================
// TEST 2: Masking Functionality
// =================================================================
async function test2_MaskingData() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 2: Data Masking for Display', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const testCases = [
      { data: '1234567890', visible: 4, expected: '******7890' },
      { data: '12-34-56', visible: 2, expected: '******56' },
      { data: 'ABCDEFGH', visible: 3, expected: '*****FGH' }
    ];

    for (const test of testCases) {
      const masked = maskData(test.data, test.visible);

      log(`\nOriginal: ${test.data}`, 'yellow');
      log(`Masked:   ${masked}`, 'yellow');
      log(`Expected: ${test.expected}`, 'yellow');

      if (masked === test.expected) {
        log('✓ Mask correct!', 'green');
      } else {
        log('✗ Mask incorrect!', 'red');
        return false;
      }
    }

    log('\n✓ Masking test passed', 'green');
    return true;
  } catch (error) {
    log(`✗ Masking test failed: ${error.message}`, 'red');
    return false;
  }
}

// =================================================================
// TEST 3: Encryption Format Validation
// =================================================================
async function test3_EncryptionFormat() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 3: Encrypted Data Format Validation', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const testData = 'SensitiveData123';
    const encrypted = encrypt(testData);

    log(`\nEncrypted: ${encrypted}`, 'yellow');

    // Verify format: iv:authTag:encryptedData
    const parts = encrypted.split(':');

    if (parts.length !== 3) {
      log(`✗ Invalid format: Expected 3 parts, got ${parts.length}`, 'red');
      return false;
    }

    log(`IV length:      ${parts[0].length} characters`, 'yellow');
    log(`Auth tag length: ${parts[1].length} characters`, 'yellow');
    log(`Data length:     ${parts[2].length} characters`, 'yellow');

    // Verify each part is hex
    const hexRegex = /^[0-9a-f]+$/i;
    if (!hexRegex.test(parts[0]) || !hexRegex.test(parts[1]) || !hexRegex.test(parts[2])) {
      log('✗ Parts are not valid hex strings', 'red');
      return false;
    }

    log('\n✓ Format validation passed', 'green');
    return true;
  } catch (error) {
    log(`✗ Format validation failed: ${error.message}`, 'red');
    return false;
  }
}

// =================================================================
// TEST 4: Encryption Uniqueness (Same data → Different encrypted)
// =================================================================
async function test4_EncryptionUniqueness() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 4: Encryption Uniqueness (IV Randomness)', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const testData = '1234567890';
    const encrypted1 = encrypt(testData);
    const encrypted2 = encrypt(testData);
    const encrypted3 = encrypt(testData);

    log(`\nSame input: "${testData}"`, 'yellow');
    log(`\nEncryption 1: ${encrypted1.substring(0, 50)}...`, 'yellow');
    log(`Encryption 2: ${encrypted2.substring(0, 50)}...`, 'yellow');
    log(`Encryption 3: ${encrypted3.substring(0, 50)}...`, 'yellow');

    // Each encryption should be different due to random IV
    if (encrypted1 === encrypted2 || encrypted2 === encrypted3 || encrypted1 === encrypted3) {
      log('\n✗ Encrypted values should be different (IV should be random)', 'red');
      return false;
    }

    // But all should decrypt to same value
    if (decrypt(encrypted1) !== testData ||
        decrypt(encrypted2) !== testData ||
        decrypt(encrypted3) !== testData) {
      log('\n✗ Decryption failed for one or more encrypted values', 'red');
      return false;
    }

    log('\n✓ Uniqueness test passed (random IVs working)', 'green');
    return true;
  } catch (error) {
    log(`✗ Uniqueness test failed: ${error.message}`, 'red');
    return false;
  }
}

// =================================================================
// TEST 5: Error Handling (Invalid Input)
// =================================================================
async function test5_ErrorHandling() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 5: Error Handling', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    // Test 1: Decrypt invalid data
    try {
      decrypt('invalid-encrypted-data');
      log('✗ Should have thrown error for invalid encrypted data', 'red');
      return false;
    } catch (error) {
      log('✓ Correctly throws error for invalid encrypted data', 'green');
    }

    // Test 2: Decrypt null
    const result = decrypt(null);
    if (result === null) {
      log('✓ Correctly handles null input', 'green');
    } else {
      log('✗ Should return null for null input', 'red');
      return false;
    }

    log('\n✓ Error handling test passed', 'green');
    return true;
  } catch (error) {
    log(`✗ Error handling test failed: ${error.message}`, 'red');
    return false;
  }
}

// =================================================================
// TEST 6: UK Bank Account Encryption (Real World Data)
// =================================================================
async function test6_UKBankAccounts() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 6: UK Bank Account Encryption', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    const ukBankAccounts = [
      { accountNumber: '12345678', sortCode: '12-34-56', bankName: 'Barclays' },
      { accountNumber: '87654321', sortCode: '60-83-71', bankName: 'HSBC' },
      { accountNumber: '11223344', sortCode: '20-00-00', bankName: 'NatWest' }
    ];

    for (const account of ukBankAccounts) {
      const encryptedAccount = encrypt(account.accountNumber);
      const encryptedSort = encrypt(account.sortCode);

      const decryptedAccount = decrypt(encryptedAccount);
      const decryptedSort = decrypt(encryptedSort);

      const maskedAccount = maskData(account.accountNumber, 4);
      const maskedSort = maskData(account.sortCode, 2);

      log(`\n${account.bankName}:`, 'yellow');
      log(`  Account:  ${account.accountNumber} → ${maskedAccount}`, 'yellow');
      log(`  Sort:     ${account.sortCode} → ${maskedSort}`, 'yellow');

      if (decryptedAccount !== account.accountNumber || decryptedSort !== account.sortCode) {
        log('  ✗ Decryption mismatch!', 'red');
        return false;
      }

      log('  ✓ Encrypted & decrypted correctly', 'green');
    }

    log('\n✓ UK bank account test passed', 'green');
    return true;
  } catch (error) {
    log(`✗ UK bank account test failed: ${error.message}`, 'red');
    return false;
  }
}

// =================================================================
// RUN ALL TESTS
// =================================================================
async function runAllTests() {
  log('\n' + '█'.repeat(60), 'cyan');
  log('█ ENCRYPTION SYSTEM TEST SUITE', 'cyan');
  log('█ AES-256-GCM Bank Account Encryption', 'cyan');
  log('█'.repeat(60), 'cyan');

  // Check environment variable
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    log('\n⚠️  WARNING: JWT_SECRET not set or too short', 'yellow');
    log('Encryption will use default key (NOT SECURE for production)', 'yellow');
  } else {
    log('\n✓ Encryption key properly configured', 'green');
  }

  const tests = [
    { name: 'Basic Encryption/Decryption', fn: test1_BasicEncryption },
    { name: 'Data Masking', fn: test2_MaskingData },
    { name: 'Format Validation', fn: test3_EncryptionFormat },
    { name: 'Encryption Uniqueness', fn: test4_EncryptionUniqueness },
    { name: 'Error Handling', fn: test5_ErrorHandling },
    { name: 'UK Bank Accounts', fn: test6_UKBankAccounts }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    result ? passed++ : failed++;
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${passed + failed}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'cyan');

  if (failed === 0) {
    log('\n🎉 ALL ENCRYPTION TESTS PASSED!', 'green');
    log('✅ Bank account encryption is ready for production\n', 'green');
    return 0;
  } else {
    log('\n⚠️  SOME TESTS FAILED', 'red');
    log('❌ Fix issues before using encryption in production\n', 'red');
    return 1;
  }
}

// Run tests
runAllTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
