# Backend - Universal Rules Engine API

A comprehensive, market-agnostic rule-based reward system API that powers global expansion across markets, campaigns, and business models. Built with **Express.js** and designed for scalability, flexibility, and ease of integration.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Application                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  API Gateway    │  │   Middleware    │  │   Controllers   │   │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │   │
│  │  │ /api/     │  │  │  │ CORS      │  │  │  │ Events    │  │   │
│  │  │ /health   │  │  │  │ JSON      │  │  │  │ Rules     │  │   │
│  │  │ Security  │  │  │  │ Logging   │  │  │  │ Consumers │  │   │
│  │  │ Rate Limit│  │  │  │ Error     │  │  │  │ Campaigns │  │   │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Business Logic Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │    Services     │  │  Rules Engine   │  │  Facts Engine   │   │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │   │
│  │  │ Campaign  │  │  │  │ JSON      │  │  │  │ Context   │  │   │
│  │  │ Consumer  │  │  │  │ Rules     │  │  │  │ Enrichment│  │   │
│  │  │ CDP       │  │  │  │ Processor │  │  │  │ Consumer  │  │   │
│  │  │ Points    │  │  │  │ Priority  │  │  │  │ History   │  │   │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         Helper Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  Calculation    │  │   Validation    │  │   Formatting    │   │
│  │    Helpers      │  │     Helpers     │  │     Helpers     │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         Data Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  JSON Rules     │  │   Mock Data     │  │   File System   │   │
│  │  Configuration  │  │    Storage      │  │     Logging     │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 16.x or higher
- **npm** 7.x or higher
- **Git** for version control

### Installation & Setup

1. **Clone and Navigate**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file (optional - defaults are provided):
   ```bash
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=debug
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Installation**
   ```bash
   curl http://localhost:3000/health
   ```

### Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `npm start` | Production server | `npm start` |
| `npm run dev` | Development with hot reload | `npm run dev` |
| `npm test` | Run test suite | `npm test` |
| `npm run test:watch` | Watch mode testing | `npm run test:watch` |
| `npm run lint` | Code linting | `npm run lint` |
| `npm run format` | Code formatting | `npm run format` |

## 📂 Project Structure

```
backend/
├── app.js                      # Main application entry point
├── package.json                # Dependencies and scripts
├── package-lock.json           # Lock file for consistent installs
├── .env                        # Environment variables (optional)
├── .gitignore                  # Git ignore rules
├── data/                       # Mock data storage
│   ├── events.json             # Event transaction history
│   ├── users.json              # Consumer/user data
│   ├── campaigns.json          # Campaign definitions
│   └── system-stats.json       # System statistics
├── engine/                     # Core processing engines
│   ├── FactsEngine.js          # Event context and data preparation
│   ├── RulesEngine.js          # Rule processing and execution
│   └── helpers/                # Processing utility functions
│       ├── CalculationHelpers.js   # Mathematical calculations
│       ├── ValidationHelpers.js    # Input and business validation
│       └── FormattingHelpers.js    # Response and data formatting
├── logs/                       # Application logging
│   ├── app.log                 # General application logs
│   ├── error.log               # Error-specific logs
│   └── debug.log               # Debug and trace logs
├── rules/                      # JSON rule definitions
│   ├── basket-threshold-rules.json     # Shopping cart rules
│   ├── consumer-attribute-rules.json   # Consumer-based rules
│   ├── product-multiplier-rules.json   # Product-specific rules
│   └── transaction-rules.json          # Transaction-based rules
├── services/                   # Business logic services
│   ├── CampaignService.js      # Campaign management
│   ├── CDPService.js           # Customer Data Platform integration
│   ├── ConsumerService.js      # Consumer profile management
│   ├── mockDatabase.js         # Mock database operations
│   └── PointsExpirationService.js  # Points lifecycle management
└── src/                        # Source code organization
    ├── config/                 # Configuration management
    │   └── index.js            # Application configuration
    ├── controllers/            # Request handlers
    │   ├── campaignController.js       # Campaign operations
    │   ├── consumerController.js       # Consumer operations
    │   ├── defaultsController.js       # System defaults
    │   ├── eventsController.js         # Event processing
    │   ├── rulesController.js          # Rule management
    │   ├── rulesManagementController.js # Advanced rule operations
    │   └── index.js                    # Controller exports
    ├── middleware/             # Express middleware
    │   └── errorHandler.js     # Centralized error handling
    ├── routes/                 # API route definitions
    │   ├── campaigns.js        # Campaign routes
    │   ├── consumer.js         # Consumer routes
    │   ├── defaults.js         # System defaults routes
    │   ├── events.js           # Event processing routes
    │   ├── rules.js            # Rule management routes
    │   ├── rulesManagement.js  # Advanced rule routes
    │   └── index.js            # Route aggregation
    ├── utils/                  # Common utilities
    │   ├── logger.js           # Logging utilities
    │   ├── validators.js       # Input validation
    │   └── index.js            # Utility exports
    └── validators/             # Input validation logic
        ├── eventValidators.js  # Event-specific validation
        ├── validationTestResults.js # Validation test cases
        └── index.js            # Validator exports
