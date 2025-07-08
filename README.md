# Universal Rules Engine

A comprehensive, market-agnostic rule-based reward system supporting global expansion across markets, campaigns, and business models. This full-stack solution combines a powerful **Express.js backend** with a modern **React frontend** dashboard.

## �️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend Dashboard                           │
│                     (React + TypeScript)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Dashboard  │  │   Event     │  │  Campaign   │  │  Consumer   │ │
│  │   Overview  │  │ Processor   │  │  Manager    │  │   Query     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────────────────────
                                │
                           REST API Layer
                                │
┌──────────────────────────────────────────────────────────────────┐
│                      Backend API Server                          │
│                       (Express.js)                               │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   API Routes    │  │   Controllers   │  │    Services     │   │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │   │
│  │  │ /events   │  │  │  │ Event     │  │  │  │ Campaign  │  │   │
│  │  │ /rules    │  │  │  │ Rules     │  │  │  │ Consumer  │  │   │
│  │  │ /campaigns│  │  │  │ Consumer  │  │  │  │ CDP       │  │   │
│  │  │ /consumers│  │  │  │ Campaign  │  │  │  │ Points    │  │   │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                       Rules Engine Core                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Facts Engine  │  │  Rules Engine   │  │     Helpers     │   │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │   │
│  │  │ Context   │  │  │  │ JSON      │  │  │  │Calculation│  │   │
│  │  │ Enrichment│  │  │  │ Rules     │  │  │  │Validation │  │   │
│  │  │ Consumer  │  │  │  │ Priority  │  │  │  │Formatting │  │   │
│  │  │ History   │  │  │  │ Execution │  │  │  │   Utils   │  │   │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────────────│
                                │
                          Data Layer
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         Data Storage                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  JSON Rules     │  │   Mock Data     │  │     Logs        │   │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │   │
│  │  │ Basket    │  │  │  │ Events    │  │  │  │ App       │  │   │
│  │  │ Consumer  │  │  │  │ Users     │  │  │  │ Error     │  │   │
│  │  │ Product   │  │  │  │ Campaigns │  │  │  │ Debug     │  │   │
│  │  │Transaction│  │  │  │ History   │  │  │  │ Audit     │  │   │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend dashboard will be available at `http://localhost:5173`

### 3. Health Check

Visit `http://localhost:3000/health` to verify the backend is running, and `http://localhost:5173` to access the dashboard.

## 🎯 Business-Friendly Event Structure

This system uses **direct business event types** making it easy for business users to understand and configure rewards.

## Supported Event Types

The rules engine handles these core business event types:

| Event Type | Purpose | Example Reward |
|------------|---------|----------------|
| **REGISTRATION** | New member signup | Welcome bonus: 150 MD |
| **PURCHASE** | Product purchases | 1 MD per ¥10 (JP), 1 MD per $1 (HK/TW) |
| **RECYCLE** | Bottle recycling | 50 MD per bottle (max 5/year) |
| **CONSULTATION** | Skin tests, beauty consultations | 75 MD within 60 days of first purchase |
| **ADJUSTMENT** | Manual admin changes | Custom amount by admin |
| **REDEMPTION** | Point redemption events | Transaction tracking |

## 🏗️ Modular Architecture

```
┌─────────────────────┐
│    API Routes       │ ← REST endpoints for events
├─────────────────────┤
│   Rules Engine      │ ← Core processing logic
│  ┌─────────────────┐│
│  │ Calculation     ││ ← Point calculation helpers
│  │ Validation      ││ ← Input validation helpers  
│  │ Formatting      ││ ← Response formatting helpers
│  └─────────────────┘│
├─────────────────────┤
│   Facts Engine      │ ← Simple fact preparation
├─────────────────────┤
│   JSON Rules        │ ← Business rule definitions
└─────────────────────┘
```

## Core Components

### Rule Engine (`engine/RulesEngine.js`)
- Processes events through JSON rules
- Calculates rewards based on market-specific logic
- Handles rule priority and execution order

### Facts Engine (`engine/FactsEngine.js`)
- Prepares event context and customer data
- Enriches facts with derived calculations
- Provides market-agnostic fact preparation

