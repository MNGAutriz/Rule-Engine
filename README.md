# Loyalty Points Rule Engine

A focused rule-based loyalty points system supporting nine core event types across multiple markets (Japan, Hong Kong, Taiwan).

## Overview

This system processes loyalty events and calculates points using configurable JSON rules. It supports market-specific business logic while maintaining a clean, maintainable architecture.

## Supported Event Types

The rule engine handles these nine core event types:

1. **Registration Bonus** - Welcome points for new member registration
2. **Campaign Bonus** - Time-based promotional bonuses and multipliers
3. **Birth Month Bonus** - Special multipliers during customer's birth month
4. **Basket Threshold Bonus** - Bonuses for reaching spending thresholds
5. **Product Multiplier** - Enhanced points for specific products/lines
6. **Product Combo Bonus** - Fixed bonuses for purchasing product combinations
7. **VIP Status Multiplier** - Enhanced point rates for VIP members
8. **Manual Adjustments** - Administrative point adjustments
9. **Bottle Recycling** - Environmental initiative with yearly limits

## Architecture

```
┌─────────────────┐
│   API Routes    │ ← REST endpoints for events
├─────────────────┤
│ Loyalty Engine  │ ← Core processing logic
├─────────────────┤
│  Facts Engine   │ ← Context preparation
├─────────────────┤
│   JSON Rules    │ ← Business rule definitions
└─────────────────┘
```

## Core Components

### Rule Engine (`engine/LoyaltyEngine.js`)
- Processes events through JSON rules
- Calculates points based on market-specific logic
- Handles rule priority and execution order

### Facts Engine (`engine/FactsEngine.js`)
- Prepares event context and customer data
- Enriches facts with derived calculations
- Provides market-specific fact preparation

### Rule Files (`rules/`)
- `transaction-rules.json` - Registration, campaign, base purchase, recycling, manual adjustments
- `consumer-attribute-rules.json` - Birth month and VIP status bonuses
- `product-multiplier-rules.json` - Product-specific multipliers and combo bonuses
- `basket-threshold-rules.json` - Spending threshold bonuses

## Japan Expiration Control

Japan points expire based on a 24-month rolling window, controlled by:

- **Service**: `services/PointsExpirationService.js` calculates expiration dates
- **Consumer Data**: `expirationMonths` field in user profiles (Japan = 24 months)
- **Storage**: Expiration dates stored with each point transaction
- **Rule Engine**: Does NOT control expiration - this is handled at the data/service layer

## API Endpoints

### Process Events
```
POST /api/events
{
  "eventType": "PURCHASE|INTERACTION|ADJUSTMENT",
  "consumerId": "consumer_123",
  "market": "JP|HK|TW",
  "attributes": { ... },
  "context": { ... }
}
```

### Consumer Management
```
GET /api/consumer/:id
POST /api/consumer
PUT /api/consumer/:id
```

## Installation & Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:3000`

## Rule Configuration

Rules are defined in JSON files with this structure:

```json
{
  "conditions": {
    "all": [
      { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
      { "fact": "market", "operator": "equal", "value": "JP" }
    ]
  },
  "event": {
    "type": "ORDER_BASE_POINT",
    "params": {
      "jpRate": 0.1,
      "description": "JP base purchase - 1 MD per 10 JPY"
    }
  },
  "priority": 10
}
```

## Market-Specific Logic

### Japan (JP)
- Registration: 150 MD bonus
- Base purchase: 1 MD per 10 JPY
- Campaign multipliers: 1.5x during promotions
- Expiration: 24 months rolling

### Hong Kong/Taiwan (HK/TW)
- Base purchase: 1 MD per 1 HKD/TWD SRP
- Campaign bonuses: +300 MD fixed amounts
- Basket thresholds: Tiered bonus structure

## Testing

Test the API endpoints using tools like Postman or curl:

```bash
# Test event processing
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"eventType": "PURCHASE", "consumerId": "consumer_123", "market": "JP"}'

# Check consumer balance
curl -X GET http://localhost:3000/api/consumer/consumer_123
```

## File Structure

```
Rule-Engine/
├── app.js                     # Main application
├── api/                       # REST API routes
├── engine/                    # Core processing logic
├── rules/                     # JSON rule definitions
├── services/                  # Business services
├── data/                      # Mock data files
└── utils/                     # Validation utilities
```
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        Rule Engine Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │json-rules-  │ │    Rule     │ │   Points    │ │   Bottle    ││
│  │   engine    │ │Definitions  │ │ Expiration  │ │ Recycling   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │    Users    │ │   Events    │ │    Rules    │ │   Campaigns ││
│  │    (JSON)   │ │   (JSON)    │ │   (JSON)    │ │   (JSON)    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Loyalty Engine (`engine/LoyaltyEngine.js`)

