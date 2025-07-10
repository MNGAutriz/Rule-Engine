import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { StatusBadge, StatsGrid } from '@/components/display';
import { RuleFormDialog, DeleteRuleDialog } from '@/components/rules';
import Toast from '@/components/common/Toast';
import { rulesManagementApi, type Rule } from '@/services/api';
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
  Zap
} from 'lucide-react';

// Rule category constants
const RULE_CATEGORIES = {
  transaction: { label: 'Transaction Rules', icon: Zap, color: 'bg-blue-500' },
  consumer: { label: 'Consumer Attribute Rules', icon: Target, color: 'bg-green-500' },
  product: { label: 'Product Multiplier Rules', icon: Tag, color: 'bg-purple-500' },
  basket: { label: 'Basket Threshold Rules', icon: Activity, color: 'bg-orange-500' }
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

  // Calculate stats with proper gradient colors
  const stats = [
    {
      title: 'Total Rules',
      value: rules.length.toString(),
      icon: Settings,
      description: 'All rules in system',
      gradientColors: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBgColor: 'blue'
    },
    {
      title: 'Active Rules',
      value: rules.filter(rule => rule.active !== false).length.toString(),
      icon: CheckCircle,
      description: 'Currently active rules',
      gradientColors: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBgColor: 'emerald'
    },
    {
      title: 'Categories',
      value: Object.keys(RULE_CATEGORIES).length.toString(),
      icon: Tag,
      description: 'Rule categories',
      gradientColors: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBgColor: 'purple'
    },
    {
      title: 'Inactive Rules',
      value: rules.filter(rule => rule.active === false).length.toString(),
      icon: XCircle,
      description: 'Inactive rules',
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
      <div className="mb-6">
        <StatsGrid stats={stats} />
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search Rules</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[150px]">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(RULE_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[120px]">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={loadRules}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Rule
              </Button>
            </div>
          </div>
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
              
              return (
                <Card key={rule.id} className="border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader className="bg-gray-50 pb-3 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${categoryConfig?.color || 'bg-gray-500'}`}>
                          <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1">
                            {rule.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <StatusBadge 
                              status={rule.active !== false ? 'active' : 'inactive'}
                            />
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                              Priority: {rule.priority || 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Category:</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {categoryConfig?.label || rule.category}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Event Type:</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                          {rule.event?.type || 'Unknown'}
                        </span>
                      </div>
                      
                      {rule.markets && rule.markets.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Markets:</p>
                          <div className="flex flex-wrap gap-1">
                            {rule.markets.map((market) => (
                              <span key={market} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                {market}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          onClick={() => setEditingRule(rule)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setDeletingRule(rule)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
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
        initialRule={editingRule}
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
