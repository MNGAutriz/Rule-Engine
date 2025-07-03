/**
 * COMPREHENSIVE POSTMAN TEMPLATES FOR LOYALTY RULE ENGINE
 * ========================================================
 * 
 * These templates provide ready-to-use Postman requests for testing all four main endpoints
 * across different markets (JP, HK, TW) with various scenarios.
 * 
 * Server URL: http://localhost:3000
 * 
 * =====================================================================================
 * 1. POST /api/events/process - Manual point adjustment and event processing
 * =====================================================================================
 */

// 1.1 Manual Point Adjustment - Japan Market
POST http://localhost:3000/api/events/process
Content-Type: application/json

{
  "eventId": "MANUAL_ADJ_JP_001",
  "consumerId": "test-jp-consumer",
  "eventType": "ADJUSTMENT",
  "timestamp": "2025-07-03T16:00:00Z",
  "market": "JP",
  "channel": "ADMIN",
  "context": {
    "ruleId": "MANUAL_ADJUSTMENT",
    "externalId": "admin_adj_001",
    "adjustmentReason": "Customer service compensation"
  },
  "attributes": {
    "adjustmentAmount": 500,
    "adjustmentType": "BONUS",
    "adminUserId": "admin001"
  }
}

// 1.2 Manual Point Adjustment - Hong Kong Market
POST http://localhost:3000/api/events/process
Content-Type: application/json

{
  "eventId": "MANUAL_ADJ_HK_001",
  "consumerId": "test-hk-consumer",
  "eventType": "MANUAL_ADJUSTMENT",
  "timestamp": "2025-07-03T16:00:00Z",
  "market": "HK",
  "channel": "ADMIN",
  "context": {
    "ruleId": "MANUAL_ADJUSTMENT",
    "externalId": "admin_adj_002",
    "adjustmentReason": "System error compensation"
  },
  "attributes": {
    "adjustmentAmount": 1000,
    "adjustmentType": "BONUS",
    "adminUserId": "admin002"
  }
}

// 1.3 Manual Point Adjustment - Taiwan Market
POST http://localhost:3000/api/events/process
Content-Type: application/json

{
  "eventId": "MANUAL_ADJ_TW_001",
  "consumerId": "test-tw-consumer",
  "eventType": "MANUAL_ADJUSTMENT",
  "timestamp": "2025-07-03T16:00:00Z",
  "market": "TW",
  "channel": "ADMIN",
  "context": {
    "ruleId": "MANUAL_ADJUSTMENT",
    "externalId": "admin_adj_003",
    "adjustmentReason": "Promotion catch-up"
  },
  "attributes": {
    "adjustmentAmount": 750,
    "adjustmentType": "BONUS",
    "adminUserId": "admin003"
  }
}

// 1.4 Purchase Event - Japan Market (with SRP calculation)
POST http://localhost:3000/api/events/process
Content-Type: application/json

{
  "eventId": "PURCHASE_JP_001",
  "consumerId": "test-jp-consumer",
  "eventType": "PURCHASE",
  "timestamp": "2025-07-03T16:00:00Z",
  "market": "JP",
  "channel": "RETAIL",
  "productLine": "PREMIUM_SERIES",
  "context": {
    "ruleId": "ORDER_BASE_POINT",
    "externalId": "pos_txn_001",
    "storeId": "store_jp_001"
  },
  "attributes": {
    "amount": 5000,
    "srpAmount": 6000,
    "currency": "JPY",
    "productCategory": "SKINCARE",
    "transactionId": "txn_jp_001"
  }
}

// 1.5 Purchase Event - Hong Kong Market (with campaign bonus)
POST http://localhost:3000/api/events/process
Content-Type: application/json

{
  "eventId": "PURCHASE_HK_001",
  "consumerId": "test-hk-consumer",
  "eventType": "PURCHASE",
  "timestamp": "2025-07-03T16:00:00Z",
  "market": "HK",
  "channel": "ONLINE",
  "productLine": "PREMIUM_SERIES",
  "context": {
    "ruleId": "ORDER_BASE_POINT",
    "externalId": "web_order_001",
    "storeId": "online_hk"
  },
  "attributes": {
    "amount": 800,
    "srpAmount": 1000,
    "currency": "HKD",
    "productCategory": "SKINCARE",
    "transactionId": "txn_hk_001"
  }
}

// 1.6 Interaction Event - Taiwan Market
POST http://localhost:3000/api/events/process
Content-Type: application/json

