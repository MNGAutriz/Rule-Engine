# Loyalty Rule Engine API Documentation

## Overview
The Loyalty Rule Engine provides a comprehensive API for processing consumer events, managing loyalty rules, and tracking point balances. All endpoints use the generalized input/output templates for consistency.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, no authentication is required for testing purposes.

## Endpoints

### Health Check
#### GET /health
Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

### Rules Management

#### GET /api/rules/active
Returns all active loyalty rules.

**Query Parameters:**
- `category` (optional): Filter by rule category (transaction, basket-threshold, consumer-attribute, product-multiplier)
- `ruleId` (optional): Filter by specific rule ID

**Response:**
```json
{
  "totalRules": 15,
  "filters": {
    "category": "all",
    "ruleId": "all"
  },
  "rules": [
    {
      "ruleId": "Registration Bonus",
      "category": "transaction",
      "priority": 100,
      "active": true,
      "description": "Welcome bonus for new registrations",
      "conditions": [...],
      "event": {...},
      "source": "transaction-rules.json"
    }
  ]
}
```

#### GET /api/rules/categories
Returns available rule categories.

**Response:**
```json
{
  "totalCategories": 4,
  "categories": [
    {
      "category": "transaction",
      "description": "Rules triggered by purchase transactions",
      "filename": "transaction-rules.json"
    }
  ]
}
```

---

### Consumer Management

#### GET /api/consumer/points/{consumerId}
Returns current point balance for a consumer.

**Path Parameters:**
- `consumerId`: The consumer ID

**Response:**
```json
{
  "consumerId": "test-consumer-001",
  "total": 250,
  "available": 200,
  "used": 50,
  "nextExpiration": null
}
```

#### GET /api/consumer/history/{consumerId}
Returns chronological point activity for a consumer.

**Path Parameters:**
- `consumerId`: The consumer ID

**Query Parameters:**
- `startDate` (optional): Filter events after this date (ISO format)
- `endDate` (optional): Filter events before this date (ISO format)
- `limit` (optional): Maximum number of results (default: 50)

**Response:**
```json
[
  {
    "eventId": "PUR_1234567890",
    "timestamp": "2024-01-15T10:00:00.000Z",
    "eventType": "PURCHASE",
    "points": 45,
    "ruleId": "Base Purchase Points",
    "description": "Points awarded"
  }
]
```

#### POST /api/consumer/adjustment
Manually adjust points for a consumer.

**Request Body:**
```json
{
  "consumerId": "test-consumer-001",
  "points": 100,
  "reason": "Customer service adjustment",
  "adminId": "admin-001"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "ADJ_1234567890_abc123",
  "consumerId": "test-consumer-001",
  "pointsAdjusted": 100,
  "reason": "Customer service adjustment",
  "adminId": "admin-001",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "result": {
    "success": true,
    "totalPointsAwarded": 100,
    "pointBreakdown": [...]
  }
}
```

---

### Event Processing

#### POST /api/events/process
Process a single consumer event through the loyalty engine.

**Request Body (Generalized Template):**
```json
{
  "eventId": "REG_1234567890",
  "consumerId": "test-consumer-001",
  "eventType": "REGISTRATION",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "eventData": {}
}
```

**Event Types:**
- `REGISTRATION`: New consumer registration
- `PURCHASE`: Purchase transaction
- `ASSESSMENT`: Completed assessment
- `ADJUSTMENT`: Manual point adjustment

**Response:**
```json
{
  "success": true,
  "eventId": "REG_1234567890",
  "consumerId": "test-consumer-001",
  "eventType": "REGISTRATION",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "totalPointsAwarded": 50,
  "pointBreakdown": [
    {
      "ruleId": "Registration Bonus",
      "points": 50,
      "description": "Welcome bonus for new registrations"
    }
  ],
  "newBalance": {
    "total": 50,
    "available": 50,
    "used": 0,
    "version": 1
  }
}
```

