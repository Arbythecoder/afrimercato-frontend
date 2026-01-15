// =================================================================
// GEOLOCATION SYSTEM TEST - DUBLIN & UK FOCUS
// =================================================================
// Tests Dublin (Ireland) and UK postcode validation and zone matching
// Run with: node test-geolocation.js

const {
  isValidEircode,
  isDublinEircode,
  getDublinZone,
  getDublinRegionName,
  isValidUKPostcode,
  getUKCity,
  isSameZone,
  isServiceable,
  calculateDeliveryZoneTier,
  calculateDeliveryFee,
  validatePostcode,
  formatPostcode
} = require('./src/utils/geolocation');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// =================================================================
// TEST 1: Dublin Eircode Validation
// =================================================================
async function test1_DublinEircodes() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 1: Dublin Eircode Validation', 'cyan');
  log('='.repeat(60), 'cyan');

  const dublinEircodes = [
    { code: 'D02 X285', zone: 'D02', area: 'Dublin 2 - South City Centre' },
    { code: 'D01 F5P2', zone: 'D01', area: 'Dublin 1 - North City Centre' },
    { code: 'D04 A3Y6', zone: 'D04', area: 'Dublin 4 - Ballsbridge, Donnybrook' },
    { code: 'D06 C9V3', zone: 'D06', area: 'Dublin 6 - Ranelagh, Rathmines' },
    { code: 'D08 Y2K5', zone: 'D08', area: 'Dublin 8 - Kilmainham, Inchicore' },
    { code: 'D15 X4W2', zone: 'D15', area: 'Dublin 15 - Blanchardstown, Castleknock' },
    { code: 'D18 P2X7', zone: 'D18', area: 'Dublin 18 - Sandyford, Foxrock' },
    { code: 'D24 F8H3', zone: 'D24', area: 'Dublin 24 - Tallaght' }
  ];

  let passed = 0;

  for (const test of dublinEircodes) {
    const valid = isValidEircode(test.code);
    const isDublin = isDublinEircode(test.code);
    const zone = getDublinZone(test.code);
    const region = getDublinRegionName(zone);

    log(`\n${test.code}:`, 'yellow');
    log(`  Valid: ${valid}`, valid ? 'green' : 'red');
    log(`  Is Dublin: ${isDublin}`, isDublin ? 'green' : 'red');
    log(`  Zone: ${zone}`, 'yellow');
    log(`  Region: ${region}`, 'yellow');

    if (valid && isDublin && zone === test.zone && region === test.area) {
      log('  ✓ All checks passed', 'green');
      passed++;
    } else {
      log('  ✗ Check failed', 'red');
    }
  }

  log(`\n✓ Dublin test: ${passed}/${dublinEircodes.length} passed`, passed === dublinEircodes.length ? 'green' : 'red');
  return passed === dublinEircodes.length;
}

// =================================================================
// TEST 2: UK Postcode Validation
// =================================================================
async function test2_UKPostcodes() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 2: UK Postcode Validation', 'cyan');
  log('='.repeat(60), 'cyan');

  const ukPostcodes = [
    { code: 'SW1A 1AA', city: 'London (South West)' },
    { code: 'M1 1AE', city: 'Manchester' },
    { code: 'B1 1AA', city: 'Birmingham' },
    { code: 'L1 8JQ', city: 'Liverpool' },
    { code: 'LS1 1AA', city: 'Leeds' },
    { code: 'G2 3AA', city: 'Glasgow' },
    { code: 'EH1 1AA', city: 'Edinburgh' },
    { code: 'BT1 1AA', city: 'Belfast' }
  ];

  let passed = 0;

  for (const test of ukPostcodes) {
    const valid = isValidUKPostcode(test.code);
    const city = getUKCity(test.code);

    log(`\n${test.code}:`, 'yellow');
    log(`  Valid: ${valid}`, valid ? 'green' : 'red');
    log(`  City: ${city}`, 'yellow');

    if (valid && city === test.city) {
      log('  ✓ Correct', 'green');
      passed++;
    } else {
      log('  ✗ Incorrect', 'red');
    }
  }

  log(`\n✓ UK test: ${passed}/${ukPostcodes.length} passed`, passed === ukPostcodes.length ? 'green' : 'red');
  return passed === ukPostcodes.length;
}