{
  "eventId": "INTERACTION_TW_001",
  "consumerId": "test-tw-consumer",
  "eventType": "INTERACTION",
  "timestamp": "2025-07-03T16:00:00Z",
  "market": "TW",
  "channel": "MOBILE_APP",
  "context": {
    "ruleId": "INTERACTION_POINTS",
    "externalId": "app_interaction_001",
    "interactionType": "PRODUCT_REVIEW"
  },
  "attributes": {
    "interactionValue": 1,
    "productId": "SKU_TW_001",
    "reviewRating": 5
  }
}

/**
 * =====================================================================================
 * 2. GET /api/rules/active - Active rules/campaigns with date filtering
 * =====================================================================================
 */

// 2.1 Get All Active Rules (no filters)
GET http://localhost:3000/api/rules/active

// 2.2 Get Active Rules for Japan Market
GET http://localhost:3000/api/rules/active?market=JP

// 2.3 Get Active Rules for Hong Kong Market
GET http://localhost:3000/api/rules/active?market=HK

// 2.4 Get Active Rules for Taiwan Market
GET http://localhost:3000/api/rules/active?market=TW

// 2.5 Get Active Rules with Date Range Filter
GET http://localhost:3000/api/rules/active?startDate=2025-06-01&endDate=2025-07-31

// 2.6 Get Active Rules for HK Market with Date Filter
GET http://localhost:3000/api/rules/active?market=HK&startDate=2025-06-01&endDate=2025-07-31

// 2.7 Get Active Rules with Limit
GET http://localhost:3000/api/rules/active?limit=10

// 2.8 Get Active Rules with Pagination
GET http://localhost:3000/api/rules/active?offset=0&limit=5

/**
 * =====================================================================================
 * 3. GET /api/consumer/history - Chronological point activity
 * =====================================================================================
 */

// 3.1 Get Consumer History - Japan Market
GET http://localhost:3000/api/consumer/history?consumerId=test-jp-consumer

// 3.2 Get Consumer History - Hong Kong Market
GET http://localhost:3000/api/consumer/history?consumerId=test-hk-consumer

// 3.3 Get Consumer History - Taiwan Market
GET http://localhost:3000/api/consumer/history?consumerId=test-tw-consumer

// 3.4 Get Consumer History with Date Range
GET http://localhost:3000/api/consumer/history?consumerId=test-jp-consumer&startDate=2025-06-01&endDate=2025-07-31

// 3.5 Get Consumer History with Limit
GET http://localhost:3000/api/consumer/history?consumerId=test-hk-consumer&limit=20

// 3.6 Get Consumer History with Full Filters
GET http://localhost:3000/api/consumer/history?consumerId=test-tw-consumer&startDate=2025-06-01&endDate=2025-07-31&limit=10

/**
 * =====================================================================================
 * 4. GET /api/consumer/points - Current point status with dynamic expiration
 * =====================================================================================
 */

// 4.1 Get Consumer Points - Japan Market (365-day rolling expiry)
GET http://localhost:3000/api/consumer/points?consumerId=test-jp-consumer

// 4.2 Get Consumer Points - Hong Kong Market (fiscal year expiry)
GET http://localhost:3000/api/consumer/points?consumerId=test-hk-consumer

// 4.3 Get Consumer Points - Taiwan Market (fiscal year expiry)
GET http://localhost:3000/api/consumer/points?consumerId=test-tw-consumer

// 4.4 Get Consumer Points - New User (no transactions)
GET http://localhost:3000/api/consumer/points?consumerId=new-user-001

/**
 * =====================================================================================
 * ADDITIONAL TESTING ENDPOINTS (for setup and verification)
 * =====================================================================================
 */

// 5.1 Set Consumer Market (for testing different markets)
POST http://localhost:3000/api/consumer/market
Content-Type: application/json

{
  "consumerId": "test-jp-consumer",
  "market": "JP"
}

// 5.2 Set Consumer Market - Hong Kong
POST http://localhost:3000/api/consumer/market
Content-Type: application/json

{
  "consumerId": "test-hk-consumer",
  "market": "HK"
}

// 5.3 Set Consumer Market - Taiwan
POST http://localhost:3000/api/consumer/market
Content-Type: application/json

{
  "consumerId": "test-tw-consumer",
  "market": "TW"
}

// 5.4 Get Consumer Market
GET http://localhost:3000/api/consumer/market?consumerId=test-jp-consumer

// 5.5 Get Expiration Details
GET http://localhost:3000/api/consumer/expiration?consumerId=test-jp-consumer

