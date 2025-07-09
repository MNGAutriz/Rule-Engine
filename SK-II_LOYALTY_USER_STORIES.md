# SK-II Loyalty Rule Engine: Critical User Stories for Business Implementation

## Executive Summary

Based on the SK-II Loyalty design requirements and our current rule engine capabilities, we have identified **4 critical user stories** that will deliver immediate business value while establishing a foundation for future enhancements. These stories address the core business needs: **real-time event processing**, **flexible rule management**, **accurate loyalty calculations**, and **reliable data integration**.

---

## 🎯 **User Story 1: Real-Time Consumer Event Processing with Dynamic Rule Evaluation**

### **Business Context**
SK-II needs to process consumer interactions (purchases, consultations, app engagement) in real-time to provide immediate loyalty rewards and maintain consumer engagement momentum.

### **User Story**
> **As a SK-II system**, I want to process consumer events through a dynamic rule engine within 2 minutes, so that consumers receive immediate loyalty point calculations and the system maintains real-time engagement.

### **Expected Input Data Structure**
```json
{
  "eventId": "evt_2025070901_12345",
  "consumerId": "consumer_hk_sarah_chen_001",
  "eventType": "PURCHASE",
  "timestamp": "2025-07-09T14:30:00Z",
  "market": "HK",
  "channel": "COUNTER",
  "context": {
    "storeLocation": "Hong Kong IFC Mall",
    "salesAssociate": "SA_001"
  },
  "attributes": {
    "transactionAmount": 2800.00,
    "currency": "HKD",
    "products": [
      {
        "sku": "SKII_ESSENCE_75ML",
        "category": "ESSENCE",
        "price": 1400.00,
        "quantity": 2
      }
    ]
  }
}
```

### **Business Value & Success Metrics**
- **Processing Time**: ≤ 2 minutes (NFR requirement)
- **Accuracy**: 99.9% correct loyalty point calculations
- **Availability**: 99.9% uptime for event processing
- **Consumer Satisfaction**: Immediate reward feedback enhances brand loyalty

### **Acceptance Criteria**
1. ✅ Events processed within 2-minute SLA using current rule engine
2. ✅ Dynamic rule evaluation based on market, event type, purchase amount, and consumer history
3. ✅ Automatic loyalty point and expiration date calculation
4. ✅ Event logging with full audit trail
5. ✅ Error handling with retry mechanisms for failed processing

---

## 🎛️ **User Story 2: Campaign-Driven Rule Management with Business User Interface**

### **Business Context**
SK-II marketing teams need to rapidly deploy loyalty campaigns across different markets (HK, JP, TW) with varying rules for different consumer segments and promotional periods.

### **User Story**
> **As a SK-II marketing manager**, I want to create and manage loyalty campaigns through an intuitive interface, so that I can quickly deploy market-specific promotions without requiring technical development resources.

### **Expected Campaign Configuration**
```json
{
  "campaignCode": "SKII_SUMMER_VIP_2025",
  "name": "Summer VIP Double Points",
  "market": "HK",
  "channel": "ALL",
  "startDate": "2025-07-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "rules": [
    {
      "ruleId": "VIP_PURCHASE_MULTIPLIER",
      "conditions": {
        "eventType": "PURCHASE",
        "consumerTier": "VIP",
        "minimumAmount": 1500,
        "currency": "HKD"
      },
      "actions": {
        "pointsMultiplier": 2.0,
        "bonusPoints": 500,
        "expirationDays": 365
      }
    }
  ],
  "isActive": true
}
```

### **Business Value & Success Metrics**
- **Campaign Deployment Speed**: From weeks to hours
- **Marketing Agility**: Real-time campaign modifications
- **Cost Reduction**: 80% reduction in IT development overhead
- **Market Responsiveness**: Rapid response to competitive actions

### **Acceptance Criteria**
1. ✅ Web-based campaign creation interface (existing CampaignManager component)
2. ✅ Rule builder with drag-and-drop conditions and actions
3. ✅ Real-time campaign activation/deactivation
4. ✅ Market-specific rule templates and validation
5. ✅ Campaign performance monitoring and analytics
6. ✅ A/B testing capabilities for rule optimization

---

## 📊 **User Story 3: Consumer Loyalty Balance Query with Historical Context**

### **Business Context**
SK-II touchpoints (retail counters, mobile app, online store) need real-time access to consumer loyalty balances to provide personalized service and enable point redemption experiences.

### **User Story**
> **As a SK-II sales associate or consumer**, I want to query accurate loyalty point balances and expiration dates in real-time, so that I can provide personalized service and enable informed redemption decisions.

