/**
 * Test Fix & Flip Calculations
 *
 * Run with: npx ts-node scripts/test-flip-calculations.ts
 *
 * This script tests the centralized calculateFlipReturns function
 * with known examples to verify calculations are correct.
 */

import { calculateFlipReturns, type FlipCalculationInputs } from '../src/utils/financial-calculations';

// Test case interface
interface TestCase {
  name: string;
  inputs: FlipCalculationInputs;
  expectedApprox: {
    totalInvestment?: number;
    netProfit?: number;
    roi?: number;
    shouldBePositive?: boolean;
    shouldBeNegative?: boolean;
    shouldBeBreakEven?: boolean;
  };
}

// Define test cases from the requirements
const testCases: TestCase[] = [
  {
    name: 'TEST CASE 1: Typical profitable flip',
    inputs: {
      purchasePrice: 200000,
      arv: 300000,
      renovationCosts: 50000,
      downPaymentPercent: 10,
      interestRate: 10,
      loanTermYears: 1,
      holdingPeriodMonths: 6,
      loanType: 'hardMoney',
      points: 2.5,
      isHardMoney: true
    },
    expectedApprox: {
      // With $200k purchase, $50k rehab, and $300k ARV:
      // Total project cost ~ $280,000 (purchase + rehab + closing + holding + selling)
      // Net profit ~ $20,000-30,000
      // ROI ~ 80-150% (on cash required ~$26k)
      netProfit: 20000, // Approximate expected net profit
      shouldBePositive: true
    }
  },
  {
    name: 'TEST CASE 2: Marginal deal (small ARV spread = loss)',
    inputs: {
      purchasePrice: 250000,
      arv: 280000,
      renovationCosts: 20000,
      downPaymentPercent: 10,
      interestRate: 10,
      loanTermYears: 1,
      holdingPeriodMonths: 6,
      loanType: 'hardMoney',
      points: 2.5,
      isHardMoney: true
    },
    expectedApprox: {
      // $250k purchase + $20k rehab + closing + holding + selling = ~$315k total
      // ARV $280k means this is a loss deal (correctly identified!)
      // This demonstrates the 70% rule: purchase + rehab should be <= 70% of ARV
      // In this case: ($250k + $20k) / $280k = 96% - way too high!
      shouldBeNegative: true
    }
  },
  {
    name: 'TEST CASE 3: Loss flip (ARV too low for costs)',
    inputs: {
      purchasePrice: 300000,
      arv: 320000,
      renovationCosts: 50000,
      downPaymentPercent: 10,
      interestRate: 10,
      loanTermYears: 1,
      holdingPeriodMonths: 6,
      loanType: 'hardMoney',
      points: 2.5,
      isHardMoney: true
    },
    expectedApprox: {
      // $300k purchase + $50k rehab + costs ~ $380k total
      // ARV $320k = definite loss
      shouldBeNegative: true
    }
  },
  {
    name: 'TEST CASE 4: Sanity check - impossible profit should fail validation',
    inputs: {
      purchasePrice: 200000,
      arv: 150000, // ARV less than purchase price - should fail!
      renovationCosts: 50000,
      downPaymentPercent: 10,
      interestRate: 10,
      loanTermYears: 1,
      holdingPeriodMonths: 6,
      loanType: 'hardMoney',
      points: 2.5,
      isHardMoney: true
    },
    expectedApprox: {
      shouldBeNegative: true // ARV < purchase price should result in negative profit
    }
  }
];

// Run tests
console.log('='.repeat(80));
console.log('FIX & FLIP CALCULATION TEST SUITE');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${testCase.name}`);
  console.log('='.repeat(80));

  try {
    const results = calculateFlipReturns(testCase.inputs);

    console.log('\n--- RESULTS ---');
    console.log(`Purchase Price: $${testCase.inputs.purchasePrice.toLocaleString()}`);
    console.log(`ARV: $${testCase.inputs.arv.toLocaleString()}`);
    console.log(`Renovation Costs: $${testCase.inputs.renovationCosts?.toLocaleString()}`);
    console.log(`Down Payment: $${Math.round(results.downPayment).toLocaleString()}`);
    console.log(`Cash Required: $${Math.round(results.cashRequired).toLocaleString()}`);
    console.log(`Total Investment: $${Math.round(results.totalInvestment).toLocaleString()}`);
    console.log(`Total Project Cost: $${Math.round(results.totalProjectCost).toLocaleString()}`);
    console.log(`Holding Costs: $${Math.round(results.holdingCosts).toLocaleString()}`);
    console.log(`Selling Costs: $${Math.round(results.sellingCosts).toLocaleString()}`);
    console.log(`Net Profit: $${Math.round(results.netProfit).toLocaleString()}`);
    console.log(`ROI: ${results.roi.toFixed(2)}%`);
    console.log(`Profit Margin: ${results.profitMargin.toFixed(2)}%`);

    // Validation results
    console.log('\n--- VALIDATION ---');
    console.log(`Valid: ${results.validation.isValid}`);
    if (results.validation.errors.length > 0) {
      console.log(`Errors: ${results.validation.errors.join(', ')}`);
    }
    if (results.validation.warnings.length > 0) {
      console.log(`Warnings: ${results.validation.warnings.join(', ')}`);
    }

    // Check expectations
    let testPassed = true;
    const reasons: string[] = [];

    if (testCase.expectedApprox.shouldBePositive && results.netProfit <= 0) {
      testPassed = false;
      reasons.push(`Expected positive profit, got $${Math.round(results.netProfit).toLocaleString()}`);
    }

    if (testCase.expectedApprox.shouldBeNegative && results.netProfit >= 0) {
      testPassed = false;
      reasons.push(`Expected negative profit, got $${Math.round(results.netProfit).toLocaleString()}`);
    }

    if (testCase.expectedApprox.shouldBeBreakEven) {
      // Break-even defined as profit between -$10k and +$10k
      if (Math.abs(results.netProfit) > 10000) {
        testPassed = false;
        reasons.push(`Expected break-even, got $${Math.round(results.netProfit).toLocaleString()}`);
      }
    }

    // Sanity checks
    if (results.netProfit > testCase.inputs.arv) {
      testPassed = false;
      reasons.push(`IMPOSSIBLE: Net profit ($${Math.round(results.netProfit).toLocaleString()}) exceeds ARV ($${testCase.inputs.arv.toLocaleString()})`);
    }

    if (results.roi > 1000) {
      testPassed = false;
      reasons.push(`UNREALISTIC: ROI of ${results.roi.toFixed(2)}% is too high`);
    }

    if (results.totalProjectCost < testCase.inputs.purchasePrice) {
      testPassed = false;
      reasons.push(`IMPOSSIBLE: Total project cost less than purchase price`);
    }

    // Check validation caught issues
    if (testCase.inputs.arv < testCase.inputs.purchasePrice && results.validation.isValid) {
      testPassed = false;
      reasons.push('Validation should have caught ARV < purchase price');
    }

    console.log('\n--- TEST RESULT ---');
    if (testPassed) {
      console.log('PASSED');
      passed++;
    } else {
      console.log('FAILED');
      reasons.forEach(r => console.log(`  - ${r}`));
      failed++;
    }

  } catch (error) {
    console.error('ERROR:', error);
    failed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${testCases.length}`);

if (failed > 0) {
  console.log('\nSome tests failed! Review the output above for details.');
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
  process.exit(0);
}
