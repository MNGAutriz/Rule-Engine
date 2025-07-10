import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Rule, defaultsApi } from '@/services/api';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Zap, 
  Target, 
  Tag, 
  Activity,
  Settings,
  Check,
  AlertCircle
} from 'lucide-react';

interface RuleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, rule: Omit<Rule, 'id' | 'category'>) => void;
  initialRule?: Rule;
  title?: string;
}

// Available fact choices for different categories
const FACT_CHOICES = {
  transaction: [
    'transactionAmount',
    'productId',
    'productCategory',
    'purchaseDate',
    'paymentMethod',
    'loyaltyTier',
    'customerId',
    'orderTotal',
    'itemCount'
  ],
  consumer: [
    'age',
    'gender',
    'location',
    'loyaltyTier',
    'totalSpent',
    'orderHistory',
    'preferredCategory',
    'registrationDate',
    'lastPurchaseDate',
    'totalOrders'
  ],
  product: [
    'productId',
    'productCategory',
    'productBrand',
    'productPrice',
    'productTags',
    'stockLevel',
    'salesRank',
    'reviewRating',
    'launchDate'
  ],
  basket: [
    'basketTotal',
    'itemCount',
    'productCategories',
    'basketItems',
    'discountApplied',
    'shippingMethod',
    'basketValue',
    'promotionalCodes'
  ]
};

// Condition operators
const OPERATORS = [
  { value: 'equal', label: 'equals' },
  { value: 'notEqual', label: 'not equals' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'greaterThanInclusive', label: 'greater than or equal' },
  { value: 'lessThan', label: 'less than' },
  { value: 'lessThanInclusive', label: 'less than or equal' },
  { value: 'in', label: 'in list' },
  { value: 'notIn', label: 'not in list' },
  { value: 'contains', label: 'contains' },
  { value: 'doesNotContain', label: 'does not contain' }
];

// Rule categories with enhanced styling
const RULE_CATEGORIES = {
  transaction: { 
    label: 'Transaction Rules', 
    icon: Zap, 
    color: 'bg-blue-500',
    description: 'Rules based on transaction data and purchase behavior'
  },
  consumer: { 
    label: 'Consumer Attribute Rules', 
    icon: Target, 
    color: 'bg-emerald-500',
    description: 'Rules based on customer demographics and attributes'
  },
  product: { 
    label: 'Product Multiplier Rules', 
    icon: Tag, 
    color: 'bg-purple-500',
    description: 'Rules that apply multipliers based on product characteristics'
  },
  basket: { 
    label: 'Basket Threshold Rules', 
    icon: Activity, 
    color: 'bg-orange-500',
    description: 'Rules based on shopping cart totals and thresholds'
  }
};