```

## 🌐 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently, the API operates without authentication. Future versions will include:
- JWT token-based authentication
- Role-based access control
- API key management

### Common Headers
```
Content-Type: application/json
Accept: application/json
```

### Response Format
All API responses follow this consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-07-08T12:00:00.000Z",
  "requestId": "uuid-v4-string"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "eventType",
      "reason": "Must be one of: PURCHASE, REGISTRATION, RECYCLE, CONSULTATION, ADJUSTMENT, REDEMPTION"
    }
  },
  "timestamp": "2025-07-08T12:00:00.000Z",
  "requestId": "uuid-v4-string"
}
```

## 🔌 API Endpoints

### System Health

#### GET /health
**Description**: System health check and status information

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": "2h 15m 30s",
    "memory": {
      "used": "45.2 MB",
      "total": "512 MB"
    },
    "dependencies": {
      "database": "connected",
      "rules_engine": "operational",
      "external_services": "available"
    }
  }
}
```

### Event Processing

#### POST /api/events
**Description**: Process business events and calculate rewards

**Request Body**:
```json
{
  "eventType": "PURCHASE",
  "consumerId": "12345",
  "market": "JP",
  "eventData": {
    "amount": 1000,
    "currency": "JPY",
    "productId": "PROD123",
    "transactionId": "TXN456",
    "timestamp": "2025-07-08T12:00:00.000Z"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "eventId": "EVT789",
    "consumerId": "12345",
    "pointsAwarded": 100,
    "rulesApplied": [
      {
        "ruleId": "purchase-base-rate",
        "ruleName": "Base Purchase Rate",
        "pointsAwarded": 100,
        "calculation": "1000 * 0.1 = 100"
      }
    ],
    "consumerBalance": {
      "totalPoints": 1250,
      "availablePoints": 1100,
      "pendingPoints": 150
    }
  }
}
```

#### GET /api/events
**Description**: Get event history with pagination

**Query Parameters**:
- `consumerId` (optional): Filter by consumer ID
- `eventType` (optional): Filter by event type
- `market` (optional): Filter by market
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "EVT789",
        "eventType": "PURCHASE",
        "consumerId": "12345",
        "market": "JP",
        "pointsAwarded": 100,
        "timestamp": "2025-07-08T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 250,
      "itemsPerPage": 50
    }
  }
}
```

#### GET /api/events/:id
**Description**: Get specific event details

**Response**:
```json
{
  "success": true,
  "data": {
    "eventId": "EVT789",
    "eventType": "PURCHASE",
    "consumerId": "12345",
    "market": "JP",
    "eventData": {
      "amount": 1000,
      "currency": "JPY",
      "productId": "PROD123"
    },
    "processing": {
      "rulesApplied": [
        {
          "ruleId": "purchase-base-rate",
          "ruleName": "Base Purchase Rate",
          "pointsAwarded": 100
        }
      ],
      "processingTime": "23ms",
      "status": "completed"
    }
  }
}
```

### Rule Management

#### GET /api/rules
**Description**: Get all rules with optional filtering

**Query Parameters**:
- `type` (optional): Filter by rule type
- `market` (optional): Filter by market
- `active` (optional): Filter by active status (true/false)