// =================================================================
// TEST 3: Service Area Matching (Dublin)
// =================================================================
async function test3_DublinServiceArea() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 3: Dublin Service Area Matching', 'cyan');
  log('='.repeat(60), 'cyan');

  // Rider serves Dublin 2
  const riderPostcode = 'D02 X285';

  const testCases = [
    { vendor: 'D02 Y876', serviceable: true, reason: 'Same zone' },
    { vendor: 'D01 F5P2', serviceable: true, reason: 'Nearby Dublin zone' },
    { vendor: 'D04 A3Y6', serviceable: true, reason: 'All Dublin zones serviceable' },
    { vendor: 'D18 P2X7', serviceable: true, reason: 'All Dublin zones serviceable' },
    { vendor: 'D24 F8H3', serviceable: true, reason: 'All Dublin zones serviceable' }
  ];

  let passed = 0;

  log(`\nRider Service Area: ${riderPostcode} (${getDublinRegionName(getDublinZone(riderPostcode))})`, 'magenta');

  for (const test of testCases) {
    const serviceable = isServiceable(riderPostcode, test.vendor);
    const zoneTier = calculateDeliveryZoneTier(riderPostcode, test.vendor);

    log(`\nVendor: ${test.vendor} (${getDublinRegionName(getDublinZone(test.vendor))})`, 'yellow');
    log(`  Serviceable: ${serviceable}`, serviceable ? 'green' : 'red');
    log(`  Zone Tier: ${zoneTier}`, 'yellow');
    log(`  Reason: ${test.reason}`, 'yellow');

    if (serviceable === test.serviceable) {
      log('  ✓ Match expected', 'green');
      passed++;
    } else {
      log('  ✗ Mismatch', 'red');
    }
  }

  log(`\n✓ Service area test: ${passed}/${testCases.length} passed`, passed === testCases.length ? 'green' : 'red');
  return passed === testCases.length;
}

// =================================================================
// TEST 4: Delivery Fee Calculation (Dublin)
// =================================================================
async function test4_DeliveryFees() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 4: Delivery Fee Calculation (Dublin)', 'cyan');
  log('='.repeat(60), 'cyan');

  const scenarios = [
    { from: 'D02 X285', to: 'D02 Y876', vehicle: 'bicycle', expectedTier: 1 },
    { from: 'D02 X285', to: 'D01 F5P2', vehicle: 'bicycle', expectedTier: 2 },
    { from: 'D02 X285', to: 'D18 P2X7', vehicle: 'motorcycle', expectedTier: 3 },
    { from: 'D02 X285', to: 'D24 F8H3', vehicle: 'car', expectedTier: 3 }
  ];

  let passed = 0;

  for (const scenario of scenarios) {
    const tier = calculateDeliveryZoneTier(scenario.from, scenario.to);
    const fee = calculateDeliveryFee(tier, scenario.vehicle);

    log(`\n${getDublinRegionName(getDublinZone(scenario.from))} → ${getDublinRegionName(getDublinZone(scenario.to))}`, 'yellow');
    log(`  Vehicle: ${scenario.vehicle}`, 'yellow');
    log(`  Zone Tier: ${tier}`, tier === scenario.expectedTier ? 'green' : 'red');
    log(`  Base Fee: €${fee.baseFee}`, 'yellow');
    log(`  Service Fee: €${fee.serviceFee}`, 'yellow');
    log(`  Total: €${fee.total}`, 'yellow');

    if (tier === scenario.expectedTier) {
      log('  ✓ Tier correct', 'green');
      passed++;
    } else {
      log('  ✗ Tier incorrect', 'red');
    }
  }

  log(`\n✓ Fee calculation test: ${passed}/${scenarios.length} passed`, passed === scenarios.length ? 'green' : 'red');
  return passed === scenarios.length;
}

// =================================================================
// TEST 5: Postcode Validation API
// =================================================================
async function test5_ValidationAPI() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 5: Postcode Validation API', 'cyan');
  log('='.repeat(60), 'cyan');

  const testCases = [
    { code: 'D02 X285', valid: true, type: 'IRELAND', isDublin: true },
    { code: 'SW1A 1AA', valid: true, type: 'UK', city: 'London (South West)' },
    { code: 'invalid', valid: false, type: null },
    { code: 'ABCD123', valid: false, type: null },
    { code: '', valid: false, type: null }
  ];

  let passed = 0;

  for (const test of testCases) {
    const result = validatePostcode(test.code);

    log(`\nPostcode: "${test.code}"`, 'yellow');
    log(`  Valid: ${result.valid}`, result.valid === test.valid ? 'green' : 'red');

    if (result.valid) {
      log(`  Type: ${result.type}`, 'yellow');
      log(`  Country: ${result.country}`, 'yellow');

      if (result.type === 'IRELAND') {
        log(`  Is Dublin: ${result.isDublin}`, 'yellow');
        if (result.isDublin) {
          log(`  Zone: ${result.zone}`, 'yellow');
          log(`  Region: ${result.region}`, 'yellow');
        }
      } else if (result.type === 'UK') {
        log(`  City: ${result.city}`, 'yellow');
      }
    } else {
      log(`  Message: ${result.message}`, 'yellow');
    }

    if (result.valid === test.valid && result.type === test.type) {
      log('  ✓ Validation correct', 'green');
      passed++;
    } else {
      log('  ✗ Validation incorrect', 'red');
    }
  }

  log(`\n✓ Validation API test: ${passed}/${testCases.length} passed`, passed === testCases.length ? 'green' : 'red');
  return passed === testCases.length;
}

