import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for the API responses
export interface Rule {
  id?: string;
  name: string;
  conditions: any;
  event: {
    type: string;
    params: any;
  };
  actions?: any;
  priority: number;
  active?: boolean;
  category?: string;
  markets?: string[];
  channels?: string[];
}

export interface RuleResponse {
  success: boolean;
  rules?: Rule[];
  totalRules?: number;
  message?: string;
  error?: string;
}

export interface EventData {
  eventId: string;
  eventType: string;
  timestamp: string;
  market: string;
  channel: string;
  consumerId: string;
  context: any;
  attributes: any;
}

export interface EventResponse {
  consumerId: string;
  eventId: string;
  eventType: string;
  totalPointsAwarded: number;
  pointBreakdown: Array<{
    ruleId: string;
    points: number;
    description: string;
  }>;
  errors: string[];
  resultingBalance: {
    total: number;
    available: number;
    used: number;
    transactionCount: number;
  };
}

export interface Consumer {
  consumerId: string;
  profile: {
    birthDate?: string;
    market: string;
    preferredChannel?: string;
    tier?: string;
  };
  engagement?: {
    totalPurchases: number;
    totalSpent: number;
    consultationsCompleted: number;
  };
  balance: {
    total: number;
    available: number;
    used: number;
    transactionCount: number;
  };
}

export interface DefaultsResponse {
  markets: string[];
  channels: string[];
  eventTypes: string[];
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
  marketDefaults: {
    [market: string]: {
      consumerIds: string[];
      storeIds: string[];
      campaignCodes: string[];
      skus: string[];
      currency: string;
      defaultAmount: number;
    };
  };
  consultationTypes: string[];
  adjustmentReasons: string[];
}

export interface RecyclingValidationResponse {
  valid: boolean;
  currentYearRecycled: number;
  requested: number;
  maxPerYear: number;
  availableSlots?: number;
  remainingSlots?: number;
  message: string;
  error?: string;
}

export interface RedemptionValidationResponse {
  valid: boolean;
  available: number;
  requested: number;
  remainingAfterRedemption?: number;
  shortfall?: number;
  message: string;
  error?: string;
}