**Response**:
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "ruleId": "purchase-base-rate",
        "name": "Base Purchase Rate",
        "description": "Award 1 point per 10 JPY spent",
        "type": "PURCHASE",
        "market": "JP",
        "active": true,
        "priority": 10,
        "conditions": {
          "all": [
            {
              "fact": "eventType",
              "operator": "equal",
              "value": "PURCHASE"
            }
          ]
        },
        "event": {
          "type": "award-points",
          "params": {
            "formula": "amount * 0.1",
            "min": 1,
            "max": 1000
          }
        }
      }
    ]
  }
}
```

#### POST /api/rules
**Description**: Create a new rule

**Request Body**:
```json
{
  "name": "New Rule",
  "description": "Rule description",
  "type": "PURCHASE",
  "market": "JP",
  "active": true,
  "priority": 10,
  "conditions": {
    "all": [
      {
        "fact": "eventType",
        "operator": "equal",
        "value": "PURCHASE"
      }
    ]
  },
  "event": {
    "type": "award-points",
    "params": {
      "formula": "amount * 0.1"
    }
  }
}
```

#### PUT /api/rules/:id
**Description**: Update an existing rule

#### DELETE /api/rules/:id
**Description**: Delete a rule

### Consumer Management

#### GET /api/consumers/:id
**Description**: Get consumer details and profile

**Response**:
```json
{
  "success": true,
  "data": {
    "consumerId": "12345",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "market": "JP",
      "memberSince": "2024-01-15T00:00:00.000Z",
      "tier": "Gold"
    },
    "pointsBalance": {
      "totalEarned": 2500,
      "totalUsed": 400,
      "availablePoints": 1850,
      "pendingPoints": 250,
      "expiringPoints": 100,
      "expirationDate": "2025-12-31T23:59:59.000Z"
    },
    "statistics": {
      "totalTransactions": 45,
      "averageTransactionValue": 1250,
      "lastActivity": "2025-07-08T10:30:00.000Z"
    }
  }
}
```

#### PUT /api/consumers/:id
**Description**: Update consumer profile

#### GET /api/consumers/:id/events
**Description**: Get consumer's event history

#### POST /api/consumers/search
**Description**: Search consumers by various criteria

**Request Body**:
```json
{
  "query": {
    "email": "john@example.com",
    "market": "JP",
    "tier": "Gold"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

### Campaign Management

#### GET /api/campaigns
**Description**: Get all campaigns

**Response**:
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "campaignId": "CAMP123",
        "name": "Summer Bonus Campaign",
        "description": "Double points on all purchases",
        "type": "BONUS_MULTIPLIER",
        "market": "JP",
        "active": true,
        "startDate": "2025-06-01T00:00:00.000Z",
        "endDate": "2025-08-31T23:59:59.000Z",
        "rules": ["purchase-summer-bonus"],
        "statistics": {
          "totalParticipants": 1250,
          "totalPointsAwarded": 125000,
          "averagePointsPerParticipant": 100
        }
      }
    ]
  }
}
```

#### POST /api/campaigns
**Description**: Create a new campaign

#### PUT /api/campaigns/:id
**Description**: Update an existing campaign

#### DELETE /api/campaigns/:id
**Description**: Delete a campaign

### System Defaults

#### GET /api/defaults
**Description**: Get system default configurations

**Response**:
```json
{
  "success": true,
  "data": {
    "markets": {
      "JP": {
        "currency": "JPY",
        "locale": "ja-JP",
        "timezone": "Asia/Tokyo",
        "basePointsRate": 0.1
      },
      "HK": {
        "currency": "HKD",
        "locale": "en-HK",
        "timezone": "Asia/Hong_Kong",
        "basePointsRate": 1.0
      }
    },
    "eventTypes": [
      "PURCHASE",
      "REGISTRATION",
      "RECYCLE",
      "CONSULTATION",
      "ADJUSTMENT",
      "REDEMPTION"
    ],
    "pointsExpiration": {
      "defaultExpirationMonths": 12,
      "warningDays": 30
    }
  }
}
```

#### POST /api/defaults
**Description**: Update system defaults

## 🎯 Business Event Types

### Event Type Details

| Event Type | Description | Typical Reward | Example Use Case |
|------------|-------------|----------------|------------------|
| **REGISTRATION** | New member signup | Welcome bonus | 150 MD for new members |
| **PURCHASE** | Product purchases | Points per currency unit | 1 MD per ¥10 spent |
| **RECYCLE** | Bottle recycling | Fixed points per item | 50 MD per bottle |
| **CONSULTATION** | Professional services | Time-based rewards | 75 MD for skin consultation |
| **ADJUSTMENT** | Manual admin changes | Variable amount | Admin correction |
| **REDEMPTION** | Point redemption | Transaction tracking | Points used for rewards |

### Event Processing Flow

1. **Event Ingestion**: API receives event data
2. **Validation**: Input validation and business rules
3. **Facts Preparation**: Context enrichment and data preparation
4. **Rule Evaluation**: Process applicable rules in priority order
5. **Calculation**: Calculate rewards and point adjustments
6. **Persistence**: Save event and update consumer balance
7. **Response**: Return processing results

## 🔧 Core Engine Components

### Rules Engine (`engine/RulesEngine.js`)

**Purpose**: Core rule processing and execution engine

**Key Features**:
- JSON-based rule definitions
- Priority-based rule execution
- Market-specific rule processing
- Event type filtering
- Condition evaluation
- Action execution

**Rule Structure**:
```javascript
{
  "ruleId": "unique-rule-identifier",
  "name": "Human-readable rule name",
  "description": "Detailed rule description",
  "type": "EVENT_TYPE",
  "market": "MARKET_CODE",
  "active": true,
  "priority": 10,
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
  },
  "event": {
    "type": "award-points",
    "params": {
      "formula": "amount * 0.1",
      "min": 1,
      "max": 1000
    }
  }
}
```

### Facts Engine (`engine/FactsEngine.js`)

**Purpose**: Event context preparation and data enrichment

**Responsibilities**:
- Event data normalization
- Consumer profile enrichment
- Historical data aggregation
- Market-specific calculations
- Derived fact generation

**Fact Categories**:
- **Event Facts**: Direct event data
- **Consumer Facts**: Profile and history data
- **Market Facts**: Market-specific configurations
- **Time Facts**: Date, time, and temporal calculations
- **Calculated Facts**: Derived values and aggregations

### Helper Modules

#### Calculation Helpers (`engine/helpers/CalculationHelpers.js`)

**Functions**:
- `calculatePoints(amount, rate, market)`: Point calculation
- `applyMultiplier(base, multiplier)`: Multiplier application
- `formatCurrency(amount, currency)`: Currency formatting
- `roundPoints(points, precision)`: Point rounding
- `calculateExpiration(date, months)`: Expiration calculation

#### Validation Helpers (`engine/helpers/ValidationHelpers.js`)

**Functions**:
- `validateEventType(type)`: Event type validation
- `validateMarket(market)`: Market validation
- `validateAmount(amount)`: Amount validation
- `validateConsumerId(id)`: Consumer ID validation
- `validateCurrency(currency)`: Currency validation

#### Formatting Helpers (`engine/helpers/FormattingHelpers.js`)

**Functions**:
- `formatResponse(data)`: Response formatting
- `formatError(error)`: Error formatting
- `formatDate(date, locale)`: Date formatting
- `formatNumber(number, locale)`: Number formatting
- `formatCurrency(amount, currency, locale)`: Currency formatting

## 🗃️ Services Layer

### Campaign Service (`services/CampaignService.js`)

**Purpose**: Campaign lifecycle management and operations

**Key Functions**:
- `createCampaign(campaignData)`: Create new campaign
- `updateCampaign(id, updates)`: Update campaign
- `deleteCampaign(id)`: Delete campaign
- `getCampaigns(filters)`: Get campaigns with filtering
- `getCampaignStats(id)`: Get campaign statistics
- `associateRules(campaignId, ruleIds)`: Associate rules with campaign

### Consumer Service (`services/ConsumerService.js`)

**Purpose**: Consumer profile and data management

**Key Functions**:
- `getConsumer(id)`: Get consumer profile
- `updateConsumer(id, updates)`: Update consumer profile
- `getConsumerEvents(id, filters)`: Get consumer event history
- `searchConsumers(query)`: Search consumers
- `getConsumerStats(id)`: Get consumer statistics
- `updatePointsBalance(id, adjustment)`: Update points balance

### CDP Service (`services/CDPService.js`)

**Purpose**: Customer Data Platform integration

**Key Functions**:
- `syncConsumerProfile(id)`: Sync profile with CDP
- `getExternalProfile(id)`: Get external profile data
- `updateExternalProfile(id, data)`: Update external profile
- `getSegmentation(id)`: Get consumer segmentation
- `trackEvent(eventData)`: Track event externally

### Points Expiration Service (`services/PointsExpirationService.js`)

**Purpose**: Points lifecycle and expiration management

**Key Functions**:
- `calculateExpiration(earnedDate, market)`: Calculate expiration date
- `getExpiringPoints(consumerId)`: Get expiring points
- `expirePoints(consumerId, amount)`: Expire points
- `sendExpirationWarning(consumerId)`: Send expiration warning
- `getExpirationPolicy(market)`: Get expiration policy

## 🛡️ Security & Validation

### Input Validation

**Event Validation**:
- Event type validation against allowed types
- Market validation against supported markets
- Amount validation (positive numbers, reasonable limits)
- Currency validation against market currency
- Consumer ID validation (format and existence)

**Business Rule Validation**:
- Rule structure validation
- Condition syntax validation
- Action parameter validation
- Priority range validation
- Market compatibility validation

### Security Measures

**API Security**:
- CORS configuration for allowed origins
- Request rate limiting (configurable)
- Input sanitization and validation
- SQL injection prevention
- XSS protection

**Data Security**:
- Sensitive data masking in logs
- Error messages without data exposure
- Secure configuration management
- Environment variable protection

### Error Handling

**Error Categories**:
- `VALIDATION_ERROR`: Input validation failures
- `BUSINESS_ERROR`: Business rule violations
- `SYSTEM_ERROR`: System-level errors
- `EXTERNAL_ERROR`: External service failures
- `CONFIGURATION_ERROR`: Configuration issues

**Error Response Structure**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "problematic_field",
      "reason": "Detailed reason for error"
    }
  },
  "timestamp": "2025-07-08T12:00:00.000Z",
  "requestId": "uuid-v4-string"
}
```