#### POST /api/events/batch
Process multiple events in a single request.

**Request Body:**
```json
{
  "events": [
    {
      "eventId": "BATCH1_1234567890",
      "consumerId": "test-consumer-001",
      "eventType": "PURCHASE",
      "timestamp": "2024-01-15T10:00:00.000Z",
      "eventData": {
        "transactionId": "TXN_1234567890",
        "totalAmount": 25.00,
        "products": [...]
      }
    }
  ]
}
```

**Response:**
```json
{
  "processed": 2,
  "results": [
    {
      "success": true,
      "eventId": "BATCH1_1234567890",
      "totalPointsAwarded": 25
    }
  ]
}
```

---

## Event Data Structures

### Registration Event
```json
{
  "eventId": "REG_1234567890",
  "consumerId": "test-consumer-001",
  "eventType": "REGISTRATION",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "eventData": {}
}
```

### Purchase Event
```json
{
  "eventId": "PUR_1234567890",
  "consumerId": "test-consumer-001",
  "eventType": "PURCHASE",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "eventData": {
    "transactionId": "TXN_1234567890",
    "totalAmount": 75.50,
    "campaignId": "NEW_YEAR_2024",
    "products": [
      {
        "productId": "P001",
        "name": "Olay Regenerist Serum",
        "price": 75.50,
        "category": "skincare",
        "brand": "Olay"
      }
    ]
  }
}
```

### Assessment Event
```json
{
  "eventId": "ASS_1234567890",
  "consumerId": "test-consumer-001",
  "eventType": "ASSESSMENT",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "eventData": {
    "assessmentType": "skin-assessment",
    "completed": true
  }
}
```

### Manual Adjustment Event
```json
{
  "eventId": "ADJ_1234567890_abc123",
  "consumerId": "test-consumer-001",
  "eventType": "ADJUSTMENT",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "eventData": {
    "points": 100,
    "reason": "Customer service adjustment",
    "adminId": "admin-001"
  }
}
```

---

## Testing Scenarios

### Scenario 1: New Consumer Registration
1. **GET** `/api/consumer/points/test-consumer-001` - Check initial balance
2. **POST** `/api/events/process` - Process registration event
3. **GET** `/api/consumer/points/test-consumer-001` - Verify bonus points

### Scenario 2: Purchase Transaction
1. **POST** `/api/events/process` - Process purchase event
2. **GET** `/api/consumer/history/test-consumer-001` - Check transaction history
3. **GET** `/api/consumer/points/test-consumer-001` - Verify point balance

### Scenario 3: Manual Point Adjustment
1. **POST** `/api/consumer/adjustment` - Adjust points manually
2. **GET** `/api/consumer/history/test-consumer-001` - Verify adjustment in history
3. **GET** `/api/consumer/points/test-consumer-001` - Verify adjusted balance

### Scenario 4: Rule Validation
1. **GET** `/api/rules/active` - View all active rules
2. **GET** `/api/rules/active?category=transaction` - Filter transaction rules
3. **POST** `/api/events/process` - Test rule triggering

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": ["consumerId is required"]
}
```

### 404 Not Found
```json
{
  "error": "Endpoint not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Event processing failed",
  "message": "Detailed error message",
  "eventId": "PUR_1234567890"
}
```

---

## Postman Collection

Import the `Loyalty-Engine-Postman-Collection.json` file into Postman to get pre-configured requests for all endpoints.

**Environment Variables:**
- `baseUrl`: http://localhost:3000
- `consumerId`: test-consumer-001

---

## Notes

1. All endpoints use the generalized input/output templates for consistency
2. Event processing is asynchronous and fact-based using the almanac pattern
3. Rules are loaded from JSON files and can be filtered by category
4. Point balances track total, available, and used points
5. Manual adjustments are processed through the same rule engine as other events
6. The API is designed for easy integration with Postman for testing