The central orchestrator that coordinates all rule processing and point calculations.

**Purpose**: 
- Manages the lifecycle of rule evaluation
- Handles event processing and point calculation
- Coordinates between different service layers
- Provides a unified interface for rule execution

**Key Responsibilities**:
- Initialize and configure the `json-rules-engine`
- Load rules from JSON configuration files
- Process events through the rule engine
- Calculate points based on rule outcomes
- Update consumer balances
- Log events for audit trails

**Design Pattern**: Factory + Observer Pattern
- Factory: Creates dynamic event handlers based on rule types
- Observer: Listens for rule engine events and processes them

### 2. Facts Engine (`engine/FactsEngine.js`)

Provides dynamic fact computation for rule evaluation.

**Purpose**:
- Define all available facts that rules can use
- Compute complex facts from simple data
- Cache frequently accessed facts
- Provide a clean abstraction for rule conditions

**Fact Categories**:
- **Basic Facts**: `eventType`, `consumerId`, `market`, `timestamp`
- **Context Facts**: `context.externalId`, `context.storeId`
- **Attribute Facts**: `attributes.amount`, `attributes.recycledCount`
- **Computed Facts**: `isBirthMonth`, `daysSinceFirstPurchase`, `isVIP`
- **Consumer Facts**: `purchaseCount`, `totalSpent`, `tags`

**Almanac Integration**:
The Facts Engine works with `json-rules-engine`'s almanac system to:
- Provide lazy evaluation of facts
- Cache computed values within a single rule evaluation
- Enable complex fact dependencies

### 3. Rule Definitions (`engine/RuleDefinitions.js`)

Centralized rule logic organized by business domains.

**Purpose**:
- Organize rules by logical categories
- Provide programmatic rule generation
- Support campaign-specific rule modifications
- Enable rule composition and reuse

**Rule Categories**:
- **Basket Rules**: Purchase amount thresholds, product combinations
- **Consumer Rules**: VIP status, demographic-based bonuses
- **Product Rules**: SKU-specific multipliers, category bonuses
- **Transaction Rules**: Event-type specific processing, market rules

## Rule Engine Design

### JSON Rules Engine Integration

The system uses `json-rules-engine` as its core rule processing engine. This provides:

**Advantages**:
- **Declarative Rules**: Rules are defined in JSON, making them easy to read and modify
- **Event-Driven**: Rules trigger events that can be handled programmatically
- **Flexible Conditions**: Support for complex boolean logic (AND, OR, NOT)
- **Fact-Based**: Rules evaluate against a dynamic set of facts
- **Extensible**: Easy to add new operators, facts, and event types

**Rule Structure**:
```json
{
  "name": "Rule Name",
  "conditions": {
    "all": [
      { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
      { "fact": "amount", "operator": "greaterThan", "value": 1000 }
    ]
  },
  "event": {
    "type": "ORDER_BASE_POINT",
    "params": {
      "rate": 0.1,
      "description": "Base purchase points"
    }
  },
  "priority": 10
}
```

### Rule Processing Flow

1. **Event Ingestion**: API receives an event (purchase, interaction, etc.)
2. **Fact Preparation**: Facts Engine computes all available facts
3. **Rule Evaluation**: `json-rules-engine` evaluates all loaded rules
4. **Event Triggering**: Matching rules trigger their associated events
5. **Point Calculation**: Event handlers calculate points based on rule parameters
6. **Balance Update**: Consumer balance is updated with calculated points
7. **Event Logging**: All activities are logged for audit purposes

### Dynamic Event Handlers

Instead of hardcoded event handlers, the system uses a dynamic approach:

```javascript
createDynamicEventHandler(eventType) {
  return async (event, almanac) => {
    // Generic handler that processes any event type
    const points = this.calculatePoints(eventType, event, almanac);
    this.addToBreakdown(eventType, points, event);
  };
}
```

This design allows:
- Adding new event types without code changes
- Rule-driven point calculation logic
- Consistent event handling across all rule types

## Market-Specific Rules

### Japan (JP) Market

**Base Purchase Points**:
- Rate: 1 MD per 10 JPY spent
- Formula: `amount × 0.1`
- Trigger: `ORDER_BASE_POINT`

**Registration Bonus**:
- Points: 150 MD (one-time)
- Condition: Campaign active
- Trigger: `INTERACTION_REGISTRY_POINT`

