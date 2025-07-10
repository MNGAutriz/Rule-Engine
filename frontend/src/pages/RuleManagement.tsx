import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { StatusBadge, StatsGrid } from '@/components/display';
import { RuleFormDialog, DeleteRuleDialog } from '@/rules';
import Toast from '@/components/common/Toast';
import { rulesManagementApi, type Rule } from '@/services/api';
import { formatNumber } from '@/lib/utils';
import { 
  Settings, 
  Filter, 
  RefreshCw, 
  Search, 
  Target, 
  Activity,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Code,
  Tag,
  Zap,
  Gift,
  Star,
  ShoppingCart,
  Users,
  Crown,
  TrendingUp,
  X
} from 'lucide-react';

// Rule category constants with enhanced color schemes
const RULE_CATEGORIES = {
  transaction: { 
    label: 'Transaction Rules', 
    icon: Zap, 
    colors: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-800',
      light: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-500',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-blue-600'
    }
  },
  consumer: { 
    label: 'Consumer Attribute Rules', 
    icon: Target, 
    colors: {
      bg: 'bg-emerald-100',
      border: 'border-emerald-400',
      text: 'text-emerald-800',
      light: 'bg-emerald-50',
      hoverBorder: 'hover:border-emerald-500',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-600'
    }
  },
  product: { 
    label: 'Product Multiplier Rules', 
    icon: Tag, 
    colors: {
      bg: 'bg-sky-100',
      border: 'border-sky-400',
      text: 'text-sky-800',
      light: 'bg-sky-50',
      hoverBorder: 'hover:border-sky-500',
      gradient: 'bg-gradient-to-br from-sky-500 to-sky-600',
      iconColor: 'text-sky-600'
    }
  },
  basket: { 
    label: 'Basket Threshold Rules', 
    icon: Activity, 
    colors: {
      bg: 'bg-orange-100',
      border: 'border-orange-400',
      text: 'text-orange-800',
      light: 'bg-orange-50',
      hoverBorder: 'hover:border-orange-500',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconColor: 'text-orange-600'
    }
  }
};

// Event type color mapping
const getEventTypeColor = (eventType: string) => {
  const eventColors = {
    'INTERACTION_REGISTRY_POINT': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'ORDER_BASE_POINT': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'FLEXIBLE_CAMPAIGN_BONUS': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    'FLEXIBLE_VIP_MULTIPLIER': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'FIRST_PURCHASE_BIRTH_MONTH_BONUS': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'FLEXIBLE_PRODUCT_MULTIPLIER': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'AWARD_POINTS': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'default': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  };
  return eventColors[eventType] || eventColors['default'];
};

// Event type icon mapping
const getEventTypeIcon = (eventType: string) => {
  const eventIcons = {
    'INTERACTION_REGISTRY_POINT': Users,
    'ORDER_BASE_POINT': ShoppingCart,
    'FLEXIBLE_CAMPAIGN_BONUS': Gift,
    'FLEXIBLE_VIP_MULTIPLIER': Crown,
    'FIRST_PURCHASE_BIRTH_MONTH_BONUS': Star,
    'FLEXIBLE_PRODUCT_MULTIPLIER': TrendingUp,
    'AWARD_POINTS': Target,
    'default': Code
  };
  return eventIcons[eventType] || eventIcons['default'];
};

// Condition operators for display
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

// Priority color mapping
const getPriorityColor = (priority: number) => {
  if (priority >= 8) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'High' };
  if (priority >= 5) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medium' };
  return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Low' };
};

// Market color mapping (similar to campaigns)
const getMarketColor = (market: string) => {
  const colors = {
    'HK': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'JP': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'TW': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'ALL': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    'US': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  };
  return colors[market] || colors['ALL'];
};

interface RuleManagerProps {}