### Rule Files (`rules/`)
- `transaction-rules.json` - Registration, campaign, base purchase, activity rewards, manual adjustments
- `consumer-attribute-rules.json` - Timed bonuses and tier-based multipliers
- `product-multiplier-rules.json` - Product-specific multipliers and combination rewards
- `basket-threshold-rules.json` - Spending threshold rewards

## Market Expiration Control

Points expiration is controlled by flexible business rules:

- **Service**: `services/PointsExpirationService.js` calculates expiration dates
- **Consumer Data**: `expirationMonths` field in user profiles configurable per market
- **Storage**: Expiration dates stored with each reward transaction
- **Rule Engine**: Does NOT control expiration - this is handled at the data/service layer

Market examples:
- Japan: **Yearly cumulative** (365 days from last transaction)
- Hong Kong/Taiwan: **Fiscal year-based** (July 1 to June 30)
- Other markets: **Configurable** based on business requirements

## API Endpoints

### Process Events
```
POST /api/events
{
  "eventType": "PURCHASE|INTERACTION|ADJUSTMENT",
  "consumerId": "consumer_123",
  "market": "JP|HK|TW|US|EU|...",
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

Rules are defined in JSON files with this flexible structure:

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
      "rate": 0.1,
      "description": "Base transaction reward - 1 point per 10 currency units"
    }
  },
  "priority": 10
}
```

## Market Logic Examples

### Japan (JP)
- Registration: 150 points bonus
- Base transaction: 1 point per 10 JPY
- Campaign multipliers: 1.5x during promotions
- Expiration: Yearly cumulative (365 days rolling)

### Hong Kong/Taiwan (HK/TW)
- Base transaction: 1 point per 1 HKD/TWD SRP
- Campaign rewards: +300 point fixed amounts
- Threshold rewards: Tiered bonus structure
- Expiration: Fiscal year-based

### Global Flexibility
- **Currency-agnostic**: Supports any currency via rate parameters
- **Event-driven**: Any business event can trigger rewards
- **Configurable**: All logic defined in JSON rules, not code
- **Scalable**: Add new markets without code changes

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

## 🔄 Frontend-Backend Integration

### Communication Flow

1. **User Interaction** → Frontend captures user actions
2. **API Request** → Frontend sends REST API calls to backend
3. **Business Logic** → Backend processes through rules engine
4. **Data Response** → Backend returns processed results
5. **UI Update** → Frontend updates interface with results

### Key Integration Points

#### Event Processing Workflow
```
[Frontend Event Form] → POST /api/events → [Rules Engine] → [Response Display]
```

#### Rule Management Workflow
```
[Frontend Rule Editor] → POST/PUT /api/rules → [Rule Validation] → [Rule Storage] → [Frontend Update]
```

#### Consumer Query Workflow
```
[Frontend Search] → GET /api/consumers/:id → [Consumer Service] → [Data Enrichment] → [Frontend Display]
```

#### Campaign Management Workflow
```
[Frontend Campaign Form] → POST /api/campaigns → [Campaign Service] → [Rule Association] → [Frontend Update]
```

### API Endpoints Used by Frontend

#### Core Event Processing
- `POST /api/events` - Process business events
- `GET /api/events` - Get event history
- `GET /api/events/:id` - Get specific event details

#### Rule Management
- `GET /api/rules` - Get all rules
- `GET /api/rules/:type` - Get rules by type
- `POST /api/rules` - Create new rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule

#### Consumer Operations
- `GET /api/consumers/:id` - Get consumer details
- `PUT /api/consumers/:id` - Update consumer
- `GET /api/consumers/:id/events` - Get consumer event history
- `POST /api/consumers/search` - Search consumers

#### Campaign Management
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

#### System Information
- `GET /health` - System health check
- `GET /api/defaults` - Get system defaults
- `POST /api/defaults` - Update system defaults

### Real-time Features

#### Current Implementation
- **Polling-based updates** for real-time data
- **Optimistic UI updates** for better UX
- **Error handling** with retry mechanisms
- **Loading states** for async operations

#### Future Enhancements
- **WebSocket integration** for real-time notifications
- **Server-sent events** for live updates
- **Push notifications** for important events

## 🎨 User Interface Components

### Dashboard Overview
- **System Statistics** - Real-time metrics and KPIs
- **Rule Status** - Active/inactive rules with performance data
- **Campaign Performance** - Campaign metrics and analytics
- **Recent Activity** - Latest events and transactions