### **Expected Query Request**
```json
{
  "consumerId": "consumer_hk_sarah_chen_001",
  "queryTimestamp": "2025-07-09T14:30:00Z",
  "includeProjections": true,
  "market": "HK"
}
```

### **Expected Response Structure**
```json
{
  "consumerId": "consumer_hk_sarah_chen_001",
  "queryTimestamp": "2025-07-09T14:30:00Z",
  "currentBalance": {
    "totalPoints": 8750,
    "availablePoints": 7200,
    "usedPoints": 1550,
    "pendingPoints": 500
  },
  "expirationSchedule": [
    {
      "expirationDate": "2025-12-31T23:59:59Z",
      "pointsExpiring": 1200,
      "source": "PURCHASE_BONUS_Q4_2024"
    },
    {
      "expirationDate": "2026-03-15T23:59:59Z",
      "pointsExpiring": 2500,
      "source": "VIP_MULTIPLIER_SUMMER_2025"
    }
  ],
  "recentActivity": [
    {
      "eventDate": "2025-07-08T16:45:00Z",
      "eventType": "PURCHASE",
      "pointsAwarded": 500,
      "description": "Purchase at IFC Mall Counter"
    }
  ]
}
```

### **Business Value & Success Metrics**
- **Service Quality**: Enhanced personalized consumer experience
- **Redemption Rate**: 25% increase in point utilization
- **Response Time**: <500ms for balance queries
- **Data Accuracy**: 100% consistency with transaction history

### **Acceptance Criteria**
1. ✅ Real-time balance calculation with point expiration tracking
2. ✅ Historical transaction context for consumer service
3. ✅ Projected balance calculations for future dates
4. ✅ Multi-market support with currency conversion
5. ✅ Mobile-optimized API for app integration
6. ✅ Audit logging for compliance and troubleshooting

---

## 🔍 **User Story 4: Active Campaign Query with Advanced Filtering**

### **Business Context**
SK-II sales associates, customer service teams, and marketing managers need real-time visibility into which loyalty campaigns are currently active for specific markets, channels, and time periods to provide accurate information to consumers and make informed business decisions.

### **User Story**
> **As a SK-II sales associate or marketing manager**, I want to query active campaigns with flexible date/time and market filters, so that I can provide accurate campaign information to consumers and understand which loyalty rules are currently in effect.

### **Expected Query Request**
```json
{
  "queryType": "ACTIVE_CAMPAIGNS",
  "filters": {
    "market": "HK",
    "channel": "COUNTER",
    "queryDateTime": "2025-07-15T14:30:00Z",
    "dateRange": {
      "startDate": "2025-07-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z"
    },
    "campaignStatus": "ACTIVE",
    "includeRules": true
  }
}
```

### **Expected Response Structure**
```json
{
  "queryTimestamp": "2025-07-09T15:30:00Z",
  "totalCampaigns": 3,
  "activeCampaigns": [
    {
      "campaignCode": "SKII_SUMMER_VIP_2025",
      "name": "Summer VIP Double Points",
      "market": "HK",
      "channel": "ALL",
      "status": "ACTIVE",
      "startDate": "2025-07-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z",
      "daysRemaining": 53,
      "description": "VIP customers get 2x points on purchases above HKD 1,500",
      "rules": [
        {
          "ruleId": "VIP_PURCHASE_MULTIPLIER",
          "conditions": {
            "eventType": "PURCHASE",
            "consumerTier": "VIP",
            "minimumAmount": 1500,
            "currency": "HKD"
          },
          "actions": {
            "pointsMultiplier": 2.0,
            "bonusPoints": 500,
            "expirationDays": 365
          }
        }
      ]
    },
    {
      "campaignCode": "SKII_CONSULTATION_BONUS",
      "name": "Free Consultation Points",
      "market": "HK",
      "channel": "COUNTER",
      "status": "ACTIVE",
      "startDate": "2025-06-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z",
      "daysRemaining": 175,
      "description": "Earn points for attending SK-II skin consultations",
      "rules": [
        {
          "ruleId": "CONSULTATION_BONUS",
          "conditions": {
            "eventType": "CONSULTATION",
            "consultationType": "SKIN_ANALYSIS"
          },
          "actions": {
            "bonusPoints": 200,
            "expirationDays": 180
          }
        }
      ]
    }
  ],
  "upcomingCampaigns": [
    {
      "campaignCode": "SKII_AUTUMN_LAUNCH",
      "name": "Autumn Product Launch",
      "market": "HK",
      "startDate": "2025-09-01T00:00:00Z",
      "daysUntilStart": 54,
      "description": "Special launch campaign for new autumn collection"
    }
  ],
  "expiredRecentCampaigns": [
    {
      "campaignCode": "SKII_SPRING_PROMO",
      "name": "Spring Beauty Boost",
      "market": "HK",
      "endDate": "2025-06-30T23:59:59Z",
      "daysExpired": 9
    }
  ]
}
```

