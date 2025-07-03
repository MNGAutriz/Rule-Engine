# SK-II Loyalty Rules Engine

A flexible, OOP-based loyalty rules engine built with json-rules-engine, designed to handle complex multi-market campaigns for SK-II.

## Overview

This system implements a comprehensive loyalty points calculation engine following the generalized input/output template design. It supports 4 main rule categories and provides flexible campaign management across multiple markets (JP, HK, TW).

## Architecture

### Core Components

- **LoyaltyEngine**: Main orchestrator that processes events and calculates points
- **RuleDefinitions**: Organized rule definitions across 4 categories
- **FactsEngine**: Dynamic fact computation engine  
- **CampaignService**: Campaign management and lifecycle
- **ConsumerService**: Consumer data and CDP integration mockup

### Rule Categories

1. **Basket Rules** - Based on purchase amount, basket value thresholds
2. **Consumer Attribute Rules** - Based on VIP status, birth month, tags
3. **Product Rules** - Based on SKUs, product lines, combos
4. **Transaction Rules** - Based on purchase history, frequency, timing

## API Endpoints

### Core Event Processing
```
POST /api/events/process
POST /api/events/batch
```

### Consumer Management
```
GET /api/consumer/points?consumerId={id}
GET /api/consumer/history?consumerId={id}
GET /api/consumer/profile?consumerId={id}
PUT /api/consumer/profile
```

### Campaign Management
```
GET /api/campaigns/active
GET /api/campaigns/{campaignId}
POST /api/campaigns
PUT /api/campaigns/{campaignId}
DELETE /api/campaigns/{campaignId}
```

## Generalized Input Template

```json
{
  "eventId": "string",
  "eventType": "PURCHASE|REDEEM|INTERACTION|ADJUSTMENT",
  "timestamp": "2025-06-01T10:00:00Z",
  "market": "JP|HK|TW",
  "channel": "LINE|WECHAT|COUNTER|APP",
  "productLine": "PREMIUM_SERIES|ESSENCE_SERIES|TREATMENT_SERIES",
  "consumerId": "string",
  "context": {
    "externalId": "string",
    "storeId": "string"
  },
  "attributes": {
    "amount": "number",
    "currency": "string",
    "srpAmount": "number",
    "skuList": ["string"],
    "recycledCount": "integer",
    "skinTestDate": "string",
    "adjustedPoints": "number",
    "redeemedGiftCode": "string",
    "comboTag": "string",
    "note": "string"
  }
}
```

## Generalized Output Template

```json
{
  "consumerId": "string",
  "eventId": "string", 
  "eventType": "string",
  "totalPointsAwarded": "integer",
  "pointBreakdown": [
    {
      "ruleId": "string",
      "points": "integer", 
      "description": "string",
      "campaignId": "string",
      "campaignCode": "string",
      "campaignStart": "datetime",
      "campaignEnd": "datetime"
    }
  ],
  "errors": ["string"],
  "resultingBalance": {
    "total": "integer",
    "available": "integer", 
    "used": "integer",
    "version": "integer"
  }
}
```

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Server**
```bash
npm start
# or for development
npm run dev
```

3. **Run Sample Tests**
```bash
node test-samples.js
```

## Sample Event Examples

### 1. Account Registration
```bash
curl -X POST http://localhost:3000/api/events/process \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 2. Base Purchase
```bash
curl -X POST http://localhost:3000/api/events/process \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 3. VIP Purchase at VIP Store
```bash
curl -X POST http://localhost:3000/api/events/process \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_011",
    "eventType": "PURCHASE",
    "timestamp": "2025-06-11T13:00:00Z",
    "market": "TW", 
    "channel": "COUNTER",
    "productLine": "PREMIUM_SERIES",
    "consumerId": "user_001",
    "context": {
      "externalId": "txn_777",
      "storeId": "VIP_STORE_001"
    },
    "attributes": {
      "amount": 2000,
      "currency": "TWD"
    }
  }'
```

## Rule Examples

### Basket Threshold Rule
```json
{
  "name": "High Value Basket Bonus - HKD 5000",
  "conditions": {
    "all": [
      { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
      { "fact": "market", "operator": "equal", "value": "HK" },
      { "fact": "attributes.srpAmount", "operator": "greaterThanInclusive", "value": 5000 }
    ]
  },
  "event": {
    "type": "FLEXIBLE_BASKET_AMOUNT",
    "params": {
      "threshold": 5000,
      "bonus": 200,
      "description": "Bonus for spending over HKD 5000 SRP"
    }
  },
  "priority": 4
}
```

### VIP Multiplier Rule  
```json
{
  "name": "VIP Store Multiplier",
  "conditions": {
    "all": [
      { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
      { "fact": "isVIP", "operator": "equal", "value": true },
      { "fact": "storeType", "operator": "equal", "value": "VIP" }
    ]
  },
  "event": {
    "type": "FLEXIBLE_VIP_MULTIPLIER", 
    "params": {
      "multiplier": 2.0,
      "description": "2× VIP multiplier applied"
    }
  },
  "priority": 4
}
```

## Key Features

- **Event-Driven Architecture**: Process events in real-time with full audit trail
- **Multi-Market Support**: JP, HK, TW with currency and rate support
- **Flexible Rule Engine**: json-rules-engine powered with custom facts
- **Campaign Management**: Time-based campaign activation/deactivation
- **Consumer CDP Integration**: Mockup integration with consumer data platform
- **Point Transparency**: Detailed breakdown of how points were calculated
- **Error Handling**: Graceful handling with detailed error reporting
- **Extensible Design**: Easy to add new rule types and campaigns

## File Structure

```
├── api/
│   ├── eventsRouter.js         # Event processing endpoints
│   ├── consumerRouter.js       # Consumer management endpoints  
│   └── campaignRouter.js       # Campaign management endpoints
├── engine/
│   ├── LoyaltyEngine.js        # Main orchestrator
│   ├── RuleDefinitions.js     # Rule definitions by category
│   └── FactsEngine.js          # Dynamic fact computation
├── services/
│   ├── consumerService.js      # Consumer data & CDP mockup
│   ├── CampaignService.js      # Campaign management
│   └── mockDatabase.js         # File-based data storage
├── rules/
│   ├── basket-threshold-rules.json
│   ├── consumer-attribute-rules.json
│   ├── product-multiplier-rules.json
│   └── transaction-rules.json
├── data/
│   ├── balances.json           # Consumer point balances
│   ├── events.json             # Event history log
│   └── users.json              # CDP consumer profiles
├── utils/
│   └── validators.js           # Input validation utilities
├── app.js                      # Express server setup
├── test-samples.js             # Comprehensive test examples
└── package.json
```

## Testing

Run the comprehensive test suite that covers all sample scenarios:

```bash
node test-samples.js
```

This will process 12 different event types demonstrating:
- Registration bonuses
- Base purchase calculations  
- Campaign multipliers
- VIP benefits
- Product-specific bonuses
- Basket thresholds
- Birth month bonuses
- Recycling programs
- Manual adjustments

## Environment Configuration

The system runs on port 3000 by default. Set `PORT` environment variable to change:

```bash
PORT=8080 npm start
```

## Future Enhancements

- Database integration (replace file-based storage)
- Real CDP integration
- Point expiration handling
- Advanced campaign targeting
- A/B testing framework
- Real-time analytics dashboard
- Webhook notifications
- Rate limiting and authentication

## License

ISC License - P&G SK-II Team