// 5.6 Health Check
GET http://localhost:3000/health

/**
 * =====================================================================================
 * TESTING SCENARIOS AND FLOWS
 * =====================================================================================
 */

/**
 * SCENARIO 1: Test Japan Market Rolling Expiry
 * 1. Set consumer market to JP
 * 2. Process a purchase event
 * 3. Check points (should show 365-day expiry from purchase date)
 * 4. Check history (should show purchase event)
 * 5. Process another purchase after 6 months
 * 6. Check points again (expiry should extend to 365 days from new purchase)
 */

/**
 * SCENARIO 2: Test Hong Kong Market Fiscal Year Expiry
 * 1. Set consumer market to HK
 * 2. Process multiple events throughout the year
 * 3. Check points (should show expiry on June 30 of next fiscal year)
 * 4. Check history (should show all events)
 * 5. Test campaign bonus (should trigger for current date)
 */

/**
 * SCENARIO 3: Test Taiwan Market Similar to HK
 * 1. Set consumer market to TW
 * 2. Process events
 * 3. Check points (should show fiscal year expiry like HK)
 * 4. Verify timezone handling (Asia/Taipei)
 */

/**
 * SCENARIO 4: Test Manual Point Adjustments
 * 1. Process manual adjustment events for each market
 * 2. Check that points are awarded correctly
 * 3. Verify that manual adjustments appear in history
 * 4. Test that manual adjustments don't affect expiry in JP market
 */

/**
 * SCENARIO 5: Test Active Rules Filtering
 * 1. Get all active rules
 * 2. Filter by market (JP, HK, TW)
 * 3. Filter by date range
 * 4. Test pagination
 * 5. Verify campaign rules are included with proper date filtering
 */

/**
 * =====================================================================================
 * EXPECTED RESPONSES
 * =====================================================================================
 */

/**
 * Expected Response for POST /api/events/process:
 * {
 *   "consumerId": "test-jp-consumer",
 *   "eventId": "MANUAL_ADJ_JP_001",
 *   "eventType": "MANUAL_ADJUSTMENT",
 *   "totalPointsAwarded": 500,
 *   "pointBreakdown": [
 *     {
 *       "ruleId": "MANUAL_ADJUSTMENT",
 *       "points": 500,
 *       "description": "Manual point adjustment"
 *     }
 *   ],
 *   "errors": [],
 *   "resultingBalance": {
 *     "total": 500,
 *     "available": 500,
 *     "used": 0,
 *     "version": 1
 *   }
 * }
 */

/**
 * Expected Response for GET /api/rules/active:
 * {
 *   "rules": [
 *     {
 *       "ruleId": "ORDER_BASE_POINT",
 *       "name": "Base Purchase Points",
 *       "description": "Base points for purchases",
 *       "market": "JP",
 *       "isActive": true,
 *       "priority": 1,
 *       "conditions": {...},
 *       "actions": {...}
 *     }
 *   ],
 *   "campaigns": [
 *     {
 *       "campaignId": "c0a1b2c3-d4e5-6789-hk01-abcde123456f",
 *       "name": "Summer Campaign 2025",
 *       "startDate": "2025-06-01T00:00:00Z",
 *       "endDate": "2025-07-15T23:59:59Z",
 *       "market": "HK",
 *       "isActive": true
 *     }
 *   ],
 *   "totalRules": 15,
 *   "totalCampaigns": 3
 * }
 */

/**
 * Expected Response for GET /api/consumer/history:
 * {
 *   "consumerId": "test-jp-consumer",
 *   "history": [
 *     {
 *       "eventId": "MANUAL_ADJ_JP_001",
 *       "eventType": "MANUAL_ADJUSTMENT",
 *       "timestamp": "2025-07-03T16:00:00Z",
 *       "pointsAwarded": 500,
 *       "market": "JP",
 *       "channel": "ADMIN",
 *       "description": "Manual point adjustment",
 *       "ruleId": "MANUAL_ADJUSTMENT"
 *     }
 *   ],
 *   "totalEvents": 1,
 *   "totalPointsEarned": 500
 * }
 */

/**
 * Expected Response for GET /api/consumer/points:
 * {
 *   "consumerId": "test-jp-consumer",
 *   "total": 500,
 *   "available": 500,
 *   "used": 0,
 *   "nextExpiration": "2026-07-03T16:00:00Z",
 *   "expirationRule": 365,
 *   "market": "JP",
 *   "timezone": "Asia/Tokyo"
 * }
 */
