import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { rulesApi } from '@/services/api';
import type { Rule } from '@/services/api';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface RuleFormData {
  name: string;
  description: string;
  eventType: string;
  priority: number;
  active: boolean;
  markets: string[];
  channels: string[];
  productLines: string[];
  conditions: Record<string, any>;
  actions: Record<string, any>;
}

interface RuleManagerProps {
  rules: Rule[];
  category: string;
  onRulesUpdate: () => void;
}

const EVENT_TYPES = [
  'PURCHASE',
  'INTERACTION_REGISTRY_POINT',
  'ORDER_BASE_POINT',
  'ORDER_MULTIPLE_POINT_LIMIT',
  'FLEXIBLE_CAMPAIGN_BONUS',
  'FIRST_PURCHASE_BIRTH_MONTH_BONUS',
  'FLEXIBLE_VIP_MULTIPLIER',
  'FLEXIBLE_PRODUCT_MULTIPLIER',
  'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER',
  'FLEXIBLE_BASKET_AMOUNT',
  'CONSULTATION_BONUS',
  'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR',
  'INTERACTION_ADJUST_POINT_BY_MANAGER'
];

const MARKETS = ['JP', 'HK', 'TW'];
const CHANNELS = ['STORE', 'ONLINE', 'MOBILE'];
const PRODUCT_LINES = ['PREMIUM_SERIES', 'STANDARD_SERIES', 'LUXURY_SERIES'];

const RuleManager: React.FC<RuleManagerProps> = ({ rules, category, onRulesUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>({
    name: '',
    description: '',
    eventType: '',
    priority: 1,
    active: true,
    markets: [],
    channels: [],
    productLines: [],
    conditions: {},
    actions: {}
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      eventType: '',
      priority: 1,
      active: true,
      markets: [],
      channels: [],
      productLines: [],
      conditions: {},
      actions: {}
    });
    setEditingRule(null);
  };

  const handleOpenDialog = (rule?: Rule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.event.params.description || '',
        eventType: rule.event.type,
        priority: rule.priority,
        active: rule.active ?? true,
        markets: rule.markets || [],
        channels: rule.channels || [],
        productLines: rule.productLines || [],
        conditions: rule.conditions || {},
        actions: rule.actions || {}
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof RuleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: 'markets' | 'channels' | 'productLines', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const ruleData = {
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        active: formData.active,
        event: {
          type: formData.eventType,
          params: {
            description: formData.description,
            ...formData.conditions
          }
        },
        conditions: formData.conditions,
        actions: formData.actions,
        markets: formData.markets,
        channels: formData.channels,
        productLines: formData.productLines
      };

      if (editingRule && editingRule.id) {
        await rulesApi.updateRule(editingRule.id, ruleData);
      } else {
        await rulesApi.createRule(category, ruleData);
      }

      onRulesUpdate();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Failed to save rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId?: string) => {
    if (!ruleId) return;
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      setLoading(true);
      await rulesApi.deleteRule(ruleId);
      onRulesUpdate();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize">{category} Rules</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Rule' : 'Create New Rule'}
              </DialogTitle>
              <DialogDescription>
                {editingRule 
                  ? 'Modify the rule details below.'
                  : 'Fill in the details to create a new rule.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => handleInputChange('eventType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter rule description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="active">Status</Label>
                    <Select
                      value={formData.active.toString()}
                      onValueChange={(value) => handleInputChange('active', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Target Settings */}
              <div className="grid gap-4">
                <h4 className="font-medium text-sm">Target Settings</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Markets</Label>
                    <div className="space-y-2">
                      {MARKETS.map(market => (
                        <label key={market} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.markets.includes(market)}
                            onChange={() => handleArrayFieldChange('markets', market)}
                            className="rounded"
                          />
                          <span className="text-sm">{market}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Channels</Label>
                    <div className="space-y-2">
                      {CHANNELS.map(channel => (
                        <label key={channel} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.channels.includes(channel)}
                            onChange={() => handleArrayFieldChange('channels', channel)}
                            className="rounded"
                          />
                          <span className="text-sm">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Lines</Label>
                    <div className="space-y-2">
                      {PRODUCT_LINES.map(line => (
                        <label key={line} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.productLines.includes(line)}
                            onChange={() => handleArrayFieldChange('productLines', line)}
                            className="rounded"
                          />
                          <span className="text-sm">{line.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule Logic */}
              <div className="grid gap-4">
                <h4 className="font-medium text-sm">Rule Logic</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conditions">Conditions (JSON)</Label>
                    <Textarea
                      id="conditions"
                      value={JSON.stringify(formData.conditions, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleInputChange('conditions', parsed);
                        } catch (error) {
                          // Invalid JSON, keep the text as is for user to fix
                        }
                      }}
                      placeholder='{"minAmount": 1000, "vipTiers": ["VIP1", "VIP2"]}'
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actions">Actions (JSON)</Label>
                    <Textarea
                      id="actions"
                      value={JSON.stringify(formData.actions, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleInputChange('actions', parsed);
                        } catch (error) {
                          // Invalid JSON, keep the text as is for user to fix
                        }
                      }}
                      placeholder='{"pointsMultiplier": 2, "bonusPoints": 100}'
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No rules found in this category.</p>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule, index) => (
            <Card key={rule.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <CardDescription>
                      Event: {rule.event.type} | Priority: {rule.priority} | 
                      Status: {rule.active ?? true ? 'Active' : 'Inactive'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {rule.event.params?.description || 'No description available'}
                </p>
                
                {rule.markets && rule.markets.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium">Markets: </span>
                    <span className="text-xs text-muted-foreground">
                      {rule.markets.join(', ')}
                    </span>
                  </div>
                )}
                
                {rule.channels && rule.channels.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium">Channels: </span>
                    <span className="text-xs text-muted-foreground">
                      {rule.channels.join(', ')}
                    </span>
                  </div>
                )}
                
                {rule.productLines && rule.productLines.length > 0 && (
                  <div>
                    <span className="text-xs font-medium">Product Lines: </span>
                    <span className="text-xs text-muted-foreground">
                      {rule.productLines.join(', ')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Force module reload
export default RuleManager;