const RuleFormDialog: React.FC<RuleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRule,
  title = 'Create New Rule'
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    category: '',
    priority: 1,
    active: true,
    conditions: {
      all: []
    },
    event: {
      type: '',
      params: {}
    },
    markets: [],
    channels: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [defaults, setDefaults] = useState<any>({
    markets: [],
    channels: [],
    eventTypes: []
  });

  const [customMarket, setCustomMarket] = useState('');
  const [customChannel, setCustomChannel] = useState('');
  const [customEventType, setCustomEventType] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState({
    market: false,
    channel: false,
    eventType: false
  });

  // Helper function to extract values from rule conditions
  const extractFromConditions = (conditions: any, factName: string): string[] => {
    if (!conditions?.all || !Array.isArray(conditions.all)) return [];
    
    const values: string[] = [];
    conditions.all.forEach((condition: any) => {
      if (condition.fact === factName) {
        if (condition.operator === 'equal' && condition.value) {
          values.push(condition.value);
        } else if (condition.operator === 'in' && Array.isArray(condition.value)) {
          values.push(...condition.value);
        }
      }
    });
    
    return [...new Set(values)]; // Remove duplicates
  };

  useEffect(() => {
    console.log('🔄 RuleFormDialog useEffect triggered:', { 
      isOpen, 
      hasInitialRule: !!initialRule,
      initialRuleName: initialRule?.name,
      initialRuleMarkets: initialRule?.markets,
      initialRuleChannels: initialRule?.channels,
      initialRuleEventType: initialRule?.event?.type
    });
    
    loadDefaults();
    
    if (initialRule) {
      // Extract markets and channels from conditions if not explicitly stored
      const marketsFromConditions = extractFromConditions(initialRule.conditions, 'market');
      const channelsFromConditions = extractFromConditions(initialRule.conditions, 'channel');
      const eventTypesFromConditions = extractFromConditions(initialRule.conditions, 'eventType');
      
      // When editing, load all existing rule data with defensive checks
      const safeRule = {
        name: initialRule.name || '',
        category: initialRule.category || '',
        priority: initialRule.priority || 1,
        active: initialRule.active !== false,
        conditions: initialRule.conditions || { all: [] },
        event: {
          type: initialRule.event?.type || (eventTypesFromConditions.length > 0 ? eventTypesFromConditions[0] : ''),
          params: {
            // Ensure all common event params are included
            description: initialRule.event?.params?.description || '',
            multiplier: initialRule.event?.params?.multiplier || '',
            bonus: initialRule.event?.params?.bonus || initialRule.event?.params?.fixedBonus || '',
            // Include any other existing params
            ...(initialRule.event?.params || {})
          }
        },
        // Use explicit fields if available, otherwise extract from conditions
        markets: Array.isArray(initialRule.markets) && initialRule.markets.length > 0 
          ? initialRule.markets 
          : marketsFromConditions,
        channels: Array.isArray(initialRule.channels) && initialRule.channels.length > 0 
          ? initialRule.channels 
          : channelsFromConditions
      };
      
      console.log('🔧 Loading rule for editing:', {
        name: safeRule.name,
        category: safeRule.category,
        markets: safeRule.markets,
        marketsFromConditions,
        channels: safeRule.channels,
        channelsFromConditions,
        eventType: safeRule.event?.type,
        eventTypesFromConditions,
        eventParamsKeys: Object.keys(safeRule.event?.params || {})
      });
      setFormData(safeRule);
    } else {
      // Reset form data when creating new rule
      setFormData({
        name: '',
        category: '',
        priority: 1,
        active: true,
        conditions: {
          all: []
        },
        event: {
          type: '',
          params: {}
        },
        markets: [],
        channels: []
      });
    }
  }, [initialRule, isOpen]);

  const loadDefaults = async () => {
    try {
      console.log('📡 Loading defaults...');
      const response = await defaultsApi.getDefaults();
      console.log('✅ Defaults loaded:', {
        markets: response.markets,
        channels: response.channels,
        eventTypes: response.eventTypes
      });
      setDefaults(response);
    } catch (error) {
      console.error('❌ Error loading defaults:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Rule name validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Rule name is required';
    }

    // Category validation (only for new rules)
    if (!formData.category && !initialRule) {
      newErrors.category = 'Rule category is required';
    }

    // Event type validation
    if (!formData.event?.type?.trim()) {
      newErrors.eventType = 'Event type is required';
    }

    // Priority validation
    if (!formData.priority || formData.priority < 1) {
      newErrors.priority = 'Priority must be at least 1';
    }

    // Conditions validation
    if (!formData.conditions?.all?.length) {
      newErrors.conditions = 'At least one condition is required';
    } else {
      // Check if all conditions are properly filled
      const invalidConditions = formData.conditions.all.some((condition: any) => 
        !condition.fact || !condition.operator || (condition.value === '' || condition.value === null || condition.value === undefined)
      );
      if (invalidConditions) {
        newErrors.conditions = 'All conditions must have fact, operator, and value filled';
      }
    }

    // Markets validation (at least one market required)
    if (!formData.markets?.length) {
      newErrors.markets = 'At least one market must be selected';
    }

    // Channels validation (at least one channel required)
    if (!formData.channels?.length) {
      newErrors.channels = 'At least one channel must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEventChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      event: {
        ...prev.event,
        [field]: value
      }
    }));
    
    // Clear event type error
    if (field === 'type' && errors.eventType) {
      setErrors(prev => ({
        ...prev,
        eventType: ''
      }));
    }
  };

  // Helper function to sync markets, channels, and event types with conditions
  const syncConditionsWithFormData = (currentFormData: any) => {
    let updatedConditions = { ...currentFormData.conditions };
    if (!updatedConditions.all) updatedConditions.all = [];

    // Remove existing market, channel, and eventType conditions
    updatedConditions.all = updatedConditions.all.filter((condition: any) => 
      !['market', 'channel', 'eventType'].includes(condition.fact)
    );

    // Add market conditions
    if (currentFormData.markets && currentFormData.markets.length > 0) {
      if (currentFormData.markets.length === 1) {
        updatedConditions.all.unshift({
          fact: 'market',
          operator: 'equal',
          value: currentFormData.markets[0]
        });
      } else {
        updatedConditions.all.unshift({
          fact: 'market',
          operator: 'in',
          value: currentFormData.markets
        });
      }
    }

    // Add channel conditions
    if (currentFormData.channels && currentFormData.channels.length > 0) {
      if (currentFormData.channels.length === 1) {
        updatedConditions.all.unshift({
          fact: 'channel',
          operator: 'equal',
          value: currentFormData.channels[0]
        });
      } else {
        updatedConditions.all.unshift({
          fact: 'channel',
          operator: 'in',
          value: currentFormData.channels
        });
      }
    }

    // Add event type condition
    if (currentFormData.event?.type) {
      updatedConditions.all.unshift({
        fact: 'eventType',
        operator: 'equal',
        value: currentFormData.event.type
      });
    }

    return updatedConditions;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Clean up the form data before submission and sync conditions
    const cleanedFormData = {
      ...formData,
      name: formData.name.trim(),
      event: {
        ...formData.event,
        type: formData.event.type.trim(),
        params: formData.event.params || {}
      }
    };

    // Sync conditions with markets, channels, and event types
    cleanedFormData.conditions = syncConditionsWithFormData(cleanedFormData);
    
    const { category, ...ruleData } = cleanedFormData;
    console.log('Submitting rule with synced conditions:', { 
      category: category || initialRule?.category, 
      ruleData,
      syncedConditions: ruleData.conditions 
    });
    onSubmit(category || initialRule?.category, ruleData);
  };

  const addCondition = () => {
    setFormData((prev: any) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        all: [
          ...prev.conditions.all,
          {
            fact: '',
            operator: 'equal',
            value: ''
          }
        ]
      }
    }));
    
    // Clear conditions error when adding a new condition
    if (errors.conditions) {
      setErrors(prev => ({
        ...prev,
        conditions: ''
      }));
    }
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        all: (prev.conditions?.all || []).map((condition: any, i: number) =>
          i === index ? { ...condition, [field]: value } : condition
        )
      }
    }));
    
    // Clear conditions error when updating a condition
    if (errors.conditions) {
      setErrors(prev => ({
        ...prev,
        conditions: ''
      }));
    }
  };

  const removeCondition = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        all: (prev.conditions?.all || []).filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addMarket = (market: string) => {
    if (!formData.markets.includes(market)) {
      setFormData((prev: any) => ({
        ...prev,
        markets: [...prev.markets, market]
      }));
    }
  };

  const removeMarket = (market: string) => {
    setFormData((prev: any) => ({
      ...prev,
      markets: prev.markets.filter((m: string) => m !== market)
    }));
  };

  const addChannel = (channel: string) => {
    if (!formData.channels.includes(channel)) {
      setFormData((prev: any) => ({
        ...prev,
        channels: [...prev.channels, channel]
      }));
    }
  };

  const removeChannel = (channel: string) => {
    setFormData((prev: any) => ({
      ...prev,
      channels: prev.channels.filter((c: string) => c !== channel)
    }));
  };

  const addCustomMarket = () => {
    if (customMarket.trim() && !formData.markets.includes(customMarket.trim())) {
      addMarket(customMarket.trim());
      setCustomMarket('');
      setShowCustomInputs((prev: any) => ({ ...prev, market: false }));
    }
  };

  const addCustomChannel = () => {
    if (customChannel.trim() && !formData.channels.includes(customChannel.trim())) {
      addChannel(customChannel.trim());
      setCustomChannel('');
      setShowCustomInputs((prev: any) => ({ ...prev, channel: false }));
    }
  };

  const addCustomEventType = () => {
    if (customEventType.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        event: {
          ...prev.event,
          type: customEventType.trim()
        }
      }));
      setCustomEventType('');
      setShowCustomInputs((prev: any) => ({ ...prev, eventType: false }));
    }
  };

  if (!isOpen) return null;

  // Get available facts based on selected category
  const availableFacts = formData.category ? FACT_CHOICES[formData.category as keyof typeof FACT_CHOICES] || [] : [];
  
  // When editing, also include any existing facts that might not be in our predefined list
  const allAvailableFacts = [...new Set([
    ...availableFacts,
    ...(initialRule && Array.isArray(formData.conditions?.all) 
      ? formData.conditions.all.map((condition: any) => condition.fact).filter(Boolean)
      : []
    )
  ])];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Rule Configuration
              </CardTitle>
              <CardDescription>Basic rule information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Rule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter rule name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">Rule Category *</Label>
                  {initialRule ? (
                    // In edit mode, show category as read-only
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50 mt-1">
                      {formData.category && RULE_CATEGORIES[formData.category as keyof typeof RULE_CATEGORIES] && (
                        <>
                          {(() => {
                            const IconComponent = RULE_CATEGORIES[formData.category as keyof typeof RULE_CATEGORIES].icon;
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                          <span>{RULE_CATEGORIES[formData.category as keyof typeof RULE_CATEGORIES].label}</span>
                        </>
                      )}
                      {!formData.category && <span className="text-gray-500">No category set</span>}
                    </div>
                  ) : (
                    // In create mode, allow selection
                    <>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(RULE_CATEGORIES).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.category}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority *</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                    className={`mt-1 ${errors.priority ? 'border-red-500' : ''}`}
                  />
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.priority}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, active: e.target.checked }))}
                  />
                  <Label htmlFor="active">Rule Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Rule Conditions *
              </CardTitle>
              <CardDescription>Define when this rule should trigger</CardDescription>
              {errors.conditions && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.conditions}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Array.isArray(formData.conditions?.all) && formData.conditions.all.map((condition: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Fact</Label>
                        <Select 
                          value={condition.fact} 
                          onValueChange={(value) => updateCondition(index, 'fact', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fact" />
                          </SelectTrigger>
                          <SelectContent>
                            {allAvailableFacts.map((fact) => (
                              <SelectItem key={fact} value={fact}>
                                {fact}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Operator</Label>
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Value</Label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCondition}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Event Configuration
              </CardTitle>
              <CardDescription>Configure the event that this rule will trigger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventType" className="text-sm font-medium text-gray-700">Event Type *</Label>
                <div className="flex gap-2 mt-1">
                  <Select 
                    value={formData.event?.type || ''} 
                    onValueChange={(value) => handleEventChange('type', value)}
                  >
                    <SelectTrigger className={`flex-1 ${errors.eventType ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Show default event types */}
                      {Array.isArray(defaults?.eventTypes) && defaults.eventTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                      {/* When editing, also show the current event type if it's not in defaults */}
                      {initialRule && formData.event?.type && 
                       (!Array.isArray(defaults?.eventTypes) || !defaults.eventTypes.includes(formData.event.type)) && (
                        <SelectItem key={formData.event.type} value={formData.event.type}>
                          {formData.event.type} (current)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, eventType: !prev.eventType }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.eventType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.eventType}
                  </p>
                )}

                {showCustomInputs.eventType && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={customEventType}
                      onChange={(e) => setCustomEventType(e.target.value)}
                      placeholder="Enter custom event type"
                    />
                    <Button type="button" onClick={addCustomEventType} size="sm">
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, eventType: false }))}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Event Parameters - Simplified */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Event Parameters</Label>
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Description */}
                  <div>
                    <Label htmlFor="eventDescription">Description</Label>
                    <Input
                      id="eventDescription"
                      value={formData.event?.params?.description || ''}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        event: {
                          ...prev.event,
                          params: {
                            ...prev.event?.params,
                            description: e.target.value
                          }
                        }
                      }))}
                      placeholder="Enter event description"
                    />
                  </div>

                  {/* Core Parameters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="multiplier">Multiplier</Label>
                      <Input
                        id="multiplier"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.event?.params?.multiplier || ''}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          event: {
                            ...prev.event,
                            params: {
                              ...prev.event?.params,
                              multiplier: e.target.value ? parseFloat(e.target.value) : undefined
                            }
                          }
                        }))}
                        placeholder="e.g., 1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bonus">Bonus Points</Label>
                      <Input
                        id="bonus"
                        type="number"
                        min="0"
                        value={formData.event?.params?.bonus || formData.event?.params?.fixedBonus || formData.event?.params?.registrationBonus || ''}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          event: {
                            ...prev.event,
                            params: {
                              ...prev.event?.params,
                              bonus: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          }
                        }))}
                        placeholder="e.g., 300"
                      />
                    </div>
                  </div>

                  {/* Custom Parameters */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Additional Parameters</Label>
                    <div className="space-y-2">
                      {Object.entries(formData.event?.params || {})
                        .filter(([key]) => !['description', 'multiplier', 'bonus', 'fixedBonus', 'registrationBonus'].includes(key))
                        .map(([key, value], index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label>Parameter Name</Label>
                              <Input
                                value={key}
                                onChange={(e) => {
                                  const newKey = e.target.value;
                                  const params = { ...formData.event?.params };
                                  delete params[key];
                                  if (newKey) params[newKey] = value;
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    event: { ...prev.event, params }
                                  }));
                                }}
                                placeholder="Parameter name"
                              />
                            </div>
                            <div className="flex-1">
                              <Label>Value</Label>
                              <Input
                                value={String(value)}
                                onChange={(e) => {
                                  let processedValue: any = e.target.value;
                                  // Try to parse as number if it looks like a number
                                  if (!isNaN(Number(processedValue)) && processedValue !== '') {
                                    processedValue = Number(processedValue);
                                  }
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    event: {
                                      ...prev.event,
                                      params: {
                                        ...prev.event?.params,
                                        [key]: processedValue
                                      }
                                    }
                                  }));
                                }}
                                placeholder="Parameter value"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const params = { ...formData.event?.params };
                                delete params[key];
                                setFormData((prev: any) => ({
                                  ...prev,
                                  event: { ...prev.event, params }
                                }));
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newKey = `customParam${Date.now()}`;
                          setFormData((prev: any) => ({
                            ...prev,
                            event: {
                              ...prev.event,
                              params: {
                                ...prev.event?.params,
                                [newKey]: ''
                              }
                            }
                          }));
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Parameter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Markets and Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Scope Configuration
              </CardTitle>
              <CardDescription>Define where this rule applies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Markets */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Markets *</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(formData?.markets) && formData.markets.length > 0 ? (
                      formData.markets.map((market: string) => (
                        <span key={market} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {market}
                          <button
                            type="button"
                            onClick={() => removeMarket(market)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No markets selected</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Select onValueChange={(value) => { addMarket(value); errors.markets && setErrors(prev => ({ ...prev, markets: '' })); }}>
                      <SelectTrigger className={`flex-1 ${errors.markets ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(defaults?.markets) && defaults.markets
                          .filter((market: string) => !Array.isArray(formData?.markets) || !formData.markets.includes(market))
                          .map((market: string) => (
                            <SelectItem key={market} value={market}>
                              {market}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, market: !prev.market }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showCustomInputs.market && (
                    <div className="flex gap-2">
                      <Input
                        value={customMarket}
                        onChange={(e) => setCustomMarket(e.target.value)}
                        placeholder="Enter custom market"
                      />
                      <Button type="button" onClick={addCustomMarket} size="sm">
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, market: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {errors.markets && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.markets}
                    </p>
                  )}
                </div>
              </div>

              {/* Channels */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Channels *</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(formData?.channels) && formData.channels.length > 0 ? (
                      formData.channels.map((channel: string) => (
                        <span key={channel} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          {channel}
                          <button
                            type="button"
                            onClick={() => removeChannel(channel)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No channels selected</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Select onValueChange={(value) => { addChannel(value); errors.channels && setErrors(prev => ({ ...prev, channels: '' })); }}>
                      <SelectTrigger className={`flex-1 ${errors.channels ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(defaults?.channels) && defaults.channels
                          .filter((channel: string) => !Array.isArray(formData?.channels) || !formData.channels.includes(channel))
                          .map((channel: string) => (
                            <SelectItem key={channel} value={channel}>
                              {channel}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, channel: !prev.channel }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showCustomInputs.channel && (
                    <div className="flex gap-2">
                      <Input
                        value={customChannel}
                        onChange={(e) => setCustomChannel(e.target.value)}
                        placeholder="Enter custom channel"
                      />
                      <Button type="button" onClick={addCustomChannel} size="sm">
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, channel: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {errors.channels && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.channels}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="!text-white" style={{ background: 'linear-gradient(to right, rgb(0, 114, 187), rgb(0, 94, 154))' }}>
              <Save className="h-4 w-4 mr-2 !text-white" />
              {initialRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RuleFormDialog;