**2X Purchase Bonus**:
- Condition: Second purchase within 60 days
- Multiplier: 2×
- Trigger: `ORDER_MULTIPLE_POINT`

**Bottle Recycling**:
- Rate: 50 MD per bottle
- Limit: 5 bottles per year (250 MD max)
- Trigger: `INTERACTION_ADJUST_POINT_TIMES_PER_YEAR`

**Point Expiration**:
- Rule: 365 days from last ORDER
- Extension: Only ORDER events extend expiration
- Type: Individual point expiration

### Hong Kong (HK) Market

**Base Purchase Points**:
- Rate: 1 MD per 1 HKD spent (based on SRP)
- Uses retail price, not paid price
- Trigger: `ORDER_COMPLETED`

**VIP Multipliers**:
- Condition: Consumer and counter in VIP list
- Trigger: `FLEXIBLE_VIP_MULTIPLIER`

**Campaign Bonuses**:
- Flexible bonuses (e.g., Lunar New Year +300 MD)
- Trigger: `FLEXIBLE_CAMPAIGN_BONUS`

**Point Expiration**:
- Rule: Fiscal year-based (July 1 - June 30)
- Extension: Configurable events
- Type: Bulk expiration

### Taiwan (TW) Market

Similar to HK market with Taiwan-specific configurations.

## API Documentation

### Consumer API

#### Get Consumer Points
```http
GET /api/consumer/points?consumerId={id}
```

**Response**:
```json
{
  "consumerId": "user_001",
  "total": 2450,
  "available": 2450,
  "used": 0,
  "nextExpiration": "2026-01-15T10:00:00.000Z",
  "expirationRule": "365",
  "market": "JP",
  "timezone": "Asia/Tokyo"
}
```

#### Get Consumer History
```http
GET /api/consumer/history?consumerId={id}&limit={number}
```

### Events API

#### Submit Event
```http
POST /api/events/submit
```

**Request Body**:
```json
{
  "eventId": "evt_001",
  "consumerId": "user_001",
  "eventType": "PURCHASE",
  "market": "JP",
  "timestamp": "2025-07-04T10:00:00Z",
  "attributes": {
    "amount": 5000,
    "currency": "JPY"
  }
}
```

### Recycling API

#### Submit Bottle Recycling
```http
POST /api/recycling/bottles
```

**Request Body**:
```json
{
  "consumerId": "user_001",
  "bottleCount": 2,
  "market": "JP",
  "storeId": "STORE_A"
}
```

#### Get Recycling Status
```http
GET /api/recycling/status?consumerId={id}
```

## Event Types

### PURCHASE
Purchase transactions that earn base points.

**Required Attributes**:
- `amount`: Purchase amount
- `currency`: Currency code
- `srpAmount`: Suggested retail price (for HK/TW)

### INTERACTION
Various customer interactions like registration, recycling, surveys.

**Subtypes** (identified by `context.externalId`):
- `reg_*`: Registration events
- `recycle_*`: Bottle recycling events
- `survey_*`: Survey completion events

### ADJUSTMENT
Manual point adjustments by administrators.

**Required Attributes**:
- `adjustedPoints`: Points to add/remove
- `reason`: Adjustment reason

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd Rule-Engine
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
# Optional: Set custom port
export PORT=3000
```

4. **Start the server**:
```bash
npm start
# or
node app.js
```

### Project Structure

```
Rule-Engine/
├── api/                    # API route handlers
│   ├── consumerRouter.js   # Consumer-related endpoints
│   ├── eventsRouter.js     # Event processing endpoints
│   ├── campaignRouter.js   # Campaign management
│   └── recyclingRouter.js  # Bottle recycling endpoints
├── engine/                 # Core rule engine components
│   ├── LoyaltyEngine.js    # Main orchestrator
│   ├── FactsEngine.js      # Fact definitions and computation
│   ├── RuleDefinitions.js  # Programmatic rule definitions
│   └── facts.js            # Legacy fact definitions
├── services/               # Business logic services
│   ├── consumerService.js  # Consumer data management
│   ├── CampaignService.js  # Campaign management
│   ├── PointsExpirationService.js  # Expiration logic
│   └── BottleRecyclingService.js   # Recycling logic
├── rules/                  # JSON rule definitions
│   ├── transaction-rules.json      # Event-based rules
│   ├── consumer-attribute-rules.json  # Consumer-based rules
│   ├── product-multiplier-rules.json  # Product-based rules
│   └── basket-threshold-rules.json    # Basket-based rules
├── data/                   # Data storage (JSON files)
│   ├── users.json          # Consumer data
│   └── events.json         # Event history
├── utils/                  # Utility functions
│   └── validators.js       # Input validation
└── app.js                  # Main application entry point
```

## Usage Examples

### Processing a Purchase Event

```javascript
// Submit a purchase event
const purchaseEvent = {
  eventId: "evt_001",
  consumerId: "user_001",
  eventType: "PURCHASE",
  market: "JP",
  timestamp: "2025-07-04T10:00:00Z",
  attributes: {
    amount: 5000,
    currency: "JPY",
    skuList: ["SKU_001", "SKU_002"]
  }
};

