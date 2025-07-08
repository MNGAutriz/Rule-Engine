import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Calendar, Globe, Target, Plus, AlertCircle } from 'lucide-react';

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

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSave: (campaign: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
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

      setFormData({
        campaignCode: campaign.campaignCode || '',
        name: campaign.name || '',
        market: campaign.market || 'HK',
        channel: campaign.channel || 'ALL',
        startDate: formatDateForInput(campaign.startDate),
        endDate: formatDateForInput(campaign.endDate),
        description: campaign.description || '',
        ruleIds: campaign.ruleIds || []
      });
    }
  }, [campaign]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.campaignCode.trim()) {
      newErrors.campaignCode = 'Campaign code is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.campaignCode)) {
      newErrors.campaignCode = 'Campaign code must contain only uppercase letters, numbers, and underscores';
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
      ruleIds: prev.ruleIds.map((rule, i) => i === index ? value : rule)
    }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Create New Campaign
            </h2>
            <p className="text-blue-100 text-sm">
              Configure your new loyalty campaign
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Modal Content */}
      <div className="overflow-y-auto max-h-[calc(90vh-80px)] bg-white">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                Basic Information
              </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="campaignCode" className="text-sm font-semibold text-gray-800">
                      Campaign Code *
                    </Label>
                    <Input
                      id="campaignCode"
                      value={formData.campaignCode}
                      onChange={(e) => handleInputChange('campaignCode', e.target.value.toUpperCase())}
                      placeholder="CAMP2025_EXAMPLE"
                      className={`h-12 rounded-xl border-2 ${errors.campaignCode ? 'border-red-500 focus:border-red-600' : 'border-gray-400 focus:border-blue-500'} transition-colors bg-white bg-opacity-70 backdrop-blur-sm`}
                    />
                    {errors.campaignCode && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        {errors.campaignCode}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-800">
                      Campaign Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter campaign name"
                      className={`h-12 rounded-xl border-2 ${errors.name ? 'border-red-500 focus:border-red-600' : 'border-gray-400 focus:border-blue-500'} transition-colors bg-white bg-opacity-70 backdrop-blur-sm`}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="market" className="text-sm font-semibold text-gray-800">
                      Market
                    </Label>
                    <Select value={formData.market} onValueChange={(value) => handleInputChange('market', value)}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-400 focus:border-blue-500 bg-white bg-opacity-70 backdrop-blur-sm">
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-2">
                        <SelectItem value="HK">Hong Kong</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="TW">Taiwan</SelectItem>
                        <SelectItem value="ALL">All Markets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="channel" className="text-sm font-semibold text-gray-800">
                      Channel
                    </Label>
                    <Select value={formData.channel} onValueChange={(value) => handleInputChange('channel', value)}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-400 focus:border-blue-500 bg-white bg-opacity-70 backdrop-blur-sm">
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-2">
                        <SelectItem value="ALL">All Channels</SelectItem>
                        <SelectItem value="LINE">LINE</SelectItem>
                        <SelectItem value="COUNTER">Counter</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="MOBILE">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Campaign Timeline Section */}
              <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-30 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl shadow-md border border-gray-200">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  Campaign Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-gray-800">
                      Start Date & Time *
                    </Label>
                    <p className="text-xs text-gray-600 mb-2">When the campaign begins</p>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`h-12 rounded-xl border-2 ${errors.startDate ? 'border-red-500 focus:border-red-600' : 'border-gray-400 focus:border-green-500'} transition-colors bg-white bg-opacity-70 backdrop-blur-sm`}
                    />
                    {errors.startDate && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        {errors.startDate}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-gray-800">
                      End Date & Time *
                    </Label>
                    <p className="text-xs text-gray-600 mb-2">When the campaign expires</p>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={`h-12 rounded-xl border-2 ${errors.endDate ? 'border-red-500 focus:border-red-600' : 'border-gray-400 focus:border-green-500'} transition-colors bg-white bg-opacity-70 backdrop-blur-sm`}
                    />
                    {errors.endDate && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        {errors.endDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rule Configuration Section */}
              <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-30 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl shadow-md border border-gray-200">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  Rule Configuration
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-800">
                      Associated Rules
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRuleId}
                      className="h-10 px-4 rounded-xl border-2 border-purple-400 hover:border-purple-600 hover:bg-purple-50 transition-colors text-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  
                  {formData.ruleIds.map((ruleId, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        value={ruleId}
                        onChange={(e) => updateRuleId(index, e.target.value)}
                        placeholder="Enter rule ID"
                        className="flex-1 h-12 rounded-2xl border-2 border-gray-700 focus:border-gray-900 bg-white bg-opacity-50 backdrop-blur-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRuleId(index)}
                        className="h-12 w-12 p-0 rounded-2xl border-2 border-red-600 text-red-600 hover:border-red-700 hover:bg-red-50 hover:bg-opacity-50 transition-colors backdrop-blur-sm"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  
                  {formData.ruleIds.length === 0 && (
                    <div className="text-sm text-gray-600 text-center py-6 border-2 border-dashed border-gray-600 border-opacity-40 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm">
                      No rules configured. Click "Add Rule" to add associated rules.
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-30 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl shadow-md border border-gray-200">
                    <Globe className="h-5 w-5 text-orange-600" />
                  </div>
                  Additional Details
                </h3>
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-800">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Campaign description..."
                      className="w-full p-4 border-2 border-gray-400 rounded-xl resize-none h-24 focus:border-orange-500 focus:ring-0 transition-colors bg-white bg-opacity-70 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-white border-opacity-30">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={loading}
                  className="h-12 px-8 rounded-xl border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default CampaignForm;