## 📊 Logging & Monitoring

### Logging Strategy

**Log Levels**:
- `ERROR`: System errors and failures
- `WARN`: Warning conditions
- `INFO`: General information
- `DEBUG`: Debug information
- `TRACE`: Detailed trace information

**Log Files**:
- `logs/app.log`: General application logs
- `logs/error.log`: Error-specific logs
- `logs/debug.log`: Debug and trace logs

**Log Format**:
```json
{
  "timestamp": "2025-07-08T12:00:00.000Z",
  "level": "INFO",
  "message": "Event processed successfully",
  "requestId": "uuid-v4-string",
  "consumerId": "12345",
  "eventType": "PURCHASE",
  "pointsAwarded": 100,
  "processingTime": "23ms"
}
```

### Monitoring & Metrics

**Health Metrics**:
- System uptime and availability
- Memory and CPU usage
- Request throughput and latency
- Error rates and types
- Database connection status

**Business Metrics**:
- Events processed per minute
- Points awarded per market
- Rule execution success rates
- Consumer activity levels
- Campaign performance metrics

## 🌐 Multi-Market Support

### Market Configuration

**Supported Markets**:
- **JP (Japan)**: JPY currency, Japanese locale, Asia/Tokyo timezone
- **HK (Hong Kong)**: HKD currency, English locale, Asia/Hong_Kong timezone
- **TW (Taiwan)**: TWD currency, Chinese locale, Asia/Taipei timezone

