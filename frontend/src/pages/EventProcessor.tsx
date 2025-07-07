import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventsApi, defaultsApi, consumersApi } from '@/services/api';
import type { EventData, EventResponse, DefaultsResponse, RedemptionValidationResponse, RecyclingValidationResponse } from '@/services/api';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Clock, 
  Code, 
  Settings, 
  Activity,
  Sparkles,
  Cpu,
  Database,
  Send,
  Calendar,
  Award,
  TrendingUp,
  User,
  CreditCard,
  Target,
  Info
} from 'lucide-react';

const EventProcessor: React.FC = () => {
  const [defaults, setDefaults] = useState<DefaultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [recyclingValidationMessage, setRecyclingValidationMessage] = useState<string | null>(null);
  const [recyclingValidationLoading, setRecyclingValidationLoading] = useState(false);
  const [eventData, setEventData] = useState<Partial<EventData>>({
    eventType: 'PURCHASE',
    market: 'HK',
    channel: 'STORE',
    productLine: 'PREMIUM_SERIES',
    consumerId: 'user_hk_standard',
    context: { 
      storeId: 'STORE_HK_001',
      campaignCode: ''
    },
    attributes: {
      amount: 1500,
      currency: 'HKD',
      skuList: ['SK_HK_001']
    }
  });

  // Load defaults from backend on component mount
  useEffect(() => {
    loadDefaults();
  }, []);

  const loadDefaults = async () => {
    try {
      const defaultsData = await defaultsApi.getDefaults();
      setDefaults(defaultsData);
      
      // Update initial form data with real backend defaults
      if (defaultsData.marketDefaults.HK) {
        const hkDefaults = defaultsData.marketDefaults.HK;
        setEventData(prev => ({
          ...prev,
          consumerId: hkDefaults.consumerIds[0] || prev.consumerId,
          context: {
            storeId: hkDefaults.storeIds[0] || 'STORE_HK_001',
            campaignCode: ''
          },
          attributes: {
            ...prev.attributes,
            currency: hkDefaults.currency,
            amount: hkDefaults.defaultAmount,
            skuList: hkDefaults.skus.slice(0, 1) || ['SK_HK_001']
          }
        }));
      }
    } catch (error) {
      console.error('Error loading defaults:', error);
      // Keep the hardcoded defaults if API fails
    }
  };

  const handleInputChange = (field: keyof EventData, value: any) => {
    setEventData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-map related fields based on selections using real backend data
      if (field === 'market' && defaults?.marketDefaults[value]) {
        const marketDefaults = defaults.marketDefaults[value];
        updated.attributes = {
          ...updated.attributes,
          currency: marketDefaults.currency
        };
        
        updated.context = {
          ...updated.context,
          storeId: marketDefaults.storeIds[0] || `STORE_${value}_001`,
          campaignCode: ''
        };
        
        updated.consumerId = marketDefaults.consumerIds[0] || `user_${value.toLowerCase()}_standard`;
        
        updated.attributes = {
          ...updated.attributes,
          skuList: marketDefaults.skus.slice(0, 1) || [`SK_${value}_001`],
          amount: marketDefaults.defaultAmount
        };
      }
      
      // Auto-populate default values for different event types based on POSTMAN tests
      if (field === 'eventType') {
        switch (value) {
          case 'PURCHASE':
            updated.attributes = {
              ...updated.attributes,
              amount: updated.attributes?.amount || (defaults?.marketDefaults[updated.market || 'HK']?.defaultAmount || 1500),
              currency: updated.attributes?.currency || (defaults?.marketDefaults[updated.market || 'HK']?.currency || 'HKD'),
              skuList: updated.attributes?.skuList || (defaults?.marketDefaults[updated.market || 'HK']?.skus.slice(0, 1) || ['SK_HK_001'])
            };
            // Ensure productLine is set for Purchase events
            if (!updated.productLine) {
              updated.productLine = 'PREMIUM_SERIES';
            }
            break;
          case 'CONSULTATION':
            updated.attributes = {
              consultationType: defaults?.consultationTypes?.[0] || 'SKIN_ANALYSIS',
              skinTestDate: new Date().toISOString().split('T')[0] // Today's date
            };
            // Remove product line for consultation events
            updated.productLine = '';
            break;
          case 'ADJUSTMENT':
            updated.attributes = {
              adjustedPoints: 1000,
              reason: 'Customer service compensation'
            };
            updated.context = {
              ...updated.context,
              adminId: 'ADMIN_001'
            };
            // Keep default channel as STORE for adjustments
            break;
          case 'RECYCLE':
            updated.attributes = {
              recycledCount: 3
            };
            break;
          case 'REDEMPTION':
            updated.attributes = {
              redemptionPoints: 500
            };
            break;
          case 'REGISTRATION':
            // Registration events use STORE channel, no product line, empty campaign code and storeId, and empty attributes
            updated.productLine = ''; // No product line for registration
            updated.attributes = {}; // Registration events have no attributes
            updated.context = {
              storeId: '', // Store ID is optional for registration
              campaignCode: '' // Empty campaign code for registration
            };
            break;
        }
        
        // Set campaign code to blank for all event types (except REGISTRATION which is handled above)
        if (value !== 'REGISTRATION') {
          updated.context = {
            ...updated.context,
            campaignCode: ''
          };
        }
        
        // Ensure all event types default to STORE channel
        updated.channel = 'STORE';
      }
      
      return updated;
    });
  };

  const handleNestedChange = (parent: 'context' | 'attributes', field: string, value: any) => {
    setEventData(prev => {
      const updated = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      };
      
      // Auto-map related fields
      if (parent === 'attributes') {
        if (field === 'amount' && typeof value === 'number') {
          // Auto-set attributes if not set
          updated.attributes = {
            ...updated.attributes
          };
        }
        
        if (field === 'currency') {
          // Auto-update sample amounts based on currency
          const amountMap = {
            'HKD': 1500,
            'JPY': 150000,
            'TWD': 45000,
            'USD': 200,
            'EUR': 180
          };
          const defaultAmount = amountMap[value as keyof typeof amountMap] || 1500;
          updated.attributes = {
            ...updated.attributes,
            amount: updated.attributes?.amount || defaultAmount
          };
        }
      }
      
      return updated;
    });
  };

  const validateRedemptionPoints = async (consumerId: string, redemptionPoints: number) => {
    try {
      setValidationLoading(true);
      setValidationMessage(null);
      
      const validationResult = await consumersApi.validateRedemption(consumerId, redemptionPoints);
      
      if (validationResult.valid) {
        setValidationMessage(`✅ ${validationResult.message}. You will have ${validationResult.remainingAfterRedemption} points remaining.`);
      } else {
        setValidationMessage(`❌ ${validationResult.message}`);
      }
      
      return validationResult.valid;
    } catch (error) {
      console.error('Error validating redemption:', error);
      setValidationMessage('❌ Error validating redemption. Please try again.');
      return false;
    } finally {
      setValidationLoading(false);
    }
  };

  const validateRecyclingCount = async (consumerId: string, recycledCount: number) => {
    try {
      setRecyclingValidationLoading(true);
      setRecyclingValidationMessage(null);
      
      const validationResult = await consumersApi.validateRecycling(consumerId, recycledCount);
      
      if (validationResult.valid) {
        setRecyclingValidationMessage(`✅ ${validationResult.message}`);
      } else {
        setRecyclingValidationMessage(`❌ ${validationResult.message}`);
      }
      
      return validationResult.valid;
    } catch (error) {
      console.error('Error validating recycling:', error);
      setRecyclingValidationMessage('❌ Error validating recycling. Please try again.');
      return false;
    } finally {
      setRecyclingValidationLoading(false);
    }
  };

  const handleProcessEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields based on CORRECTED_POSTMAN_TESTS patterns
      if (!eventData.eventType || !eventData.consumerId || !eventData.channel) {
        throw new Error('Please fill in all required fields (Event Type, Consumer ID, Channel)');
      }

      if (eventData.eventType === 'PURCHASE') {
        if (!eventData.productLine) {
          throw new Error('Product Line is required for Purchase events');
        }
        if (!eventData.attributes?.amount || eventData.attributes.amount <= 0) {
          throw new Error('Amount must be greater than 0 for Purchase events');
        }
        if (!eventData.attributes?.currency) {
          throw new Error('Currency is required for Purchase events');
        }
        if (!eventData.attributes?.skuList || eventData.attributes.skuList.length === 0) {
          throw new Error('SKU List is required for Purchase events');
        }
      }

      if (eventData.eventType === 'CONSULTATION') {
        if (!eventData.attributes?.consultationType) {
          throw new Error('Consultation Type is required for Consultation events');
        }
        if (!eventData.attributes?.skinTestDate) {
          throw new Error('Skin Test Date is required for consultation bonus');
        }
      }

      if (eventData.eventType === 'ADJUSTMENT') {
        if (!eventData.attributes?.adjustedPoints || eventData.attributes.adjustedPoints <= 0) {
          throw new Error('Adjusted Points is required for Adjustment events');
        }
        if (!eventData.attributes?.reason) {
          throw new Error('Reason is required for Adjustment events');
        }
      }

      if (eventData.eventType === 'RECYCLE') {
        if (!eventData.attributes?.recycledCount || eventData.attributes.recycledCount <= 0) {
          throw new Error('Recycled Count is required for Recycle events');
        }
        
        // Validate recycling count against yearly limits
        const isValidRecycling = await validateRecyclingCount(eventData.consumerId, eventData.attributes.recycledCount);
        if (!isValidRecycling) {
          throw new Error('Cannot proceed with recycling - yearly limit exceeded');
        }
      }

      if (eventData.eventType === 'REDEMPTION') {
        if (!eventData.attributes?.redemptionPoints || eventData.attributes.redemptionPoints <= 0) {
          throw new Error('Redemption Points is required for Redemption events');
        }
        
        // Validate redemption points against user's balance
        const isValidRedemption = await validateRedemptionPoints(eventData.consumerId, eventData.attributes.redemptionPoints);
        if (!isValidRedemption) {
          throw new Error('Cannot proceed with redemption - insufficient points available');
        }
      }

      // Prepare event data based on event type
      let processEventData = { ...eventData as EventData };
      
      // For REGISTRATION events, ensure attributes is empty
      if (eventData.eventType === 'REGISTRATION') {
        processEventData.attributes = {};
      }

      // For CONSULTATION events, only keep consultation-specific attributes
      if (eventData.eventType === 'CONSULTATION') {
        processEventData.attributes = {
          skinTestDate: processEventData.attributes?.skinTestDate,
          consultationType: processEventData.attributes?.consultationType
        };
        // Remove product line for consultation events
        delete processEventData.productLine;
      }

      // For RECYCLE events, only keep recycledCount in attributes
      if (eventData.eventType === 'RECYCLE') {
        processEventData.attributes = {
          recycledCount: processEventData.attributes?.recycledCount
        };
      }

      // For REDEMPTION events, only keep redemptionPoints in attributes
      if (eventData.eventType === 'REDEMPTION') {
        processEventData.attributes = {
          redemptionPoints: processEventData.attributes?.redemptionPoints
        };
      }

      // For ADJUSTMENT events, only keep adjustedPoints and reason in attributes
      if (eventData.eventType === 'ADJUSTMENT') {
        processEventData.attributes = {
          adjustedPoints: processEventData.attributes?.adjustedPoints,
          reason: processEventData.attributes?.reason
        };
        // Remove product line for adjustment events
        delete processEventData.productLine;
        // Ensure context has adminId instead of storeId
        processEventData.context = {
          adminId: processEventData.context?.adminId || 'ADMIN_001'
        };
      }

      const response = await eventsApi.processEvent({
        ...processEventData,
        eventId: `evt_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process event');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const defaultData = {
      eventType: 'PURCHASE',
      market: 'HK',
      channel: 'STORE',
      productLine: 'PREMIUM_SERIES',
      consumerId: 'user_hk_standard',
      context: { 
        storeId: 'HK_STORE_001',
        campaignCode: ''
      },
      attributes: {
        amount: 1500,
        currency: 'HKD',
        skuList: ['SK_HK_001']
      }
    };
    setEventData(defaultData);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8 bg-white rounded-lg shadow-sm mx-4 my-6">
        {/* Header with P&G Light Blue Theme */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-700 mb-4 shadow-lg">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700">
            Event Processor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test and validate loyalty events in real-time with our powerful processing engine
          </p>
        </div>

        {/* Stats Cards with Same Gradients as Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Processing Speed</p>
                  <p className="text-2xl font-bold">~15ms</p>
                </div>
                <Activity className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Rules Engine</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
                <Settings className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Database</p>
                  <p className="text-2xl font-bold">Online</p>
                </div>
                <Database className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Configuration */}
          <Card className="border-0 shadow-xl bg-white" style={{ overflow: 'visible' }}>
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl cursor-pointer">
                <Code className="mr-3 h-6 w-6" />
                Event Configuration
              </CardTitle>
              <CardDescription className="text-blue-100">
                Configure your loyalty event parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6" style={{ overflow: 'visible', position: 'relative' }}>
              {/* Auto-mapping notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Smart Auto-Mapping Enabled</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Related fields are automatically populated when you change Market, Event Type, or Currency for better user experience.
                </p>
              </div>
              
              {/* Basic Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-sm font-semibold text-gray-700">Event Type *</Label>
                  <Select
                    value={eventData.eventType}
                    onValueChange={(value) => handleInputChange('eventType', value)}
                  >
                    <SelectTrigger className="border-black focus:border-black focus:ring-0 focus:outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase</SelectItem>
                      <SelectItem value="REGISTRATION">Registration</SelectItem>
                      <SelectItem value="RECYCLE">Recycle</SelectItem>
                      <SelectItem value="CONSULTATION">Consultation</SelectItem>
                      <SelectItem value="ADJUSTMENT">Manual Adjustment</SelectItem>
                      <SelectItem value="REDEMPTION">Redemption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consumerId" className="text-sm font-semibold text-gray-700">Consumer ID *</Label>
                  <Input
                    value={eventData.consumerId}
                    onChange={(e) => handleInputChange('consumerId', e.target.value)}
                    className="border-black focus:border-black focus:ring-0 focus:outline-none"
                    placeholder="user_hk_standard"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market" className="text-sm font-semibold text-gray-700">Market</Label>
                  <Select
                    value={eventData.market}
                    onValueChange={(value) => handleInputChange('market', value)}
                  >
                    <SelectTrigger className="border-black focus:border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HK">Hong Kong</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="TW">Taiwan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel" className="text-sm font-semibold text-gray-700">Channel *</Label>
                  <Select
                    value={eventData.channel}
                    onValueChange={(value) => handleInputChange('channel', value)}
                  >
                    <SelectTrigger className="border-black focus:border-black focus:ring-0 focus:outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STORE">In-Store</SelectItem>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="MOBILE">Mobile App</SelectItem>
                      <SelectItem value="ECOMMERCE">E-Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Line - not needed for REGISTRATION, CONSULTATION, RECYCLE, or ADJUSTMENT events */}
                {eventData.eventType !== 'REGISTRATION' && eventData.eventType !== 'CONSULTATION' && eventData.eventType !== 'RECYCLE' && eventData.eventType !== 'ADJUSTMENT' && (
                  <div className="space-y-2">
                    <Label htmlFor="productLine" className="text-sm font-semibold text-gray-700">Product Line</Label>
                    <Select
                      value={eventData.productLine}
                      onValueChange={(value) => handleInputChange('productLine', value)}
                    >
                      <SelectTrigger className="border-black focus:border-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PREMIUM_SERIES">Premium Series</SelectItem>
                        <SelectItem value="STANDARD_SERIES">Standard Series</SelectItem>
                        <SelectItem value="BASIC_SERIES">Basic Series</SelectItem>
                        <SelectItem value="LUXURY_SERIES">Luxury Series</SelectItem>
                        <SelectItem value="ECONOMY_SERIES">Economy Series</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Context Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-500" />
                  Context Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {eventData.eventType === 'ADJUSTMENT' ? (
                      <>
                        <Label className="text-sm font-semibold text-gray-700">Admin ID *</Label>
                        <Input
                          value={eventData.context?.adminId || ''}
                          onChange={(e) => handleNestedChange('context', 'adminId', e.target.value)}
                          className="border-black focus:border-black"
                          placeholder="ADMIN_001"
                        />
                      </>
                    ) : (
                      <>
                        <Label className="text-sm font-semibold text-gray-700">
                          Store ID{eventData.eventType !== 'REGISTRATION' ? ' *' : ' (Optional)'}
                        </Label>
                        <Input
                          value={eventData.context?.storeId || ''}
                          onChange={(e) => handleNestedChange('context', 'storeId', e.target.value)}
                          className="border-black focus:border-black"
                          placeholder="HK_STORE_001"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Attributes Section - Show for events that have attributes */}
              {eventData.eventType !== 'REGISTRATION' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-orange-500" />
                    Event Attributes
                  </h3>
                
                {/* General Attributes - Only for PURCHASE events */}
                {eventData.eventType === 'PURCHASE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Amount *</Label>
                      <Input
                        type="number"
                        value={eventData.attributes?.amount || ''}
                        onChange={(e) => handleNestedChange('attributes', 'amount', Number(e.target.value))}
                        className="border-black focus:border-black"
                        placeholder="1500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Currency *</Label>
                      <Select
                        value={eventData.attributes?.currency || 'HKD'}
                        onValueChange={(value) => handleNestedChange('attributes', 'currency', value)}
                      >
                        <SelectTrigger className="border-black focus:border-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HKD">Hong Kong Dollar (HKD)</SelectItem>
                          <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                          <SelectItem value="TWD">Taiwan Dollar (TWD)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">SKU List</Label>
                      <Input
                        value={Array.isArray(eventData.attributes?.skuList) ? eventData.attributes.skuList.join(', ') : ''}
                        onChange={(e) => handleNestedChange('attributes', 'skuList', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="border-black focus:border-black"
                        placeholder="SK_HK_001, SK_HK_002"
                      />
                    </div>
                  </div>
                )}
                
                {/* Consultation Attributes */}
                {eventData.eventType === 'CONSULTATION' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Consultation Type *</Label>
                      <Select
                        value={eventData.attributes?.consultationType || ''}
                        onValueChange={(value) => handleNestedChange('attributes', 'consultationType', value)}
                      >
                        <SelectTrigger className="border-black focus:border-black">
                          <SelectValue placeholder="Select consultation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SKIN_ANALYSIS">Skin Analysis</SelectItem>
                          <SelectItem value="BEAUTY_CONSULTATION">Beauty Consultation</SelectItem>
                          <SelectItem value="PRODUCT_RECOMMENDATION">Product Recommendation</SelectItem>
                          <SelectItem value="VIRTUAL_CONSULTATION">Virtual Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Skin Test Date *</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={eventData.attributes?.skinTestDate || ''}
                          onChange={(e) => handleNestedChange('attributes', 'skinTestDate', e.target.value)}
                          className="border-black focus:border-black focus:ring-0 focus:outline-none pr-10"
                          placeholder="Required for consultation bonus"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Redemption Attributes */}
                {eventData.eventType === 'REDEMPTION' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Redemption Points *</Label>
                        <Input
                          type="number"
                          value={eventData.attributes?.redemptionPoints || ''}
                          onChange={(e) => {
                            handleNestedChange('attributes', 'redemptionPoints', Number(e.target.value));
                            setValidationMessage(null); // Clear validation message when value changes
                          }}
                          className="border-black focus:border-black"
                          placeholder="500"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-end">
                        <Button
                          type="button"
                          onClick={() => {
                            if (eventData.consumerId && eventData.attributes?.redemptionPoints) {
                              validateRedemptionPoints(eventData.consumerId, eventData.attributes.redemptionPoints);
                            }
                          }}
                          disabled={!eventData.consumerId || !eventData.attributes?.redemptionPoints || validationLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                        >
                          {validationLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            'Validate Redemption'
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Validation Message */}
                    {validationMessage && (
                      <div className={`p-3 rounded-md text-sm ${
                        validationMessage.includes('✅') 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {validationMessage}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Additional Attributes for Recycle Events */}
                {eventData.eventType === 'RECYCLE' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Recycled Count *</Label>
                        <Input
                          type="number"
                          value={eventData.attributes?.recycledCount || ''}
                          onChange={(e) => {
                            handleNestedChange('attributes', 'recycledCount', Number(e.target.value));
                            setRecyclingValidationMessage(null); // Clear validation message when value changes
                          }}
                          className="border-black focus:border-black"
                          placeholder="3"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-end">
                        <Button
                          type="button"
                          onClick={() => {
                            if (eventData.consumerId && eventData.attributes?.recycledCount) {
                              validateRecyclingCount(eventData.consumerId, eventData.attributes.recycledCount);
                            }
                          }}
                          disabled={!eventData.consumerId || !eventData.attributes?.recycledCount || recyclingValidationLoading}
                          className="bg-green-600 hover:bg-green-700 text-white h-10"
                        >
                          {recyclingValidationLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            'Validate Recycling'
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Recycling Validation Message */}
                    {recyclingValidationMessage && (
                      <div className={`p-3 rounded-md text-sm ${
                        recyclingValidationMessage.includes('✅') 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {recyclingValidationMessage}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Bottle Type</Label>
                      <Select
                        value={eventData.attributes?.bottleType || ''}
                        onValueChange={(value) => handleNestedChange('attributes', 'bottleType', value)}
                      >
                        <SelectTrigger className="border-black focus:border-black">
                          <SelectValue placeholder="Select bottle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ESSENCE_BOTTLE">Essence Bottle</SelectItem>
                          <SelectItem value="CLEANSER_BOTTLE">Cleanser Bottle</SelectItem>
                          <SelectItem value="MOISTURIZER_JAR">Moisturizer Jar</SelectItem>
                          <SelectItem value="SERUM_BOTTLE">Serum Bottle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {/* Adjustment Events - Only needs adjusted points, reason, and admin ID */}
                {eventData.eventType === 'ADJUSTMENT' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                      Adjustment Attributes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Adjusted Points *</Label>
                        <Input
                          type="number"
                          value={eventData.attributes?.adjustedPoints || ''}
                          onChange={(e) => handleNestedChange('attributes', 'adjustedPoints', Number(e.target.value))}
                          className="border-black focus:border-black"
                          placeholder="1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Reason *</Label>
                        <Input
                          value={eventData.attributes?.reason || ''}
                          onChange={(e) => handleNestedChange('attributes', 'reason', e.target.value)}
                          className="border-black focus:border-black"
                          placeholder="Customer service compensation"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Registration Event - No additional fields needed */}
                {eventData.eventType === 'REGISTRATION' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Registration Event</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        No additional attributes required. Points will be automatically awarded based on market rules.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleProcessEvent}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Process Event
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100 cursor-pointer"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="border-0 shadow-xl bg-white" style={{ overflow: 'visible' }}>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl cursor-pointer">
                <Cpu className="mr-3 h-6 w-6" />
                Processing Results
              </CardTitle>
              <CardDescription className="text-blue-100">
                Real-time event processing output with detailed insights
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-semibold">Processing Error</span>
                  </div>
                  <p className="text-red-700 mt-2 text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Success Header */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold text-green-800">Event Processed Successfully</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Processing completed in ~15ms
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Event ID</p>
                      <p className="font-mono text-xs text-green-800">{result.eventId}</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Points Awarded */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                      <div className="flex flex-col items-center text-center">
                        <Award className="h-8 w-8 text-purple-500 mb-2" />
                        <p className="text-sm font-medium text-purple-600 mb-1">Points Earned</p>
                        <p className="text-3xl font-bold text-purple-800">{result.totalPointsAwarded || 0}</p>
                      </div>
                    </div>

                    {/* Total Balance */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                      <div className="flex flex-col items-center text-center">
                        <CreditCard className="h-8 w-8 text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Balance</p>
                        <p className="text-3xl font-bold text-blue-800">{result.resultingBalance?.total || 0}</p>
                      </div>
                    </div>

                    {/* Available Points */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                      <div className="flex flex-col items-center text-center">
                        <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-medium text-green-600 mb-1">Available</p>
                        <p className="text-3xl font-bold text-green-800">{result.resultingBalance?.available || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center">
                      <Info className="mr-2 h-5 w-5 text-gray-600" />
                      Event Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
                        <User className="h-6 w-6 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-600 font-medium mb-1">Consumer ID</p>
                        <p className="font-mono text-sm text-gray-800 text-center break-all">{result.consumerId}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
                        <Target className="h-6 w-6 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-600 font-medium mb-2">Event Type</p>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{result.eventType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Balance Details */}
                  {result.resultingBalance && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center">
                        <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                        Account Balance Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100 min-h-[120px]">
                          <CreditCard className="h-6 w-6 text-blue-500 mb-2" />
                          <p className="text-2xl font-bold text-blue-600">{result.resultingBalance.total}</p>
                          <p className="text-sm text-gray-600 mt-1 whitespace-nowrap">Total Points</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-100 min-h-[120px]">
                          <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
                          <p className="text-2xl font-bold text-green-600">{result.resultingBalance.available}</p>
                          <p className="text-sm text-gray-600 mt-1 whitespace-nowrap">Available</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg border border-red-100 min-h-[120px]">
                          <Target className="h-6 w-6 text-red-500 mb-2" />
                          <p className="text-2xl font-bold text-red-600">{result.resultingBalance.used}</p>
                          <p className="text-sm text-gray-600 mt-1 whitespace-nowrap">Used</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-100 min-h-[120px]">
                          <Database className="h-6 w-6 text-purple-500 mb-2" />
                            <p className="text-2xl font-bold text-purple-600">{result.resultingBalance.transactionCount}</p>
                          <p className="text-sm text-gray-600 mt-1 whitespace-nowrap">Total Transactions</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Points Breakdown */}
                  {result.pointBreakdown && result.pointBreakdown.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                        Points Breakdown
                      </h4>
                      <div className="space-y-3">
                        {result.pointBreakdown.map((breakdown, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 mb-1">{breakdown.description}</p>
                              <p className="text-xs text-gray-600 font-mono">Rule ID: {breakdown.ruleId}</p>
                            </div>
                            <div className="text-center ml-4">
                              <p className="text-2xl font-bold text-yellow-600">+{breakdown.points}</p>
                              <p className="text-xs text-gray-500">points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors Section */}
                  {result.errors && result.errors.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Processing Warnings
                      </h4>
                      <ul className="space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start">
                            <span className="mr-2">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Response - Collapsible */}
                  <details className="bg-gray-50 border border-gray-200 rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-lg flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      View Raw Response Data
                    </summary>
                    <div className="p-4 pt-0">
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto font-mono">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}

              {!result && !error && !loading && (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center max-w-md mx-auto">
                    {/* Icon Container with Gradient */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <Activity className="h-10 w-10 text-blue-500" />
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Ready to Process Events</h3>
                      <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                        Configure your event parameters above and click 
                        <span className="font-semibold text-blue-600"> "Process Event" </span>
                        to see detailed processing results and points calculations.
                      </p>
                    </div>
                    
                    {/* Visual Indicators */}
                    <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Event Configuration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Processing Results</span>
                      </div>
                    </div>
                    
                    {/* Subtle Animation Hint */}
                    <div className="mt-6 text-gray-400">
                      <div className="inline-flex items-center space-x-1 text-xs">
                        <span>•</span>
                        <span>•</span>
                        <span>•</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventProcessor;