// Rules API - Basic rules operations
export const rulesApi = {
  // Get all active rules
  getActiveRules: async (): Promise<RuleResponse> => {
    const response = await api.get('/api/rules/active');
    return response.data;
  },

  // Get rule statistics
  getRuleStatistics: async (): Promise<{
    success: boolean;
    statistics: {
      totalRules: number;
      activeRules: number;
      inactiveRules: number;
      rulesByCategory: Record<string, { total: number; active: number; inactive: number }>;
      rulesByPriority: Record<number, number>;
      eventTypes: string[];
    };
  }> => {
    const response = await api.get('/api/rules/statistics');
    return response.data;
  },

  // Validate a rule
  validateRule: async (rule: Rule): Promise<{
    success: boolean;
    validation: {
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
  }> => {
    const response = await api.post('/api/rules/validate', { rule });
    return response.data;
  },
};

// Legacy Rules Management API (keeping for backward compatibility)
export const legacyRulesApi = {
  // Get all rules
  getAllRules: async (): Promise<RuleResponse> => {
    const response = await api.get('/api/rules-management');
    return response.data;
  },

  // Create a new rule
  createRule: async (category: string, rule: Rule): Promise<RuleResponse> => {
    const response = await api.post(`/api/rules-management?category=${category}`, rule);
    return response.data;
  },

  // Update an existing rule
  updateRule: async (ruleId: string, rule: Rule, fileName?: string): Promise<RuleResponse> => {
    const url = fileName ? `/api/rules-management/${ruleId}?file=${fileName}` : `/api/rules-management/${ruleId}`;
    const response = await api.put(url, rule);
    return response.data;
  },

  // Delete a rule
  deleteRule: async (ruleId: string, fileName?: string): Promise<RuleResponse> => {
    const url = fileName ? `/api/rules-management/${ruleId}?file=${fileName}` : `/api/rules-management/${ruleId}`;
    const response = await api.delete(url);
    return response.data;
  },

  // Validate rule structure
  validateRule: async (rule: Rule): Promise<{ success: boolean; isValid: boolean; errors: string[] }> => {
    const response = await api.post('/api/rules-management/validate', rule);
    return response.data;
  },

  // Reload rules from files
  reloadRules: async (): Promise<RuleResponse> => {
    const response = await api.post('/api/rules-management/reload');
    return response.data;
  },
};

// Events Processing API
export const eventsApi = {
  // Process a single event using the correct endpoint
  processEvent: async (eventData: EventData): Promise<EventResponse> => {
    const response = await api.post('/api/events/process', eventData);
    return response.data;
  },

  // Process multiple events (if available)
  processEvents: async (events: EventData[]): Promise<EventResponse[]> => {
    const response = await api.post('/api/events/batch', { events });
    return response.data;
  },
};

// Consumers API - Updated to match backend structure
export const consumersApi = {
  // Get available consumers for dropdown/samples
  getAvailableConsumers: async () => {
    const response = await api.get('/consumers/available');
    return response.data;
  },

  // Get consumer points
  getConsumerPoints: async (consumerId: string) => {
    const response = await api.get(`/api/consumer/points?consumerId=${consumerId}`);
    return response.data;
  },

  // Get consumer history with pagination
  getConsumerHistory: async (consumerId: string, page?: number, limit?: number) => {
    let url = `/api/consumer/history?consumerId=${encodeURIComponent(consumerId)}`;
    if (page) url += `&page=${page}`;
    if (limit) url += `&limit=${limit}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Validate redemption
  validateRedemption: async (consumerId: string, redemptionPoints: number): Promise<RedemptionValidationResponse> => {
    const response = await api.post('/api/consumer/validate-redemption', {
      consumerId,
      redemptionPoints
    });
    return response.data;
  },

  validateRecycling: async (consumerId: string, recycledCount: number): Promise<RecyclingValidationResponse> => {
    const response = await api.post('/api/consumer/validate-recycling', {
      consumerId,
      recycledCount
    });
    return response.data;
  },

  // Get all consumers (enhanced implementation for dashboard)
  getAllConsumers: async (): Promise<Consumer[]> => {
    try {
      // First, get defaults to know available markets and sample consumer IDs
      const defaults = await defaultsApi.getDefaults();
      const allConsumerIds: string[] = [];
      
      // Collect all consumer IDs from market defaults
      Object.values(defaults.marketDefaults).forEach(marketData => {
        allConsumerIds.push(...marketData.consumerIds);
      });
      
      // Remove duplicates
      const uniqueConsumerIds = [...new Set(allConsumerIds)];
      const consumers: Consumer[] = [];
      
      // Fetch each consumer's data
      for (const consumerId of uniqueConsumerIds) {
        try {
          const points = await consumersApi.getConsumerPoints(consumerId);
          consumers.push({
            consumerId,
            profile: {
              market: points.market || 'HK',
              tier: consumerId.includes('vip') ? 'VIP' : 'STANDARD'
            },
            balance: {
              total: points.total,
              available: points.available,
              used: points.used,
              transactionCount: points.transactionCount
            }
          });
        } catch {
          // Consumer fetch failed, skip
        }
      }
      
      return consumers;
    } catch {
      // Fallback to sample consumers if defaults API fails
      const sampleConsumerIds = ['user_hk_standard', 'user_hk_vip', 'user_jp_standard', 'user_tw_essence_lover', 'user_tw_vip'];
      const consumers = [];
      
      for (const consumerId of sampleConsumerIds) {
        try {
          const points = await consumersApi.getConsumerPoints(consumerId);
          consumers.push({
            consumerId,
            profile: {
              market: points.market || 'HK',
              tier: consumerId.includes('vip') ? 'VIP' : 'STANDARD'
            },
            balance: {
              total: points.total,
              available: points.available,
              used: points.used,
              transactionCount: points.transactionCount
            }
          });
        } catch {
          // Consumer fetch failed, skip
        }
      }
      return consumers;
    }
  },

  // Get consumer by ID
  getConsumer: async (consumerId: string): Promise<Consumer> => {
    const points = await consumersApi.getConsumerPoints(consumerId);
    return {
      consumerId,
      profile: {
        market: points.market || 'HK',
        tier: consumerId.includes('vip') ? 'VIP' : 'STANDARD'
      },
      balance: {
        total: points.total,
        available: points.available,
        used: points.used,
        transactionCount: points.transactionCount
      }
    };
  },
};

// Campaigns API - Updated to match backend endpoints
export const campaignsApi = {
  // Get all campaigns
  getAllCampaigns: async () => {
    const response = await api.get('/api/campaigns');
    return response.data;
  },

  // Get active campaigns
  getActiveCampaigns: async (filters?: {
    market?: string;
    startDate?: string;
    endDate?: string;
    channel?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`/api/campaigns/active${params.toString() ? '?' + params.toString() : ''}`);
    return response.data;
  },

  // Create a new campaign
  createCampaign: async (campaignData: {
    campaignCode: string;
    name: string;
    market: string;
    channel: string;
    startDate: string;
    endDate: string;
    ruleIds?: string[];
    description?: string;
  }) => {
    const response = await api.post('/api/campaigns', campaignData);
    return response.data;
  },

  // Update an existing campaign
  updateCampaign: async (campaignCode: string, updateData: {
    campaignCode?: string;
    name?: string;
    market?: string;
    channel?: string;
    startDate?: string;
    endDate?: string;
    ruleIds?: string[];
    description?: string;
  }) => {
    const response = await api.put(`/api/campaigns/${campaignCode}`, updateData);
    return response.data;
  },

  // Delete a campaign
  deleteCampaign: async (campaignCode: string) => {
    const response = await api.delete(`/api/campaigns/${campaignCode}`);
    return response.data;
  },

  // Get campaign analytics
  getCampaignAnalytics: async (campaignCode: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`/api/campaigns/${campaignCode}/analytics${params.toString() ? '?' + params.toString() : ''}`);
    return response.data;
  },

  // Get campaign by ID
  getCampaign: async (campaignId: string) => {
    const response = await api.get(`/api/campaigns/${campaignId}`);
    return response.data;
  },
};

// Rules Management API - CRUD operations for rules
export const rulesManagementApi = {
  // Get all rules with category information
  getAllRules: async (): Promise<RuleResponse> => {
    const response = await api.get('/api/rules-management');
    return response.data;
  },

  // Add a new rule to a specific category
  addRule: async (category: string, rule: Rule): Promise<RuleResponse> => {
    const response = await api.post('/api/rules-management', {
      category,
      rule
    });
    return response.data;
  },

  // Update an existing rule
  updateRule: async (ruleId: string, rule: Rule): Promise<RuleResponse> => {
    const response = await api.put(`/api/rules-management/${ruleId}`, {
      rule
    });
    return response.data;
  },

  // Delete a rule
  deleteRule: async (ruleId: string): Promise<RuleResponse> => {
    const response = await api.delete(`/api/rules-management/${ruleId}`);
    return response.data;
  },
};

// Defaults API - Get backend configuration data
export const defaultsApi = {
  // Get all default configuration values
  getDefaults: async (): Promise<DefaultsResponse> => {
    const response = await api.get('/api/defaults');
    return response.data;
  },
};

// Export the configured axios instance for custom requests
export { api };

// Error handling wrapper
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || error.response.data.error || 'Server error',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - unable to connect to server',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      status: -1,
    };
  }
};

// Default export for compatibility
export default {
  rulesApi,
  legacyRulesApi,
  eventsApi,
  consumersApi,
  campaignsApi,
  rulesManagementApi,
  defaultsApi,
  api,
  handleApiError
};