// API call
fetch('/api/events/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(purchaseEvent)
});
```

### Checking Point Expiration

```javascript
// Get point expiration details
fetch('/api/consumer/expiration?consumerId=user_001')
  .then(response => response.json())
  .then(data => {
    console.log('Next expiration:', data.nextExpiration);
    console.log('Expiration rule:', data.expirationRule);
  });
```

### Bottle Recycling

```javascript
// Submit bottle recycling
const recyclingEvent = {
  consumerId: "user_001",
  bottleCount: 2,
  market: "JP",
  storeId: "STORE_A"
};

fetch('/api/recycling/bottles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(recyclingEvent)
});
```

## Configuration

### Adding New Rules

1. **Create Rule JSON**:
```json
{
  "name": "New Rule Name",
  "conditions": {
    "all": [
      { "fact": "eventType", "operator": "equal", "value": "PURCHASE" },
      { "fact": "amount", "operator": "greaterThan", "value": 10000 }
    ]
  },
  "event": {
    "type": "FLEXIBLE_CAMPAIGN_BONUS",
    "params": {
      "fixedBonus": 1000,
      "description": "High-value purchase bonus"
    }
  },
  "priority": 5
}
```

2. **Add to appropriate rule file** in the `rules/` directory

3. **Restart the server** to load new rules

### Adding New Facts

1. **Define fact in FactsEngine**:
```javascript
this.factDefinitions.set('newFact', (params) => {
  // Computation logic
  return computedValue;
});
```

2. **Add to engine initialization**:
```javascript
async addFactsToEngine(engine) {
  // ...existing facts...
  
  engine.addFact('newFact', async (params, almanac) => {
    return this.factDefinitions.get('newFact')(params);
  });
}
```

### Market-Specific Configuration

Each market can have different:
- **Point calculation rates**
- **Expiration rules**
- **Available campaigns**
- **VIP programs**
- **Bonus structures**

Configuration is handled through:
- Rule conditions (`"fact": "market", "operator": "equal", "value": "JP"`)
- Service-level market detection
- Market-specific parameter sets

## Testing

### Unit Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "LoyaltyEngine"
```

### API Testing

Use the provided Postman collection or curl commands:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test consumer points
curl "http://localhost:3000/api/consumer/points?consumerId=user_001"

# Test event submission
curl -X POST http://localhost:3000/api/events/submit \
  -H "Content-Type: application/json" \
  -d '{"eventId":"test_001","consumerId":"user_001","eventType":"PURCHASE","market":"JP","attributes":{"amount":1000}}'
```

## Troubleshooting

### Common Issues

1. **Rules not triggering**:
   - Verify rule conditions match fact values
   - Ensure rule priority is appropriate
   - Check JSON rule file syntax

2. **Point calculations incorrect**:
   - Review event handler logic in LoyaltyEngine.js
   - Check market-specific parameters
   - Verify attribute mapping

3. **Expiration dates wrong**:
   - Confirm market configuration in consumer data
   - Check consumer's expirationMonths setting
   - Review PointsExpirationService.js logic

### Logging

The system provides comprehensive logging:

```javascript
// Enable detailed logging
console.log('Processing event:', eventData.eventId);
console.log('Calculated points:', points);
console.log('Rule triggered:', ruleName);
```

### Performance Monitoring

Monitor key metrics:
- **Rule evaluation time**
- **Fact computation overhead**
- **Memory usage for large rule sets**
- **Database query performance**

## Future Enhancements

### Planned Features

1. **Real-time rule updates** without server restart
2. **A/B testing framework** for rule experimentation
3. **Machine learning integration** for personalized bonuses
4. **Webhook support** for external system integration
5. **Rule versioning** and rollback capabilities
6. **Advanced analytics** and reporting dashboard

### Scalability Considerations

1. **Database migration** from JSON to SQL/NoSQL
2. **Caching layer** for frequently accessed data
3. **Rule compilation** for improved performance
4. **Microservices architecture** for large-scale deployment
5. **Event streaming** for real-time processing

---

For more information, consult the API documentation or contact the development team.