const RuleManager: React.FC<RuleManagerProps> = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [deletingRule, setDeletingRule] = useState<Rule | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await rulesManagementApi.getAllRules();
      if (response.success && response.rules) {
        setRules(response.rules);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
      setToast({
        message: 'Failed to load rules. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (category: string, ruleData: Omit<Rule, 'id' | 'category'>) => {
    try {
      const response = await rulesManagementApi.addRule(category, ruleData as Rule);
      if (response.success) {
        setToast({
          message: 'Rule created successfully!',
          type: 'success'
        });
        await loadRules();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      setToast({
        message: 'Failed to create rule. Please try again.',
        type: 'error'
      });
    }
  };

  const handleUpdateRule = async (ruleId: string, ruleData: Rule) => {
    try {
      const response = await rulesManagementApi.updateRule(ruleId, ruleData);
      if (response.success) {
        setToast({
          message: 'Rule updated successfully!',
          type: 'success'
        });
        await loadRules();
        setEditingRule(null);
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      setToast({
        message: 'Failed to update rule. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const response = await rulesManagementApi.deleteRule(ruleId);
      if (response.success) {
        setToast({
          message: 'Rule deleted successfully!',
          type: 'success'
        });
        await loadRules();
        setDeletingRule(null);
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      setToast({
        message: 'Failed to delete rule. Please try again.',
        type: 'error'
      });
    }
  };

  // Filter rules based on current filters
  const filteredRules = rules.filter(rule => {
    const matchesCategory = filters.category === 'all' || rule.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && rule.active !== false) ||
      (filters.status === 'inactive' && rule.active === false);
    const matchesSearch = filters.search === '' || 
      rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (rule.category && rule.category.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Calculate stats with proper gradient colors and enhanced rule-specific data
  const transactionRules = rules.filter(rule => rule.category === 'transaction');
  const consumerRules = rules.filter(rule => rule.category === 'consumer');
  const productRules = rules.filter(rule => rule.category === 'product');
  const basketRules = rules.filter(rule => rule.category === 'basket');
  const highPriorityRules = rules.filter(rule => (rule.priority || 1) >= 8);
  
  const stats = [
    {
      title: 'Total Rules',
      value: formatNumber(rules.length),
      icon: Settings,
      description: 'All rules in system',
      gradientColors: 'bg-gradient-to-br from-slate-500 to-slate-600',
      iconBgColor: 'slate'
    },
    {
      title: 'Transaction Rules',
      value: formatNumber(transactionRules.length),
      icon: Zap,
      description: 'Purchase & interaction rules',
      gradientColors: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBgColor: 'blue'
    },
    {
      title: 'Consumer Rules',
      value: formatNumber(consumerRules.length),
      icon: Target,
      description: 'Profile-based rules',
      gradientColors: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBgColor: 'emerald'
    },
    {
      title: 'High Priority',
      value: formatNumber(highPriorityRules.length),
      icon: XCircle,
      description: 'Priority 8+ rules',
      gradientColors: 'bg-gradient-to-br from-red-500 to-red-600',
      iconBgColor: 'red'
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Rule Management"
        subtitle="Create, edit, and manage business rules across all categories"
        icon={Settings}
      />
      
      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid stats={stats} />
      </div>

      {/* Enhanced Controls Section - Simplified */}
      <Card className="mb-8 border-2 border-blue-200 shadow-lg bg-gradient-to-r from-white to-blue-50">
        <CardHeader className="text-white" style={{ background: 'linear-gradient(to right, rgb(0, 114, 187), rgb(0, 94, 154))' }}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-wide">Filters & Actions</span>
            </div>
            <div className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {formatNumber(filteredRules.length)} of {formatNumber(rules.length)} rules
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search" className="text-sm font-semibold text-gray-700 mb-2 block">
                Search Rules
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-11 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/80 transition-all"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="min-w-[180px]">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700 mb-2 block">
                Category
              </Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white/80 hover:bg-white transition-all">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">All Categories</span>
                      <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        {formatNumber(rules.length)}
                      </span>
                    </div>
                  </SelectItem>
                  {Object.entries(RULE_CATEGORIES).map(([key, config]) => {
                    const count = rules.filter(rule => rule.category === key).length;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <config.icon className={`h-4 w-4 ${config.colors.iconColor}`} />
                            <span className="font-medium">{config.label}</span>
                          </div>
                          <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-semibold ${config.colors.bg} ${config.colors.text}`}>
                            {formatNumber(count)}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[140px]">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 mb-2 block">
                Status
              </Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white/80 hover:bg-white transition-all">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">All Statuses</span>
                      <span className="ml-3 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                        {formatNumber(rules.length)}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Active</span>
                      </div>
                      <span className="ml-3 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        {formatNumber(rules.filter(rule => rule.active !== false).length)}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Inactive</span>
                      </div>
                      <span className="ml-3 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        {formatNumber(rules.filter(rule => rule.active === false).length)}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={loadRules}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 !text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                style={{ background: 'linear-gradient(to right, rgb(0, 114, 187), rgb(0, 94, 154))' }}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create Rule
              </Button>
            </div>
          </div>

          {/* Active Filters Display - Compact */}
          {(filters.search || filters.category !== 'all' || filters.status !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200 mt-4">
              <span className="text-sm font-semibold text-blue-700">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
                  Search: "{filters.search}"
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="ml-2 hover:text-blue-200 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                  Category: {RULE_CATEGORIES[filters.category as keyof typeof RULE_CATEGORIES]?.label}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                    className="ml-2 hover:text-emerald-200 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
                  Status: {filters.status}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    className="ml-2 hover:text-blue-200 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => setFilters({ search: '', category: 'all', status: 'all' })}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm hover:bg-red-600 transition-colors"
              >
                Clear all
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Grid */}
      <div className="space-y-6">
        {filteredRules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.category !== 'all' || filters.status !== 'all'
                  ? 'No rules match your current filters.'
                  : 'Get started by creating your first rule.'}
              </p>
              {(!filters.search && filters.category === 'all' && filters.status === 'all') && (
                <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create Your First Rule
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRules.map((rule) => {
              const categoryConfig = RULE_CATEGORIES[rule.category as keyof typeof RULE_CATEGORIES];
              const CategoryIcon = categoryConfig?.icon || Settings;
              const categoryColors = categoryConfig?.colors || {
                bg: 'bg-gray-100',
                border: 'border-gray-400',
                text: 'text-gray-800',
                light: 'bg-gray-50',
                hoverBorder: 'hover:border-gray-500',
                iconColor: 'text-gray-600'
              };
              
              const eventTypeColor = getEventTypeColor(rule.event?.type || '');
              const priorityColor = getPriorityColor(rule.priority || 1);
              const EventTypeIcon = getEventTypeIcon(rule.event?.type || '');
              
              // Extract key rule details
              const conditions = rule.conditions?.all || [];
              const eventParams = rule.event?.params || {};
              const marketCondition = conditions.find(c => c.fact === 'market');
              const markets = rule.markets || (marketCondition ? [marketCondition.value] : []);
              
              return (
                <Card 
                  key={rule.id} 
                  className={`border-2 ${categoryColors.border} ${categoryColors.hoverBorder} hover:shadow-xl transition-all duration-300 overflow-hidden bg-white`}
                >
                  {/* Enhanced Header with Category Color Coding */}
                  <CardHeader className={`${categoryColors.bg} py-2`}>{/* Reduced padding from py-3 to py-2 */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <CategoryIcon className={`h-5 w-5 ${categoryColors.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className={`text-lg font-bold ${categoryColors.text} truncate`}>
                            {rule.name}
                          </CardTitle>
                          <CardDescription className={`text-sm ${categoryColors.text} opacity-70 truncate`}>
                            {categoryConfig?.label || rule.category}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StatusBadge 
                          status={rule.active !== false ? 'active' : 'inactive'}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 space-y-3">{/* Reduced padding from p-4 to p-3 and spacing from space-y-4 to space-y-3 */}
                    {/* Key Details Section */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Priority */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Priority</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                          {rule.priority || 1} - {priorityColor.label}
                        </span>
                      </div>
                      
                      {/* Conditions Count */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Conditions</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                          {conditions.length} rule{conditions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Event Type */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Event Type</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${eventTypeColor.bg} ${eventTypeColor.text} border ${eventTypeColor.border} gap-1.5`}>
                        <EventTypeIcon className="h-3 w-3" />
                        {rule.event?.type || 'Unknown'}
                      </span>
                    </div>
                    
                    {/* Markets */}
                    {markets.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Markets</p>
                        <div className="flex flex-wrap gap-1">
                          {markets.map((market) => {
                            const marketColor = getMarketColor(market);
                            return (
                              <span 
                                key={market} 
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${marketColor.bg} ${marketColor.text} border ${marketColor.border}`}
                              >
                                {market}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rule Conditions - User Friendly Display */}
                    {conditions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">When</p>{/* Reduced mb from 2 to 1 */}
                        <div className="space-y-1">
                          {conditions.slice(0, 2).map((condition, idx) => {{/* Reduced from 3 to 2 conditions to save space */}
                            // Format fact name to be more readable
                            const factDisplay = condition.fact
                              ?.replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str: string) => str.toUpperCase())
                              .trim()
                              .replace(/([a-z])([A-Z])/g, '$1 $2')
                              .toLowerCase()
                              .replace(/^./, (str: string) => str.toUpperCase()) || 'Unknown';

                            // Get human-readable operator
                            const operatorDisplay = OPERATORS.find(op => op.value === condition.operator)?.label || condition.operator;
                            
                            // Format value for better readability
                            let valueDisplay = '';
                            if (Array.isArray(condition.value)) {
                              valueDisplay = condition.value.join(', ');
                            } else if (typeof condition.value === 'object' && condition.value !== null) {
                              valueDisplay = JSON.stringify(condition.value);
                            } else {
                              valueDisplay = String(condition.value);
                            }

                            // Create a natural language sentence
                            const conditionText = `${factDisplay} ${operatorDisplay} ${valueDisplay}`;
                            
                            return (
                              <div key={idx} className="bg-blue-50 rounded-md p-1.5 text-xs border border-blue-200">{/* Reduced padding from p-2 to p-1.5 */}
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="text-blue-800 font-medium">{conditionText}</span>
                                </div>
                              </div>
                            );
                          })}
                          {conditions.length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1 bg-gray-50 rounded-md border border-gray-200">
                              +{conditions.length - 2} more condition{conditions.length - 2 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">{/* Reduced pt from 3 to 2 */}
                      <Button
                        onClick={() => setEditingRule(rule)}
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1 text-blue-700 hover:text-white hover:bg-blue-600 hover:border-blue-600 border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => setDeletingRule(rule)}
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Rule Form Dialog */}
      <RuleFormDialog
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateRule}
        initialRule={undefined}
      />

      {/* Edit Rule Dialog */}
      {editingRule && (
        <RuleFormDialog
          isOpen={!!editingRule}
          onClose={() => setEditingRule(null)}
          onSubmit={(category, ruleData) => handleUpdateRule(editingRule.id!, ruleData as Rule)}
          initialRule={editingRule}
          title="Edit Rule"
        />
      )}

      {/* Delete Rule Dialog */}
      {deletingRule && (
        <DeleteRuleDialog
          rule={deletingRule}
          onDelete={() => handleDeleteRule(deletingRule.id!)}
          onCancel={() => setDeletingRule(null)}
        />
      )}
    </div>
  );
};

export default RuleManager;
