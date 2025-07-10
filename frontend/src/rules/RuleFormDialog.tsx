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
  AlertCircle,
  CheckCircle
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-200/50">
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-blue-100 text-sm mt-1">{initialRule ? 'Modify existing rule settings' : 'Configure new rule parameters'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10 h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto dialog-scrollbar">
          <form id="rule-form" onSubmit={handleSubmit} className="p-6 space-y-8 bg-gray-50/30">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <Settings className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Rule Configuration</div>
                    <CardDescription className="text-slate-600 mt-1">Basic rule information and settings</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span>Rule Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`h-11 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'} transition-colors`}
                      placeholder="Enter a descriptive rule name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span>Rule Category</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    {initialRule ? (
                      // In edit mode, show category as read-only
                      <div className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 h-11">
                        {formData.category && RULE_CATEGORIES[formData.category as keyof typeof RULE_CATEGORIES] && (
                          <>
                            {(() => {
                              const IconComponent = RULE_CATEGORIES[formData.category as keyof typeof RULE_CATEGORIES].icon;
                              return <IconComponent className="h-5 w-5 text-slate-600" />;
                            })()}
                            <span className="font-medium text-slate-700">{RULE_CATEGORIES[formData.category as keyof typeof RULE_CATEGORIES].label}</span>
                          </>
                        )}
                        {!formData.category && <span className="text-slate-500">No category set</span>}
                      </div>
                    ) : (
                      // In create mode, allow selection
                      <>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger className={`h-11 ${errors.category ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'} transition-colors`}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>                        <SelectContent className="max-h-[280px] overflow-y-auto z-50">
                          {Object.entries(RULE_CATEGORIES).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="py-3 px-4 cursor-pointer hover:bg-slate-50">
                              <div className="flex items-center gap-3 w-full">
                                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                                  <config.icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="font-medium text-slate-900 truncate">{config.label}</div>
                                  <div className="text-sm text-slate-500 truncate mt-0.5">{config.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            {errors.category}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span>Priority Level</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                      className={`h-11 ${errors.priority ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'} transition-colors`}
                      placeholder="1-100"
                    />
                    <div className="text-xs text-slate-500">Higher numbers = higher priority</div>
                    {errors.priority && (
                      <p className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.priority}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Rule Status</Label>
                    <div className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg bg-slate-50">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <Label htmlFor="active" className="flex items-center gap-2 cursor-pointer">
                        <span className={`font-medium ${formData.active ? 'text-green-700' : 'text-slate-500'}`}>
                          {formData.active ? 'Active' : 'Inactive'}
                        </span>
                        {formData.active && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Conditions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-t-lg border-b border-emerald-200">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Rule Conditions</div>
                  <CardDescription className="text-emerald-600 mt-1 flex items-center gap-2">
                    <span>Define when this rule should trigger</span>
                    <span className="text-red-500">*</span>
                  </CardDescription>
                </div>
              </CardTitle>
              {errors.conditions && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.conditions}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                {Array.isArray(formData.conditions?.all) && formData.conditions.all.map((condition: any, index: number) => (
                  <div key={index} className="p-5 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-700">Condition {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Fact</Label>
                        <Select 
                          value={condition.fact} 
                          onValueChange={(value) => updateCondition(index, 'fact', value)}
                        >
                          <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500">
                            <SelectValue placeholder="Select fact" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {allAvailableFacts.map((fact) => (
                              <SelectItem key={fact} value={fact} className="py-2 px-3">
                                <span className="font-medium">{fact}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Operator</Label>
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value} className="py-2 px-3">
                                <span className="font-medium">{op.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Value</Label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Enter value"
                          className="h-10 border-slate-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCondition}
                  className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Condition
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Configuration */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg border-b border-purple-200">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Event Configuration</div>
                  <CardDescription className="text-purple-600 mt-1">Configure the event that this rule will trigger</CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span>Event Type</span>
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-3">
                  <Select 
                    value={formData.event?.type || ''} 
                    onValueChange={(value) => handleEventChange('type', value)}
                  >
                    <SelectTrigger className={`flex-1 h-11 ${errors.eventType ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'} transition-colors`}>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] overflow-y-auto">
                      {/* Show default event types */}
                      {Array.isArray(defaults?.eventTypes) && defaults.eventTypes.map((type: string) => (
                        <SelectItem key={type} value={type} className="py-2 px-3">
                          <span className="font-medium">{type}</span>
                        </SelectItem>
                      ))}
                      {/* When editing, also show the current event type if it's not in defaults */}
                      {initialRule && formData.event?.type && 
                       (!Array.isArray(defaults?.eventTypes) || !defaults.eventTypes.includes(formData.event.type)) && (
                        <SelectItem key={formData.event.type} value={formData.event.type} className="py-2 px-3">
                          <span className="font-medium">{formData.event.type} (current)</span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, eventType: !prev.eventType }))}
                    className="px-3 h-11 border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.eventType && (
                  <p className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    {errors.eventType}
                  </p>
                )}

                {showCustomInputs.eventType && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <Input
                        value={customEventType}
                        onChange={(e) => setCustomEventType(e.target.value)}
                        placeholder="Enter custom event type"
                        className="flex-1 h-10 border-slate-300 focus:border-blue-500"
                      />
                      <Button type="button" onClick={addCustomEventType} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, eventType: false }))}
                        size="sm"
                        className="border-slate-300 hover:border-slate-400"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Parameters - Enhanced */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-slate-700">Event Parameters</Label>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  {/* Description */}
                  <div className="mb-6">
                    <Label htmlFor="eventDescription" className="text-sm font-semibold text-slate-700 mb-2 block">Description</Label>
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
                      className="h-11 border-slate-300 focus:border-blue-500"
                    />
                  </div>

                  {/* Core Parameters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="multiplier" className="text-sm font-semibold text-slate-700">Multiplier</Label>
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
                        className="h-11 border-slate-300 focus:border-blue-500"
                      />
                      <div className="text-xs text-slate-500">Point calculation multiplier</div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bonus" className="text-sm font-semibold text-slate-700">Bonus Points</Label>
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
                        className="h-11 border-slate-300 focus:border-blue-500"
                      />
                      <div className="text-xs text-slate-500">Additional bonus points</div>
                    </div>
                  </div>

                  {/* Custom Parameters */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Additional Parameters</Label>
                      <div className="h-px bg-slate-300 flex-1"></div>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(formData.event?.params || {})
                        .filter(([key]) => !['description', 'multiplier', 'bonus', 'fixedBonus', 'registrationBonus'].includes(key))
                        .map(([key, value], index) => (
                          <div key={index} className="flex gap-3 items-end p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex-1 space-y-1">
                              <Label className="text-xs font-medium text-slate-600">Parameter Name</Label>
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
                                className="h-9 border-slate-300 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-xs font-medium text-slate-600">Value</Label>
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
                                className="h-9 border-slate-300 focus:border-blue-500"
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 h-9 px-2"
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
                        className="w-full h-10 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
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
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg border-b border-orange-200">
              <CardTitle className="flex items-center gap-3 text-orange-800">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Tag className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Scope Configuration</div>
                  <CardDescription className="text-orange-600 mt-1">Define where this rule applies</CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Markets */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span>Markets</span>
                  <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-4">
                  <div className="min-h-[40px] p-3 border border-slate-300 rounded-lg bg-slate-50 flex flex-wrap gap-2">
                    {Array.isArray(formData?.markets) && formData.markets.length > 0 ? (
                      formData.markets.map((market: string) => (
                        <span key={market} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                          <span className="font-medium">{market}</span>
                          <button
                            type="button"
                            onClick={() => removeMarket(market)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">No markets selected</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Select onValueChange={(value) => { addMarket(value); errors.markets && setErrors(prev => ({ ...prev, markets: '' })); }}>
                      <SelectTrigger className={`flex-1 h-11 ${errors.markets ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'} transition-colors`}>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {Array.isArray(defaults?.markets) && defaults.markets
                          .filter((market: string) => !Array.isArray(formData?.markets) || !formData.markets.includes(market))
                          .map((market: string) => (
                            <SelectItem key={market} value={market} className="py-2 px-3">
                              <span className="font-medium">{market}</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, market: !prev.market }))}
                      className="px-3 h-11 border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showCustomInputs.market && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          value={customMarket}
                          onChange={(e) => setCustomMarket(e.target.value)}
                          placeholder="Enter custom market"
                          className="flex-1 h-10 border-slate-300 focus:border-blue-500"
                        />
                        <Button type="button" onClick={addCustomMarket} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Add
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, market: false }))}
                          size="sm"
                          className="border-slate-300 hover:border-slate-400"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {errors.markets && (
                    <p className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {errors.markets}
                    </p>
                  )}
                </div>
              </div>

              {/* Channels */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span>Channels</span>
                  <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-4">
                  <div className="min-h-[40px] p-3 border border-slate-300 rounded-lg bg-slate-50 flex flex-wrap gap-2">
                    {Array.isArray(formData?.channels) && formData.channels.length > 0 ? (
                      formData.channels.map((channel: string) => (
                        <span key={channel} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                          <span className="font-medium">{channel}</span>
                          <button
                            type="button"
                            onClick={() => removeChannel(channel)}
                            className="ml-2 hover:text-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">No channels selected</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Select onValueChange={(value) => { addChannel(value); errors.channels && setErrors(prev => ({ ...prev, channels: '' })); }}>
                      <SelectTrigger className={`flex-1 h-11 ${errors.channels ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'} transition-colors`}>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {Array.isArray(defaults?.channels) && defaults.channels
                          .filter((channel: string) => !Array.isArray(formData?.channels) || !formData.channels.includes(channel))
                          .map((channel: string) => (
                            <SelectItem key={channel} value={channel} className="py-2 px-3">
                              <span className="font-medium">{channel}</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, channel: !prev.channel }))}
                      className="px-3 h-11 border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showCustomInputs.channel && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          value={customChannel}
                          onChange={(e) => setCustomChannel(e.target.value)}
                          placeholder="Enter custom channel"
                          className="flex-1 h-10 border-slate-300 focus:border-blue-500"
                        />
                        <Button type="button" onClick={addCustomChannel} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Add
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCustomInputs((prev: any) => ({ ...prev, channel: false }))}
                          size="sm"
                          className="border-slate-300 hover:border-slate-400"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {errors.channels && (
                    <p className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {errors.channels}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm rounded-b-2xl flex-shrink-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="h-10 px-6 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="rule-form"
          className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Save className="h-4 w-4 mr-2" />
          {initialRule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </div>
  </div>
  );
};

export default RuleFormDialog;
