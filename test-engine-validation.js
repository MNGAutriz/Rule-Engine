const LoyaltyEngine = require('./engine/LoyaltyEngine');

/**
 * Comprehensive test suite to validate the loyalty engine
 * Tests all sample scenarios from the generalized input template
 */
class EngineValidationTest {
  constructor() {
    this.engine = new LoyaltyEngine();
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive engine validation tests...\n');

    // Wait for engine to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test all scenarios from the requirements
    await this.testAccountRegistration();
    await this.testBasePurchase();
    await this.testMultiplePurchaseIn60Days();
    await this.testCampaignBasedPurchase();
    await this.testBottleRecycling();
    await this.testSkinAssessment();
    await this.testBirthMonthBonus();
    await this.testBasketThresholdBonus();
    await this.testProductMultiplier();
    await this.testProductComboBonus();
    await this.testVIPStatusMultiplier();
    await this.testManualAdjustments();

    this.printTestResults();
  }

  async testAccountRegistration() {
    console.log('🧪 Testing Account Registration...');
    const input = {
      "eventId": "evt_001",
      "eventType": "INTERACTION",
      "timestamp": "2025-06-01T10:00:00Z",
      "market": "JP",
      "channel": "LINE",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_001",
      "context": {
        "externalId": "reg001",
        "storeId": ""
      },
      "attributes": {}
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Account Registration', {
      expectedPoints: 150,
      expectedRuleId: 'INTERACTION_REGISTRY_POINT'
    });
  }

  async testBasePurchase() {
    console.log('🧪 Testing Base Purchase...');
    const input = {
      "eventId": "evt_002",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-02T12:00:00Z",
      "market": "HK",
      "channel": "WECHAT",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_002",
      "context": {
        "externalId": "txn_234",
        "storeId": ""
      },
      "attributes": {
        "amount": 1500,
        "srpAmount": 1600,
        "currency": "HKD",
        "skuList": ["SKU001", "SKU002"]
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Base Purchase', {
      expectedPoints: 1600,
      expectedRuleId: 'ORDER_BASE_POINT'
    });
  }

  async testMultiplePurchaseIn60Days() {
    console.log('🧪 Testing 2X Purchase in 60 Days...');
    
    // Reset test data specifically for this test
    const { resetTestData } = require('./reset-test-data');
    await resetTestData();
    
    const input = {
      "eventId": "evt_003",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-10T15:00:00Z",
      "market": "JP",
      "channel": "WECHAT",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_003",
      "context": {
        "externalId": "txn_500",
        "storeId": ""
      },
      "attributes": {
        "amount": 1000,
        "currency": "JPY"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, '2X Purchase in 60 Days', {
      expectedRuleId: 'ORDER_MULTIPLE_POINT'
    });
  }

  async testCampaignBasedPurchase() {
    console.log('🧪 Testing Campaign-Based Purchase...');
    const input = {
      "eventId": "evt_004",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-15T14:00:00Z",
      "market": "HK",
      "channel": "LINE",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_004",
      "context": {
        "externalId": "txn_912",
        "storeId": ""
      },
      "attributes": {
        "amount": 1000,
        "currency": "HKD"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Campaign-Based Purchase', {
      expectedPoints: 300,
      expectedRuleId: 'FLEXIBLE_CAMPAIGN_BONUS',
      expectedCampaignCode: 'CAMP2025SUMMER'
    });
  }

  async testBottleRecycling() {
    console.log('🧪 Testing Bottle Recycling...');
    const input = {
      "eventId": "evt_005",
      "eventType": "INTERACTION",
      "timestamp": "2025-06-10T10:00:00Z",
      "market": "JP",
      "channel": "COUNTER",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_005",
      "context": {
        "externalId": "recycle_881",
        "storeId": "STORE_A"
      },
      "attributes": {
        "recycledCount": 3
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Bottle Recycling', {
      expectedPoints: 150,
      expectedRuleId: 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR'
    });
  }

  async testSkinAssessment() {
    console.log('🧪 Testing Skin Assessment...');
    const input = {
      "eventId": "evt_006",
      "eventType": "INTERACTION",
      "timestamp": "2025-06-25T10:00:00Z",
      "market": "HK",
      "channel": "LINE",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_006",
      "context": {
        "externalId": "skinTest_01",
        "storeId": ""
      },
      "attributes": {
        "skinTestDate": "2025-06-25"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Skin Assessment', {
      expectedPoints: 75,
      expectedRuleId: 'INTERACTION_ADJUST_POINT_BY_FIRST_ORDER_LIMIT_DAYS'
    });
  }

  async testBirthMonthBonus() {
    console.log('🧪 Testing Birth Month Bonus...');
    const input = {
      "eventId": "evt_007",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-10T16:00:00Z",
      "market": "TW",
      "channel": "WECHAT",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_007",
      "context": {
        "externalId": "txn_567",
        "storeId": ""
      },
      "attributes": {
        "amount": 800,
        "currency": "TWD"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Birth Month Bonus', {
      expectedRuleId: 'FIRST_PURCHASE_BIRTH_MONTH_BONUS'
    });
  }

  async testBasketThresholdBonus() {
    console.log('🧪 Testing Basket Threshold Bonus...');
    const input = {
      "eventId": "evt_008",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-18T12:00:00Z",
      "market": "HK",
      "channel": "LINE",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_008",
      "context": {
        "externalId": "txn_820",
        "storeId": ""
      },
      "attributes": {
        "srpAmount": 5500,
        "currency": "HKD"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Basket Threshold Bonus', {
      expectedPoints: 200,
      expectedRuleId: 'FLEXIBLE_BASKET_AMOUNT'
    });
  }

  async testProductMultiplier() {
    console.log('🧪 Testing Product Multiplier...');
    const input = {
      "eventId": "evt_009",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-17T13:00:00Z",
      "market": "TW",
      "channel": "COUNTER",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_009",
      "context": {
        "externalId": "txn_980",
        "storeId": ""
      },
      "attributes": {
        "skuList": ["FTE_SKU_001"],
        "amount": 1000,
        "currency": "TWD"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Product Multiplier', {
      expectedRuleId: 'FLEXIBLE_PRODUCT_MULTIPLIER'
    });
  }

  async testProductComboBonus() {
    console.log('🧪 Testing Product Combo Bonus...');
    const input = {
      "eventId": "evt_010",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-19T15:00:00Z",
      "market": "HK",
      "channel": "COUNTER",
      "productLine": "ESSENCE_SERIES",
      "consumerId": "user_010",
      "context": {
        "externalId": "txn_combo_01",
        "storeId": ""
      },
      "attributes": {
        "skuList": ["SKU_X", "SKU_Y"],
        "comboTag": "COMBO_MOISTURE_SET"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Product Combo Bonus', {
      expectedPoints: 250,
      expectedRuleId: 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'
    });
  }

  async testVIPStatusMultiplier() {
    console.log('🧪 Testing VIP Status Multiplier...');
    const input = {
      "eventId": "evt_011",
      "eventType": "PURCHASE",
      "timestamp": "2025-06-11T13:00:00Z",
      "market": "TW",
      "channel": "COUNTER",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_011",
      "context": {
        "externalId": "txn_777",
        "storeId": "VIP_STORE_001"
      },
      "attributes": {
        "amount": 2000,
        "currency": "TWD"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'VIP Status Multiplier', {
      expectedRuleId: 'FLEXIBLE_VIP_MULTIPLIER'
    });
  }

  async testManualAdjustments() {
    console.log('🧪 Testing Manual Adjustments...');
    const input = {
      "eventId": "evt_012",
      "eventType": "ADJUSTMENT",
      "timestamp": "2025-06-26T10:00:00Z",
      "market": "HK",
      "channel": "COUNTER",
      "productLine": "PREMIUM_SERIES",
      "consumerId": "user_012",
      "context": {
        "externalId": "manual_011",
        "storeId": ""
      },
      "attributes": {
        "adjustedPoints": 300,
        "note": "Manual correction for missed bonus"
      }
    };

    const result = await this.engine.processEvent(input);
    this.validateResult(result, 'Manual Adjustments', {
      expectedPoints: 300,
      expectedRuleId: 'INTERACTION_ADJUST_POINT_BY_MANAGER'
    });
  }

  validateResult(result, testName, expectations) {
    console.log(`📋 Validating ${testName}...`);
    console.log(`   Result:`, JSON.stringify(result, null, 2));
    
    const isValid = this.checkExpectations(result, expectations);
    
    this.testResults.push({
      testName,
      isValid,
      result,
      expectations
    });

    if (isValid) {
      console.log(`   ✅ ${testName} PASSED`);
    } else {
      console.log(`   ❌ ${testName} FAILED`);
    }
    console.log('');
  }

  checkExpectations(result, expectations) {
    // Check if result follows the generalized output template
    const requiredFields = ['consumerId', 'eventId', 'eventType', 'totalPointsAwarded', 'pointBreakdown', 'errors', 'resultingBalance'];
    
    for (const field of requiredFields) {
      if (!(field in result)) {
        console.log(`   ❌ Missing required field: ${field}`);
        return false;
      }
    }

    // Check point breakdown structure
    if (!Array.isArray(result.pointBreakdown)) {
      console.log(`   ❌ pointBreakdown should be an array`);
      return false;
    }

    // Check if expected rule triggered
    if (expectations.expectedRuleId && result.pointBreakdown.length > 0) {
      const hasExpectedRule = result.pointBreakdown.some(bp => bp.ruleId === expectations.expectedRuleId);
      if (!hasExpectedRule) {
        console.log(`   ❌ Expected rule ${expectations.expectedRuleId} not found in breakdown`);
        return false;
      }
    }

    // Check expected points
    if (expectations.expectedPoints !== undefined) {
      if (result.totalPointsAwarded !== expectations.expectedPoints) {
        console.log(`   ❌ Expected ${expectations.expectedPoints} points, got ${result.totalPointsAwarded}`);
        return false;
      }
    }

    // Check campaign code if specified
    if (expectations.expectedCampaignCode) {
      const hasCampaignCode = result.pointBreakdown.some(bp => bp.campaignCode === expectations.expectedCampaignCode);
      if (!hasCampaignCode) {
        console.log(`   ❌ Expected campaign code ${expectations.expectedCampaignCode} not found`);
        return false;
      }
    }

    return true;
  }

  printTestResults() {
    console.log('\n🏁 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.isValid).length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    const failedTests = this.testResults.filter(r => !r.isValid);
    if (failedTests.length > 0) {
      console.log('\nFailed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test.testName}`);
      });
    }

    console.log('\n📊 Engine Statistics:');
    console.log(this.engine.getEngineStats());
  }
}

// Run the tests
async function runTests() {
  const validator = new EngineValidationTest();
  await validator.runAllTests();
}

// Export for use as module or run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = EngineValidationTest;
