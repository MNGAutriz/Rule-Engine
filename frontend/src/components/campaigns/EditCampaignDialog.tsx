import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, X, Save, Calendar, AlertCircle, Plus } from 'lucide-react';

interface Campaign {
  campaignCode: string;
  name: string;
  market: string;
  channel: string;
  startDate: string;
  endDate: string;
  ruleIds: string[];
  description?: string;
}

interface EditCampaignDialogProps {
  campaign: Campaign;
  onSave: (updatedCampaign: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const EditCampaignDialog: React.FC<EditCampaignDialogProps> = ({
  campaign,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    campaignCode: '',
    name: '',
    market: 'HK',
    channel: 'ALL',
    startDate: '',
    endDate: '',
    description: '',
    ruleIds: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campaign) {
      // Format dates for datetime-local input
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
      };

      const newFormData = {
        campaignCode: campaign.campaignCode || '',
        name: campaign.name || '',
        market: campaign.market || 'HK',
        channel: campaign.channel || 'ALL',
        startDate: formatDateForInput(campaign.startDate),
        endDate: formatDateForInput(campaign.endDate),
        description: campaign.description || '',
        ruleIds: campaign.ruleIds || []
      };
      
      setFormData(newFormData);
    }
  }, [campaign]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.campaignCode.trim()) {
      newErrors.campaignCode = 'Campaign code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert datetime-local to ISO string
    const submitData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      ruleIds: formData.ruleIds.filter(id => id.trim() !== '')
    };

    onSave(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addRuleId = () => {
    setFormData(prev => ({
      ...prev,
      ruleIds: [...prev.ruleIds, '']
    }));
  };

  const removeRuleId = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ruleIds: prev.ruleIds.filter((_, i) => i !== index)
    }));
  };

  const updateRuleId = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ruleIds: prev.ruleIds.map((id, i) => (i === index ? value : id))
    }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <Edit className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Edit Campaign</h2>
            <p className="text-yellow-100 text-sm">Update campaign details</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Modal Content */}
      <div className="p-6 bg-white max-h-[calc(90vh-80px)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Overview */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">Campaign Overview</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaignCode" className="text-sm font-medium text-gray-700">
                  Campaign Code *
                </Label>
                <Input
                  id="campaignCode"
                  type="text"
                  value={formData.campaignCode}
                  onChange={(e) => handleInputChange('campaignCode', e.target.value)}
                  className={`mt-1 ${errors.campaignCode ? 'border-red-500' : ''}`}
                  placeholder="e.g., SUMMER2024_HK"
                  disabled={loading}
                />
                {errors.campaignCode && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.campaignCode}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Campaign Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Summer Loyalty Campaign"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Market & Channel Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Market & Channel Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="market" className="text-sm font-medium text-gray-700">
                  Market *
                </Label>
                <Select
                  key={`market-${campaign.campaignCode}-${campaign.market}`}
                  value={formData.market}
                  onValueChange={(value) => handleInputChange('market', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HK">🇭🇰 Hong Kong</SelectItem>
                    <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                    <SelectItem value="TW">🇹🇼 Taiwan</SelectItem>
                    <SelectItem value="ALL">🌍 All Markets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="channel" className="text-sm font-medium text-gray-700">
                  Channel *
                </Label>
                <Select
                  key={`channel-${campaign.campaignCode}-${campaign.channel}`}
                  value={formData.channel}
                  onValueChange={(value) => handleInputChange('channel', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">🌐 All Channels</SelectItem>
                    <SelectItem value="LINE">💬 LINE</SelectItem>
                    <SelectItem value="COUNTER">🏪 Counter</SelectItem>
                    <SelectItem value="STORE">🏬 Store</SelectItem>
                    <SelectItem value="ONLINE">💻 Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Campaign Duration */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-3">Campaign Duration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Start Date & Time *
                </Label>
                <p className="text-xs text-gray-500 mb-1">When the campaign begins</p>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`mt-1 rounded-lg ${errors.startDate ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  End Date & Time *
                </Label>
                <p className="text-xs text-gray-500 mb-1">When the campaign expires</p>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`mt-1 rounded-lg ${errors.endDate ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-3">Additional Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={2}
                  placeholder="Brief description of the campaign..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Rule Configuration */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-yellow-900">Rule Configuration</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRuleId}
                disabled={loading}
                className="h-8 px-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>
            
            {formData.ruleIds.map((ruleId, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  value={ruleId}
                  onChange={(e) => updateRuleId(index, e.target.value)}
                  placeholder="Enter rule ID"
                  className="flex-1 h-9"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRuleId(index)}
                  disabled={loading}
                  className="h-9 w-9 p-0 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {formData.ruleIds.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                No rules configured. Click "Add Rule" to add associated rules.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onCancel}
              disabled={loading}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignDialog;
