/**
 * Test file to demonstrate all the sample events from the design specification
 * Run with: node test-samples.js
 */

const LoyaltyEngine = require('./engine/LoyaltyEngine');

// Sample events following the generalized input template
const sampleEvents = [
  // 1. Account Registration
  {
    eventId: "evt_001",
    eventType: "INTERACTION",
    timestamp: "2025-06-01T10:00:00Z",
    market: "JP",
    channel: "LINE",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_001",
    context: {
      externalId: "reg001",
      storeId: ""
    },
    attributes: {}
  },

  // 2. Base Purchase in HK
  {
    eventId: "evt_002",
    eventType: "PURCHASE",
    timestamp: "2025-06-02T12:00:00Z",
    market: "HK",
    channel: "WECHAT",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_002",
    context: {
      externalId: "txn_234",
      storeId: ""
    },
    attributes: {
      amount: 1500,
      srpAmount: 1600,
      currency: "HKD",
      skuList: ["SKU001", "SKU002"]
    }
  },

  // 3. 2X Purchase in 60 Days
  {
    eventId: "evt_003",
    eventType: "PURCHASE",
    timestamp: "2025-06-10T15:00:00Z",
    market: "JP",
    channel: "WECHAT",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_003",
    context: {
      externalId: "txn_500",
      storeId: ""
    },
    attributes: {
      amount: 1000,
      currency: "JPY"
    }
  },

  // 4. Campaign-Based Purchase
  {
    eventId: "evt_004",
    eventType: "PURCHASE",
    timestamp: "2025-06-15T14:00:00Z",
    market: "HK",
    channel: "LINE",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_002",
    context: {
      externalId: "txn_912",
      storeId: ""
    },
    attributes: {
      amount: 1000,
      currency: "HKD"
    }
  },

  // 5. Bottle Recycling
  {
    eventId: "evt_005",
    eventType: "INTERACTION",
    timestamp: "2025-06-10T10:00:00Z",
    market: "JP",
    channel: "COUNTER",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_001",
    context: {
      externalId: "recycle_881",
      storeId: "STORE_A"
    },
    attributes: {
      recycledCount: 3
    }
  },

  // 6. Skin Assessment
  {
    eventId: "evt_006",
    eventType: "INTERACTION",
    timestamp: "2025-06-25T10:00:00Z",
    market: "HK",
    channel: "LINE",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_002",
    context: {
      externalId: "skinTest_01",
      storeId: ""
    },
    attributes: {
      skinTestDate: "2025-06-25"
    }
  },

  // 7. Birth Month Purchase
  {
    eventId: "evt_007",
    eventType: "PURCHASE",
    timestamp: "2025-06-10T16:00:00Z",
    market: "TW",
    channel: "WECHAT",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_001", // Birth month is June (6)
    context: {
      externalId: "txn_567",
      storeId: ""
    },
    attributes: {
      amount: 800,
      currency: "TWD"
    }
  },

  // 8. Basket Threshold Bonus
  {
    eventId: "evt_008",
    eventType: "PURCHASE",
    timestamp: "2025-06-18T12:00:00Z",
    market: "HK",
    channel: "LINE",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_002",
    context: {
      externalId: "txn_820",
      storeId: ""
    },
    attributes: {
      srpAmount: 5500,
      currency: "HKD"
    }
  },

  // 9. Product-Based Multiplier
  {
    eventId: "evt_009",
    eventType: "PURCHASE",
    timestamp: "2025-06-17T13:00:00Z",
    market: "TW",
    channel: "COUNTER",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_003",
    context: {
      externalId: "txn_980",
      storeId: ""
    },
    attributes: {
      skuList: ["FTE_SKU_001"],
      amount: 1000,
      currency: "TWD"
    }
  },

  // 10. Product Combo Bonus
  {
    eventId: "evt_010",
    eventType: "PURCHASE",
    timestamp: "2025-06-19T15:00:00Z",
    market: "HK",
    channel: "COUNTER",
    productLine: "ESSENCE_SERIES",
    consumerId: "user_002",
    context: {
      externalId: "txn_combo_01",
      storeId: ""
    },
    attributes: {
      skuList: ["SKU_X", "SKU_Y"],
      comboTag: "COMBO_MOISTURE_SET"
    }
  },

  // 11. VIP Status Multiplier
  {
    eventId: "evt_011",
    eventType: "PURCHASE",
    timestamp: "2025-06-11T13:00:00Z",
    market: "TW",
    channel: "COUNTER",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_001", // VIP user
    context: {
      externalId: "txn_777",
      storeId: "VIP_STORE_001"
    },
    attributes: {
      amount: 2000,
      currency: "TWD"
    }
  },

  // 12. Manual Adjustment
  {
    eventId: "evt_012",
    eventType: "ADJUSTMENT",
    timestamp: "2025-06-26T10:00:00Z",
    market: "HK",
    channel: "COUNTER",
    productLine: "PREMIUM_SERIES",
    consumerId: "user_002",
    context: {
      externalId: "manual_011",
      storeId: ""
    },
    attributes: {
      adjustedPoints: 300,
      note: "Manual correction for missed bonus"
    }
  }
];

async function runTests() {
  console.log('🚀 Starting SK-II Loyalty Rules Engine Tests\n');
  
  const loyaltyEngine = new LoyaltyEngine();
  
  for (let i = 0; i < sampleEvents.length; i++) {
    const event = sampleEvents[i];
    
    console.log(`\n--- Test ${i + 1}: ${event.eventId} ---`);
    console.log(`Event Type: ${event.eventType}`);
    console.log(`Consumer: ${event.consumerId}`);
    console.log(`Market: ${event.market} | Channel: ${event.channel}`);
    
    if (event.attributes) {
      if (event.attributes.amount) console.log(`Amount: ${event.attributes.amount} ${event.attributes.currency}`);
      if (event.attributes.srpAmount) console.log(`SRP Amount: ${event.attributes.srpAmount} ${event.attributes.currency}`);
      if (event.attributes.skuList) console.log(`SKUs: ${event.attributes.skuList.join(', ')}`);
      if (event.attributes.recycledCount) console.log(`Recycled Count: ${event.attributes.recycledCount}`);
      if (event.attributes.adjustedPoints) console.log(`Adjusted Points: ${event.attributes.adjustedPoints}`);
    }
    
    try {
      const result = await loyaltyEngine.processEvent(event);
      
      console.log(`\n✅ Total Points Awarded: ${result.totalPointsAwarded}`);
      
      if (result.pointBreakdown.length > 0) {
        console.log('📊 Point Breakdown:');
        result.pointBreakdown.forEach(breakdown => {
          console.log(`  • ${breakdown.description}: ${breakdown.points} points`);
          if (breakdown.campaignCode) {
            console.log(`    Campaign: ${breakdown.campaignCode}`);
          }
        });
      }
      
      console.log(`💰 Resulting Balance: ${result.resultingBalance.available} available / ${result.resultingBalance.total} total`);
      
      if (result.errors.length > 0) {
        console.log('⚠️  Errors:', result.errors);
      }
      
    } catch (error) {
      console.log(`❌ Error processing event: ${error.message}`);
    }
  }
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { sampleEvents, runTests };
