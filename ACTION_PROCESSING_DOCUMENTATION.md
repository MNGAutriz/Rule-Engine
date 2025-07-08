# Action Processing Flow - Complete Technical Documentation

## 🚀 Overview

This document provides an **exhaustive, step-by-step breakdown** of how actions are processed in the Universal Rules Engine, including every file, function, and data transformation that occurs during the complete request-response cycle.

## 🏗️ Complete Action Processing Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Frontend Files                                 │ │
│  │  src/services/api.ts          → API Client & HTTP Service                  │ │
│  │  src/pages/EventProcessor.tsx → Event Processing UI Component              │ │
│  │  src/components/              → UI Components for Forms & Display          │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                       HTTP REQUEST
                                            │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Express.js Layer                               │ │
│  │  app.js                       → Main Express Application                   │ │
│  │  src/config/index.js          → Configuration Management                   │ │
│  │  src/middleware/errorHandler.js → Error Handling Middleware               │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                     │
│                                       MIDDLEWARE                                │
│                                            │                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                                 Routing Layer                               │ │
│  │  src/routes/index.js          → Main Router Aggregator                     │ │
│  │  src/routes/events.js         → Event-specific Routes                      │ │
│  │  src/routes/consumer.js       → Consumer-specific Routes                   │ │
│  │  src/routes/rules.js          → Rule-specific Routes                       │ │
│  │  src/routes/campaigns.js      → Campaign-specific Routes                   │ │
│  │  src/routes/rulesManagement.js → Rule Management Routes                    │ │
│  │  src/routes/defaults.js       → System Defaults Routes                     │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                     │
│                                       ROUTE MATCHING                            │
│                                            │                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Controllers Layer                              │ │
│  │  src/controllers/index.js     → Controller Exports                         │ │
│  │  src/controllers/eventsController.js → Event Processing Logic              │ │
│  │  src/controllers/consumerController.js → Consumer Management Logic         │ │
│  │  src/controllers/rulesController.js → Rule Query Logic                     │ │
│  │  src/controllers/campaignController.js → Campaign Management Logic         │ │
│  │  src/controllers/rulesManagementController.js → Rule CRUD Logic            │ │
│  │  src/controllers/defaultsController.js → System Defaults Logic             │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                     │
│                                       BUSINESS LOGIC                            │
│                                            │                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Validation Layer                               │ │
│  │  src/validators/eventValidators.js → Event Data Validation                 │ │
│  │  src/validators/index.js      → Validator Exports                          │ │
│  │  src/utils/validators.js      → Utility Validators                         │ │
│  │  engine/helpers/ValidationHelpers.js → Core Validation Logic              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                     │
│                                       DATA VALIDATION                           │
│                                            │                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                               Services Layer                                │ │
│  │  services/consumerService.js  → Consumer Profile Management                │ │
│  │  services/CampaignService.js  → Campaign Operations                        │ │
│  │  services/CDPService.js       → Customer Data Platform Integration         │ │
│  │  services/PointsExpirationService.js → Points Lifecycle Management        │ │
│  │  services/mockDatabase.js     → Data Storage Operations                    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                     │
│                                       SERVICE CALLS                             │
│                                            │                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                               Core Engine Layer                             │ │
│  │  engine/RulesEngine.js        → Main Rules Processing Engine               │ │
│  │  engine/FactsEngine.js        → Event Context & Data Enrichment            │ │
│  │  engine/helpers/CalculationHelpers.js → Mathematical Calculations          │ │
│  │  engine/helpers/ValidationHelpers.js → Business Logic Validation           │ │
│  │  engine/helpers/FormattingHelpers.js → Response Formatting                 │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                     │
│                                       RULE PROCESSING                           │
│                                            │                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                                 Data Layer                                  │ │
│  │  data/events.json             → Event Transaction History                  │ │
│  │  data/users.json              → Consumer Profile Data                      │ │
│  │  rules/transaction-rules.json → Transaction Processing Rules               │ │
│  │  rules/consumer-attribute-rules.json → Consumer-based Rules               │ │
│  │  rules/product-multiplier-rules.json → Product-specific Rules             │ │
│  │  rules/basket-threshold-rules.json → Shopping Cart Rules                  │ │
│  │  logs/app.log                 → Application Logs                           │ │
│  │  logs/error.log               → Error Logs                                 │ │
│  │  logs/debug.log               → Debug Logs                                 │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Request-Response Flow