### **Advanced Query Scenarios**
```json
{
  "scenario1": {
    "description": "Find all campaigns active on a specific date",
    "query": {
      "queryDateTime": "2025-08-15T10:00:00Z",
      "market": "ALL",
      "campaignStatus": "ACTIVE"
    }
  },
  "scenario2": {
    "description": "Get counter-specific campaigns for Hong Kong",
    "query": {
      "market": "HK",
      "channel": "COUNTER",
      "includeUpcoming": true,
      "dayRangeAhead": 30
    }
  },
  "scenario3": {
    "description": "Marketing overview - all markets, all statuses",
    "query": {
      "market": "ALL",
      "includeRules": false,
      "includeExpired": true,
      "dayRangeBehind": 7
    }
  }
}
```

### **Business Value & Success Metrics**
- **Service Quality**: 100% accurate campaign information at point of sale
- **Response Time**: <500ms for campaign queries
- **Marketing Visibility**: Real-time campaign performance monitoring
- **Consumer Experience**: Consistent information across all touchpoints

### **Acceptance Criteria**
1. ✅ Real-time query of active campaigns based on current date/time
2. ✅ Advanced filtering by market, channel, date range, and campaign status
3. ✅ Include/exclude detailed rule information based on query needs
4. ✅ Upcoming and recently expired campaign visibility
5. ✅ Campaign countdown and duration calculations
6. ✅ Multi-market aggregation for regional managers
7. ✅ Mobile-optimized API for retail app integration
8. ✅ Caching mechanism for high-frequency queries

---

## 🏗️ **Technical Architecture Alignment**

### **Current Rule Engine Capabilities**
- ✅ **Campaign Management**: Web-based interface for rule creation
- ✅ **Event Processing**: Real-time rule evaluation engine
- ✅ **Data Storage**: JSON-based configuration with database persistence
- ✅ **API Layer**: RESTful endpoints for event processing and queries

### **Implementation Roadmap**

#### **Phase 1 (Immediate - 4 weeks)**
- User Stories 1 & 2: Event processing and campaign management
- Leverage existing rule engine infrastructure
- Enhance UI for business user self-service

#### **Phase 2 (Next - 6 weeks)**
- User Story 4: Active campaign query with advanced filtering
- Implement real-time campaign status and rule visibility
- Multi-market and channel-specific queries

#### **Phase 3 (Short-term - 6 weeks)**
- User Story 3: Consumer balance queries with real-time calculations
- Implement point expiration tracking
- Mobile API optimization

#### **Phase 4 (Future - 8 weeks)**
- Rule validation and testing framework
- CDP integration and batch processing (Future enhancement)
- Advanced analytics and reporting

---

## 💼 **Business Impact & ROI**

### **Immediate Benefits**
- **Operational Efficiency**: 80% reduction in campaign deployment time
- **Consumer Experience**: Real-time loyalty rewards and balance access
- **Marketing Agility**: Self-service rule management for marketing teams

### **Strategic Advantages**
- **Scalability**: Multi-market support for regional expansion
- **Flexibility**: Rapid adaptation to changing business requirements
- **Integration**: Seamless CDP synchronization for unified consumer view

### **Success Metrics**
- **Processing SLA**: 99% of events processed within 2 minutes
- **System Availability**: 99.9% uptime
- **User Adoption**: 90% of campaigns created through self-service interface
- **Query Performance**: <500ms response time for campaign queries
- **Service Quality**: 100% accurate campaign information at point of sale

---

## 🎯 **Recommendation**

These 4 user stories provide a comprehensive foundation for SK-II's loyalty platform that:

1. **Addresses immediate business needs** with real-time processing and campaign management
2. **Provides scalable architecture** for future market expansion
3. **Enables marketing autonomy** through self-service rule configuration
4. **Ensures data consistency** across the entire customer data ecosystem

**Next Steps**: Prioritize implementation based on business impact, starting with User Stories 1 & 2 for immediate value delivery, followed by Stories 3 & 4 for comprehensive platform completion.