// =================================================================
// TEST 6: Postcode Formatting
// =================================================================
async function test6_PostcodeFormatting() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 6: Postcode Formatting', 'cyan');
  log('='.repeat(60), 'cyan');

  const testCases = [
    { input: 'd02x285', expected: 'D02 X285' },
    { input: 'D02X285', expected: 'D02 X285' },
    { input: 'sw1a1aa', expected: 'SW1A 1AA' },
    { input: 'SW1A1AA', expected: 'SW1A 1AA' },
    { input: 'm11ae', expected: 'M1 1AE' }
  ];

  let passed = 0;

  for (const test of testCases) {
    const formatted = formatPostcode(test.input);

    log(`\nInput: "${test.input}"`, 'yellow');
    log(`  Formatted: "${formatted}"`, 'yellow');
    log(`  Expected: "${test.expected}"`, 'yellow');

    if (formatted === test.expected) {
      log('  ✓ Correct', 'green');
      passed++;
    } else {
      log('  ✗ Incorrect', 'red');
    }
  }

  log(`\n✓ Formatting test: ${passed}/${testCases.length} passed`, passed === testCases.length ? 'green' : 'red');
  return passed === testCases.length;
}

// =================================================================
// TEST 7: Real-World Dublin Scenarios
// =================================================================
async function test7_RealWorldScenarios() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 7: Real-World Dublin Scenarios', 'cyan');
  log('='.repeat(60), 'cyan');

  log('\nScenario 1: Temple Bar Restaurant to Customer in Rathmines', 'magenta');
  const scenario1From = 'D02 R275'; // Temple Bar
  const scenario1To = 'D06 F5P2'; // Rathmines

  log(`  Restaurant: ${scenario1From} (${getDublinRegionName(getDublinZone(scenario1From))})`, 'yellow');
  log(`  Customer: ${scenario1To} (${getDublinRegionName(getDublinZone(scenario1To))})`, 'yellow');

  const tier1 = calculateDeliveryZoneTier(scenario1From, scenario1To);
  const fee1 = calculateDeliveryFee(tier1, 'bicycle');

  log(`  Zone Tier: ${tier1}`, 'yellow');
  log(`  Delivery Fee: €${fee1.total}`, 'green');

  log('\nScenario 2: Blanchardstown Store to Customer in Tallaght', 'magenta');
  const scenario2From = 'D15 Y6W8'; // Blanchardstown
  const scenario2To = 'D24 F8H3'; // Tallaght

  log(`  Store: ${scenario2From} (${getDublinRegionName(getDublinZone(scenario2From))})`, 'yellow');
  log(`  Customer: ${scenario2To} (${getDublinRegionName(getDublinZone(scenario2To))})`, 'yellow');

  const tier2 = calculateDeliveryZoneTier(scenario2From, scenario2To);
  const fee2 = calculateDeliveryFee(tier2, 'motorcycle');

  log(`  Zone Tier: ${tier2}`, 'yellow');
  log(`  Delivery Fee: €${fee2.total}`, 'green');

  log('\nScenario 3: Sandyford Business Park to City Centre', 'magenta');
  const scenario3From = 'D18 CV36'; // Sandyford
  const scenario3To = 'D02 X285'; // City Centre

  log(`  Business: ${scenario3From} (${getDublinRegionName(getDublinZone(scenario3From))})`, 'yellow');
  log(`  Customer: ${scenario3To} (${getDublinRegionName(getDublinZone(scenario3To))})`, 'yellow');

  const tier3 = calculateDeliveryZoneTier(scenario3From, scenario3To);
  const fee3 = calculateDeliveryFee(tier3, 'car');

  log(`  Zone Tier: ${tier3}`, 'yellow');
  log(`  Delivery Fee: €${fee3.total}`, 'green');

  log('\n✓ All real-world scenarios processed successfully', 'green');
  return true;
}

// =================================================================
// RUN ALL TESTS
// =================================================================
async function runAllTests() {
  log('\n' + '█'.repeat(60), 'cyan');
  log('█ GEOLOCATION SYSTEM TEST SUITE', 'cyan');
  log('█ Dublin (Ireland) & UK Postcode System', 'cyan');
  log('█ Client Location: Dublin, Ireland', 'cyan');
  log('█'.repeat(60), 'cyan');

  const tests = [
    { name: 'Dublin Eircode Validation', fn: test1_DublinEircodes },
    { name: 'UK Postcode Validation', fn: test2_UKPostcodes },
    { name: 'Dublin Service Area Matching', fn: test3_DublinServiceArea },
    { name: 'Delivery Fee Calculation', fn: test4_DeliveryFees },
    { name: 'Validation API', fn: test5_ValidationAPI },
    { name: 'Postcode Formatting', fn: test6_PostcodeFormatting },
    { name: 'Real-World Scenarios', fn: test7_RealWorldScenarios }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    result ? passed++ : failed++;
    await new Promise(resolve => setTimeout(resolve, 300));
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
    log('\n🎉 ALL GEOLOCATION TESTS PASSED!', 'green');
    log('✅ Dublin & UK postcode system ready for production\n', 'green');
    return 0;
  } else {
    log('\n⚠️  SOME TESTS FAILED', 'red');
    log('❌ Fix issues before deployment\n', 'red');
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