### **Phase 1: Frontend Request Initiation**

#### **1.1 User Action Trigger**
**Files Involved:**
- `frontend/src/pages/EventProcessor.tsx`
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/common/LoadingButton.tsx`

**Process:**
1. User fills out event form in EventProcessor component
2. Form validation occurs client-side
3. User clicks "Process Event" button
4. LoadingButton component shows loading state
5. Form data is prepared for API call

#### **1.2 API Service Call**
**Files Involved:**
- `frontend/src/services/api.ts`
- `frontend/src/lib/utils.ts`

**Process:**
```typescript
// In api.ts
export const processEvent = async (eventData: EventData) => {
  try {
    const response = await api.post('/api/events/process', eventData);
    return response.data;
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
};
```

**Data Flow:**
```
EventProcessor.tsx → Form Data → api.ts → HTTP POST → Backend
```

### **Phase 2: Backend Request Reception**

#### **2.1 Express.js Application Entry**
**Files Involved:**
- `backend/app.js`
- `backend/src/config/index.js`

**Process:**
1. Express server receives HTTP POST request
2. Configuration loaded from `src/config/index.js`
3. CORS middleware processes request origin
4. JSON parsing middleware converts request body

**Code Flow:**
```javascript
// In app.js
app.use(cors(config.cors));
app.use(express.json({
  limit: config.request.jsonLimit,
  strict: true
}));
```

#### **2.2 Middleware Stack Processing**
**Files Involved:**
- `backend/src/middleware/errorHandler.js`
- `backend/src/utils/logger.js`

**Process:**
1. Request logging middleware captures request details
2. Error handling middleware prepares error catching
3. Request proceeds to routing layer

**Logging Output:**
```json
{
  "timestamp": "2025-07-08T12:00:00.000Z",
  "level": "INFO",
  "message": "POST /api/events/process",
  "method": "POST",
  "path": "/api/events/process",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

### **Phase 3: Routing & Controller Dispatch**

#### **3.1 Route Matching**
**Files Involved:**
- `backend/src/routes/index.js`
- `backend/src/routes/events.js`

**Process:**
1. Main router (`src/routes/index.js`) receives request
2. Routes to events router: `router.use('/events', eventsRouter)`
3. Events router matches: `router.post('/process', EventsController.processEvent)`

**Route Definition:**
```javascript
// In src/routes/events.js
/**
 * POST /api/events/process
 * Core API that processes all consumer events and computes points via the rule engine
 */
router.post('/process', EventsController.processEvent);
```

#### **3.2 Controller Method Execution**
**Files Involved:**
- `backend/src/controllers/eventsController.js`
- `backend/src/controllers/index.js`

**Process:**
1. EventsController.processEvent method is called
2. Request body is extracted and destructured
3. Initial logging occurs

**Data Extraction:**
```javascript
// In eventsController.js
const { eventId, eventType, timestamp, market, channel, consumerId, context, attributes } = req.body;
```

### **Phase 4: Data Validation & Sanitization**

#### **4.1 Event Data Sanitization**
**Files Involved:**
- `backend/src/validators/eventValidators.js`

**Process:**
1. Raw request data is sanitized
2. EventValidators.sanitizeEventData() cleans input
3. Malicious data is removed/escaped

**Sanitization Logic:**
```javascript
// In eventValidators.js
static sanitizeEventData(eventData) {
  // Remove potential XSS attacks
  // Validate data types
  // Clean string inputs
  return sanitizedData;
}
```

#### **4.2 Comprehensive Event Validation**
**Files Involved:**
- `backend/src/validators/eventValidators.js`
- `backend/engine/helpers/ValidationHelpers.js`
- `backend/services/consumerService.js`

**Process:**
1. EventValidators.validateEvent() is called
2. ValidationHelpers.validateCompleteEvent() performs deep validation
3. Consumer service validates consumer existence

**Validation Steps:**
```javascript
// In eventValidators.js
static async validateEvent(eventData, consumerService) {
  try {
    ValidationHelpers.validateCompleteEvent(eventData, consumerService);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.message,
      field: this.extractFieldFromError(error.message)
    };
  }
}
```

**Validation Checks:**
- Event type validation (PURCHASE, REGISTRATION, RECYCLE, etc.)
- Consumer ID format and existence
- Market validation (JP, HK, TW)
- Amount validation (positive numbers)
- Currency validation
- Required field presence

### **Phase 5: Rules Engine Processing**

#### **5.1 Rules Engine Initialization**
**Files Involved:**
- `backend/engine/RulesEngine.js`
- `backend/engine/FactsEngine.js`

**Process:**
1. New RulesEngine instance is created
2. Engine initialization occurs if not already initialized
3. Facts engine is initialized
4. Rules are loaded from JSON files
5. Event handlers are registered

**Initialization Flow:**
```javascript
// In RulesEngine.js
async initializeEngine() {
  if (this.initialized) return;
  
  // Add facts to engine
  await this.factsEngine.addFactsToEngine(this.engine);
  
  // Load rules from JSON files
  await this.loadRulesFromFiles();
  
  // Initialize event handlers
  this.initializeEventHandlers();
  
  this.initialized = true;
}
```

#### **5.2 Rule File Loading**
**Files Involved:**
- `backend/rules/transaction-rules.json`
- `backend/rules/consumer-attribute-rules.json`
- `backend/rules/product-multiplier-rules.json`
- `backend/rules/basket-threshold-rules.json`

**Process:**
1. Rules directory is scanned for JSON files
2. Each JSON file is loaded and parsed
3. Rules are added to the json-rules-engine
4. Rule validation occurs

**Rule Loading Logic:**
```javascript
// In RulesEngine.js
async loadRulesFromFiles() {
  const rulesDir = path.join(__dirname, '../rules');
  const ruleFiles = fs.readdirSync(rulesDir).filter(file => file.endsWith('.json'));
  
  for (const file of ruleFiles) {
    const filePath = path.join(rulesDir, file);
    const rulesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const rule of rulesData) {
      this.engine.addRule(rule);
    }
  }
}
```

#### **5.3 Event Handler Registration**
**Files Involved:**
- `backend/engine/RulesEngine.js`

**Process:**
1. Event handlers are registered for each rule type
2. Dynamic event handlers are created
3. Success/failure handlers are registered

**Handler Registration:**
```javascript
// In RulesEngine.js
initializeEventHandlers() {
  this.engine.on('INTERACTION_REGISTRY_POINT', this.createDynamicEventHandler('INTERACTION_REGISTRY_POINT'));
  this.engine.on('ORDER_BASE_POINT', this.createDynamicEventHandler('ORDER_BASE_POINT'));
  this.engine.on('FLEXIBLE_CAMPAIGN_BONUS', this.createDynamicEventHandler('FLEXIBLE_CAMPAIGN_BONUS'));
  // ... more handlers
}
```

### **Phase 6: Facts Engine Data Enrichment**

#### **6.1 Consumer Data Enrichment**
**Files Involved:**
- `backend/engine/FactsEngine.js`
- `backend/services/consumerService.js`
- `backend/data/users.json`

**Process:**
1. Consumer profile is loaded from data/users.json
2. Consumer history is retrieved
3. Consumer attributes are calculated
4. Balance information is loaded

**Consumer Data Loading:**
```javascript
// In FactsEngine.js
async enrichConsumerData(consumerId, almanac) {
  const consumer = await consumerService.getConsumerById(consumerId);
  const balance = await consumerService.getBalance(consumerId);
  const history = await consumerService.getHistory(consumerId);
  
  return {
    consumer,
    balance,
    history,
    // ... derived attributes
  };
}
```

#### **6.2 Event Context Preparation**
**Files Involved:**
- `backend/engine/FactsEngine.js`
- `backend/services/CampaignService.js`

**Process:**
1. Event data is normalized
2. Market-specific calculations are applied
3. Campaign data is loaded if applicable
4. Transaction amounts are calculated

**Context Preparation:**
```javascript
// In FactsEngine.js
async prepareEventContext(eventData) {
  const context = {
    baseAmount: eventData.attributes?.amount || 0,
    currency: eventData.attributes?.currency || 'JPY',
    market: eventData.market || 'JP',
    // ... calculated fields
  };
  
  return context;
}
```

#### **6.3 Facts Addition to Engine**
**Files Involved:**
- `backend/engine/FactsEngine.js`

**Process:**
1. All facts are added to the json-rules-engine
2. Async fact functions are registered
3. Fact dependencies are resolved

**Fact Registration:**
```javascript
// In FactsEngine.js
async addFactsToEngine(engine) {
  for (const [factName, factFunction] of this.factDefinitions) {
    engine.addFact(factName, factFunction);
  }
}
```

### **Phase 7: Rule Execution & Processing**

#### **7.1 Rule Engine Execution**
**Files Involved:**
- `backend/engine/RulesEngine.js`
- External: `json-rules-engine` package

**Process:**
1. Event data is passed to engine.run()
2. Rules are evaluated against facts
3. Matching rules trigger their events
4. Event handlers are called for triggered rules

**Engine Execution:**
```javascript
// In RulesEngine.js
async processEvent(eventData) {
  await this.initializeEngine();
  
  // Store enriched data for handlers
  this.currentEnrichedEventData = await this.enrichEventData(eventData);
  
  // Execute rules
  const { events } = await this.engine.run(this.currentEnrichedEventData);
  
  // Process triggered events
  return this.processTriggeredEvents(events);
}
```

#### **7.2 Rule Condition Evaluation**
**Files Involved:**
- `backend/rules/*.json` files
- External: `json-rules-engine` package

**Process:**
1. Each rule's conditions are evaluated
2. Facts are compared against rule conditions
3. Boolean logic (AND/OR) is applied
4. Matching rules are identified

**Example Rule Evaluation:**
```json
{
  "conditions": {
    "all": [
      {
        "fact": "eventType",
        "operator": "equal",
        "value": "PURCHASE"
      },
      {
        "fact": "market",
        "operator": "equal",
        "value": "JP"
      }
    ]
  }
}
```

#### **7.3 Event Handler Execution**
**Files Involved:**
- `backend/engine/RulesEngine.js`
- `backend/engine/helpers/CalculationHelpers.js`

**Process:**
1. Triggered rules execute their event handlers
2. Dynamic event handlers calculate rewards
3. Calculation helpers perform mathematical operations
4. Results are accumulated in rewardBreakdown

**Handler Execution:**
```javascript
// In RulesEngine.js
createDynamicEventHandler(eventType) {
  return async (event, almanac) => {
    const market = await almanac.factValue('market');
    const baseAmount = await almanac.factValue('transactionAmount');
    
    // Calculate points based on rule parameters
    const points = CalculationHelpers.calculatePoints(
      baseAmount, 
      event.params.rate, 
      market
    );
    
    this.rewardBreakdown.push({
      eventType,
      points,
      calculation: event.params
    });
  };
}
```

### **Phase 8: Points Calculation & Business Logic**

#### **8.1 Mathematical Calculations**
**Files Involved:**
- `backend/engine/helpers/CalculationHelpers.js`

**Process:**
1. Base point calculations are performed
2. Multipliers are applied
3. Rounding rules are applied
4. Min/max limits are enforced

**Calculation Examples:**
```javascript
// In CalculationHelpers.js
static calculatePoints(amount, rate, market) {
  const basePoints = amount * rate;
  const roundedPoints = Math.round(basePoints);
  return Math.max(1, Math.min(roundedPoints, 10000));
}
```

#### **8.2 Consumer Balance Updates**
**Files Involved:**
- `backend/services/consumerService.js`
- `backend/data/users.json`

**Process:**
1. Current balance is retrieved
2. New points are added to balance
3. Transaction count is incremented
4. Balance is saved to data file

**Balance Update Logic:**
```javascript
// In consumerService.js
function updateBalance(id, balanceData) {
  const users = db.load('users.json');
  
  users[id].balance = {
    total: balanceData.total,
    available: balanceData.available,
    used: balanceData.used,
    transactionCount: balanceData.transactionCount
  };
  
  db.save('users.json', users);
}
```

#### **8.3 Transaction History Recording**
**Files Involved:**
- `backend/services/consumerService.js`
- `backend/data/events.json`

**Process:**
1. Event details are recorded
2. Transaction history is updated
3. Audit trail is maintained
4. Data is persisted to files

### **Phase 9: Response Formation & Formatting**

#### **9.1 Response Data Aggregation**
**Files Involved:**
- `backend/src/controllers/eventsController.js`
- `backend/engine/helpers/FormattingHelpers.js`

**Process:**
1. Results from rules engine are collected
2. Point breakdown is compiled
3. Balance information is included
4. Response format is standardized

**Response Formation:**
```javascript
// In eventsController.js
const response = {
  consumerId: result.consumerId,
  eventId: result.eventId,
  eventType: result.eventType,
  totalPointsAwarded: result.totalPointsAwarded,
  pointBreakdown: result.pointBreakdown || [],
  errors: result.errors || [],
  resultingBalance: {
    total: result.resultingBalance?.total || 0,
    available: result.resultingBalance?.available || 0,
    used: result.resultingBalance?.used || 0,
    transactionCount: result.resultingBalance?.transactionCount || 1
  }
};
```

#### **9.2 Response Formatting**
**Files Involved:**
- `backend/engine/helpers/FormattingHelpers.js`

**Process:**
1. Data is formatted for frontend consumption
2. Numbers are formatted with proper precision
3. Dates are formatted in ISO format
4. Currency values are formatted

### **Phase 10: Error Handling & Logging**

#### **10.1 Error Handling**
**Files Involved:**
- `backend/src/middleware/errorHandler.js`
- `backend/src/utils/logger.js`

**Process:**
1. Any errors are caught by middleware
2. Error details are logged
3. Error response is formatted
4. Sensitive data is masked

**Error Handling Logic:**
```javascript
// In errorHandler.js
const errorHandler = (error, req, res, next) => {
  logger.error('Request processing error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An error occurred processing your request'
  });
};
```

#### **10.2 Comprehensive Logging**
**Files Involved:**
- `backend/src/utils/logger.js`
- `backend/logs/app.log`
- `backend/logs/error.log`
- `backend/logs/debug.log`

**Process:**
1. Request details are logged
2. Processing steps are traced
3. Performance metrics are recorded
4. Error details are captured

**Logging Output:**
```json
{
  "timestamp": "2025-07-08T12:00:00.000Z",
  "level": "INFO",
  "message": "Event processed successfully",
  "eventId": "EVT_001",
  "consumerId": "12345",
  "pointsAwarded": 100,
  "processingTime": "23ms"
}
```

### **Phase 11: HTTP Response Delivery**

#### **11.1 Response Transmission**
**Files Involved:**
- `backend/src/controllers/eventsController.js`
- `backend/app.js`

**Process:**
1. Response object is serialized to JSON
2. HTTP headers are set
3. Response is transmitted to client
4. Connection is closed

**Response Transmission:**
```javascript
// In eventsController.js
res.json(response);
```

### **Phase 12: Frontend Response Handling**

#### **12.1 API Response Processing**
**Files Involved:**
- `frontend/src/services/api.ts`
- `frontend/src/pages/EventProcessor.tsx`

**Process:**
1. HTTP response is received
2. JSON is parsed
3. Success/error handling occurs
4. UI state is updated

**Response Processing:**
```typescript
// In EventProcessor.tsx
const handleProcessEvent = async (eventData: EventData) => {
  try {
    setLoading(true);
    const result = await api.processEvent(eventData);
    setResult(result);
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### **12.2 UI State Updates**
**Files Involved:**
- `frontend/src/pages/EventProcessor.tsx`
- `frontend/src/components/display/StatusBadge.tsx`
- `frontend/src/components/common/LoadingSpinner.tsx`

**Process:**
1. Loading state is cleared
2. Result data is displayed
3. Success/error indicators are shown
4. UI components are re-rendered

## 📊 Data Flow Summary

### **Complete Data Transformation Chain**

```
1. Frontend Form Data
   ↓
2. API Request Payload
   ↓
3. Express.js Request Object
   ↓
4. Validated Event Data
   ↓
5. Enriched Facts Object
   ↓
6. Rule Engine Processing
   ↓
7. Event Handler Results
   ↓
8. Calculated Points & Balance
   ↓
9. Formatted Response Object
   ↓
10. HTTP Response
    ↓
11. Frontend Result Display
```

### **Key Data Structures**

#### **Input Event Data**
```javascript
{
  eventId: "EVT_001",
  eventType: "PURCHASE",
  consumerId: "12345",
  market: "JP",
  channel: "ONLINE",
  timestamp: "2025-07-08T12:00:00.000Z",
  context: {
    storeId: "STORE_001",
    campaignCode: "SUMMER2025"
  },
  attributes: {
    amount: 1000,
    currency: "JPY",
    productId: "PROD_123"
  }
}
```

#### **Enriched Facts Object**
```javascript
{
  // Base event data
  eventId: "EVT_001",
  eventType: "PURCHASE", 
  consumerId: "12345",
  market: "JP",
  
  // Calculated facts
  transactionAmount: 1000,
  discountedAmount: 900,
  consumerTier: "GOLD",
  isFirstPurchase: false,
  
  // Consumer data
  consumer: {
    id: "12345",
    profile: { ... },
    history: [ ... ]
  },
  
  // Campaign data
  activeCampaigns: [ ... ]
}
```

#### **Response Data**
```javascript
{
  consumerId: "12345",
  eventId: "EVT_001",
  eventType: "PURCHASE",
  totalPointsAwarded: 100,
  pointBreakdown: [
    {
      eventType: "ORDER_BASE_POINT",
      points: 100,
      calculation: "1000 * 0.1 = 100"
    }
  ],
  errors: [],
  resultingBalance: {
    total: 1250,
    available: 1100,
    used: 150,
    transactionCount: 5
  }
}
```

## 🔍 Performance Metrics

### **Typical Processing Times**
- **Input Validation**: 1-3ms
- **Rules Loading**: 5-10ms (first time only)
- **Facts Enrichment**: 10-20ms
- **Rule Execution**: 15-30ms
- **Balance Updates**: 5-10ms
- **Response Formation**: 2-5ms
- **Total Processing**: 40-80ms

### **Memory Usage**
- **Rules Engine**: ~10MB
- **Facts Cache**: ~5MB
- **Request Processing**: ~1MB per request
- **Total Memory**: ~50MB (typical)

## 🎯 Key Performance Optimizations

1. **Rules Engine Initialization**: Done once and cached
2. **Facts Caching**: Consumer data cached for repeat requests
3. **JSON Rule Loading**: Rules loaded once at startup
4. **Database Mocking**: In-memory operations for development
5. **Async Processing**: Non-blocking operations throughout

---

*This document provides the complete technical breakdown of action processing in the Universal Rules Engine, covering every file, function, and data transformation in the request-response cycle.*