### Event Processor
- **Event Type Selection** - Dropdown for business event types
- **Market Selection** - Multi-market support (JP, HK, TW)
- **Event Data Input** - Dynamic form based on event type
- **Real-time Processing** - Live results display
- **Response Validation** - Success/error feedback

### Campaign Manager
- **Campaign List** - Paginated campaign overview
- **Campaign Editor** - Rich form for campaign configuration
- **Rule Association** - Link campaigns to business rules
- **Performance Metrics** - Campaign analytics and ROI

### Consumer Query
- **Search Interface** - Multiple search criteria
- **Consumer Profile** - Comprehensive consumer view
- **Points Balance** - Available, used, and expired points
- **Transaction History** - Detailed event timeline
- **Expiration Tracking** - Points expiration management

## 🔧 Development Workflow

### Frontend Development
```bash
# Start frontend development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Start backend development server
cd backend
npm run dev

# Run in production mode
npm start

# Run tests
npm test
```

### Full Stack Development
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev
```

## 🧪 Testing the Integration

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Process an Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PURCHASE",
    "consumerId": "12345",
    "market": "JP",
    "eventData": {
      "amount": 1000,
      "currency": "JPY"
    }
  }'
```

### 3. Frontend Testing
- Navigate to `http://localhost:5173`
- Use the Event Processor to test event processing
- Check the Dashboard for system metrics
- Query consumers using the Consumer Query interface

## 📊 Data Flow Architecture

### Request Flow
```
Frontend UI → API Service → Express Router → Controller → Service → Rules Engine → Response
```

### Response Flow
```
Rules Engine → Service → Controller → Express Router → API Service → Frontend UI
```

### Error Handling Flow
```
Error Source → Service Layer → Controller → Error Middleware → API Response → Frontend Error Display
```

## 🌐 Multi-Market Support

### Backend Market Configuration
- **Currency handling** for JPY, HKD, TWD
- **Market-specific rules** and calculations
- **Locale-based formatting**
- **Regional compliance** requirements

### Frontend Market Display
- **Market selection** dropdowns
- **Currency formatting** per market
- **Flag icons** for visual identification
- **Timezone handling** for market-specific times

## 🔐 Security & Validation

### Backend Security
- **Input validation** using express-validator
- **CORS configuration** for cross-origin requests
- **Error handling** without sensitive data exposure
- **Request rate limiting** (configurable)

### Frontend Security
- **Input sanitization** before API calls
- **XSS protection** in component rendering
- **CSRF protection** for form submissions
- **Secure cookie handling** (when authentication is added)

## 📈 Performance Optimization

### Backend Performance
- **Efficient rule processing** with caching
- **Database query optimization**
- **Response compression**
- **Memory management** for large datasets

### Frontend Performance
- **Code splitting** for optimal loading
- **Lazy loading** of components
- **Memoization** of expensive calculations
- **Bundle optimization** with Vite

## 🎯 Future Roadmap

### Short-term Enhancements
- **Real-time WebSocket** integration
- **Advanced filtering** and search
- **Data visualization** charts
- **Export/import** functionality

### Long-term Vision
- **Multi-tenant** architecture
- **Machine learning** integration
- **Advanced analytics** platform
- **Mobile app** development

---

For more information, consult the API documentation or contact the development team.

## 📁 Project Structure

```
Rule-Engine/
├── backend/                 # Express.js API server
│   ├── app.js              # Main application entry
│   ├── package.json        # Backend dependencies
│   ├── engine/             # Rules processing core
│   ├── services/           # Business logic services
│   ├── src/                # Source code organization
│   └── rules/              # JSON rule definitions
├── frontend/               # React dashboard
│   ├── src/                # Frontend source code
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── tailwind.config.js  # Tailwind CSS config
└── README.md               # This file
```

## 📞 Support & Documentation

- **Backend Documentation**: See `/backend/README.md`
- **Frontend Documentation**: See `/frontend/README.md`
- **API Documentation**: Available at `/api/docs` (when server is running)
- **Development Guide**: Refer to individual component README files

For troubleshooting, check the application logs in `/backend/logs/` and browser console for frontend issues.