**Market-Specific Features**:
- Currency handling and conversion
- Locale-based formatting
- Timezone considerations
- Regional business rules
- Compliance requirements

### Currency Handling

**Currency Conversion**:
- Real-time exchange rates (planned)
- Market-specific point rates
- Rounding rules per market
- Historical rate tracking

**Point Calculations**:
- Market-specific formulas
- Currency-adjusted rates
- Minimum/maximum limits
- Rounding precision

## 🔄 Data Flow & Integration

### Request Processing Flow

1. **Request Reception**: Express.js receives HTTP request
2. **Middleware Processing**: CORS, JSON parsing, logging
3. **Route Matching**: Route to appropriate controller
4. **Controller Logic**: Business logic and validation
5. **Service Layer**: Business operations and data processing
6. **Engine Processing**: Rules and facts processing
7. **Response Generation**: Format and return response

### Data Storage

**Current Implementation**:
- JSON file-based storage for development
- In-memory caching for performance
- File system logging

**Future Database Integration**:
- MongoDB for document storage
- PostgreSQL for relational data
- Redis for caching and sessions
- Elasticsearch for search and analytics

### External Integrations

**Integration Points**:
- Customer Data Platform (CDP)
- Payment processing systems
- Marketing automation platforms
- Analytics and reporting tools
- Notification services

## 🧪 Testing & Quality Assurance

### Testing Strategy

**Unit Testing**:
- Business logic testing
- Helper function testing
- Service layer testing
- Controller testing

**Integration Testing**:
- API endpoint testing
- Database integration testing
- External service mocking
- End-to-end workflows

**Test Data Management**:
- Mock data generation
- Test fixtures and scenarios
- Data cleanup and isolation
- Performance test data

### Code Quality

**Code Standards**:
- ESLint configuration
- Prettier code formatting
- JSDoc documentation
- Code review processes

**Performance Optimization**:
- Efficient rule processing
- Memory usage optimization
- Database query optimization
- Response time monitoring

## 🚀 Deployment & Operations

### Environment Configuration

**Development Environment**:
```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

**Production Environment**:
```bash
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Support

**Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
```

### Production Considerations

**Scalability**:
- Horizontal scaling support
- Load balancing configuration
- Database connection pooling
- Caching strategies

**Reliability**:
- Health check endpoints
- Graceful shutdown handling
- Error recovery mechanisms
- Circuit breaker patterns

**Security**:
- HTTPS enforcement
- API rate limiting
- Input validation
- Security headers

## 📈 Performance Optimization

### Caching Strategy

**In-Memory Caching**:
- Rule definitions caching
- Consumer profile caching
- Market configuration caching
- Calculation result caching

**External Caching**:
- Redis for session storage
- CDN for static assets
- Database query caching
- API response caching

### Database Optimization

**Query Optimization**:
- Efficient indexing strategy
- Query performance monitoring
- Connection pooling
- Read replica support

**Data Archiving**:
- Historical data archiving
- Log rotation policies
- Data retention rules
- Backup strategies

## 🔮 Future Enhancements

### Short-term Roadmap

**Authentication & Authorization**:
- JWT token-based authentication
- Role-based access control
- API key management
- OAuth integration

**Real-time Features**:
- WebSocket support
- Real-time notifications
- Live dashboard updates
- Event streaming

### Long-term Vision

**Advanced Analytics**:
- Machine learning integration
- Predictive analytics
- Consumer behavior analysis
- Campaign optimization

**Microservices Architecture**:
- Service decomposition
- API gateway implementation
- Service mesh integration
- Container orchestration

**Global Expansion**:
- Multi-region deployment
- Data sovereignty compliance
- Performance optimization
- Localization support

---

## 📞 Support & Documentation

### Getting Help

**Documentation**:
- API documentation at `/api/docs`
- Code documentation via JSDoc
- README files for each component
- Integration guides and examples

**Troubleshooting**:
- Check application logs in `/logs/`
- Verify configuration in `/src/config/`
- Test API endpoints with health checks
- Review error responses and codes

**Development Support**:
- Code examples and templates
- Best practices documentation
- Development workflow guides
- Testing and debugging tips

### Contributing

**Development Process**:
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Run quality checks
5. Submit pull request
6. Code review and merge

**Code Standards**:
- Follow existing code style
- Write comprehensive tests
- Document new features
- Update README files

---

*This backend API serves as the foundation for the Universal Rules Engine, providing robust, scalable, and flexible reward processing capabilities for global market expansion.*
