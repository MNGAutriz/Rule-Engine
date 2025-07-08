import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { StatusBadge, StatsGrid } from '@/components/display';
import { CampaignForm, DeleteCampaignDialog, EditCampaignDialog } from '@/components/campaigns';
import Toast from '@/components/common/Toast';
import { campaignsApi } from '@/services/api';
import { 
  Calendar, 
  Filter, 
  RefreshCw, 
  Search, 
  MapPin, 
  Globe, 
  Target, 
  TrendingUp, 
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  Zap,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';

interface Campaign {
  campaignCode: string;
  name: string;
  market: string;
  channel: string;
  startDate: string;
  endDate: string;
  ruleIds: string[];
  description?: string;
  isActive?: boolean;
  status?: string;
}

const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filters, setFilters] = useState({
    market: 'all',
    channel: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async (customFilters?: typeof filters) => {
    try {
      setLoading(true);
      const filtersToUse = customFilters || filters;
      
      // Remove empty filters and "all" values
      const cleanFilters = Object.fromEntries(
        Object.entries(filtersToUse).filter(([_, value]) => value !== '' && value !== 'all')
      );
      
      // Use getAllCampaigns to ensure we get fresh data, then filter on frontend if needed
      let campaignData;
      if (Object.keys(cleanFilters).length > 0) {
        campaignData = await campaignsApi.getActiveCampaigns(cleanFilters);
      } else {
        campaignData = await campaignsApi.getAllCampaigns();
      }
      
      // Ensure we always set an array
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaigns([]);
      showToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowCreateForm(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    console.log('CampaignManager: Setting campaign for edit:', campaign);
    console.log('CampaignManager: Campaign market field:', campaign.market);
    setEditingCampaign(campaign);
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setDeletingCampaign(campaign);
  };

  const handleSaveNewCampaign = async (campaignData: any) => {
    try {
      await campaignsApi.createCampaign(campaignData);
      showToast('Campaign created successfully', 'success');
      setShowCreateForm(false);
      loadCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      showToast(error.response?.data?.message || 'Failed to create campaign', 'error');
    }
  };

  const handleSaveEditedCampaign = async (campaignData: any) => {
    if (!editingCampaign) return;
    
    try {
      const updatedCampaign = await campaignsApi.updateCampaign(editingCampaign.campaignCode, campaignData);
      showToast('Campaign updated successfully', 'success');
      setEditingCampaign(null);
      
      // Refresh the campaign list to get the latest data
      await loadCampaigns();
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      showToast(error.response?.data?.message || 'Failed to update campaign', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;
    
    try {
      await campaignsApi.deleteCampaign(deletingCampaign.campaignCode);
      showToast('Campaign deleted successfully', 'success');
      setDeletingCampaign(null);
      loadCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      showToast(error.response?.data?.message || 'Failed to delete campaign', 'error');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    loadCampaigns(filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      market: 'all',
      channel: 'all',
      startDate: '',
      endDate: ''
    };
    setFilters(emptyFilters);
    loadCampaigns(emptyFilters);
  };

  const getStatusText = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Ended';
    return 'Active';
  };

  const getMarketColor = (market: string) => {
    const colors = {
      'HK': { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', light: 'bg-red-50', hoverBorder: 'hover:border-red-500' },
      'JP': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800', light: 'bg-purple-50', hoverBorder: 'hover:border-purple-500' },
      'TW': { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', light: 'bg-green-50', hoverBorder: 'hover:border-green-500' },
      'ALL': { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-800', light: 'bg-gray-50', hoverBorder: 'hover:border-gray-500' }
    };
    return colors[market] || colors['ALL'];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': { bg: 'bg-green-600', text: 'text-green-800', light: 'bg-green-100' },
      'Upcoming': { bg: 'bg-blue-600', text: 'text-blue-800', light: 'bg-blue-100' },
      'Ended': { bg: 'bg-gray-500', text: 'text-gray-800', light: 'bg-gray-100' }
    };
    return colors[status] || colors['Ended'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 mb-4 shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Campaign Manager
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Monitor and manage loyalty campaigns across global markets
          </p>
          
          {/* Create Campaign Button */}
          <Button
            onClick={handleCreateCampaign}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 text-base font-semibold mx-auto"
          >
            <Plus className="h-5 w-5" />
            Create New Campaign
          </Button>
        </div>

        {/* Compact Stats Cards */}
        <div className="mb-8">
          <StatsGrid 
            stats={[
              {
                title: "Active Campaigns",
                value: (Array.isArray(campaigns) ? campaigns.filter(c => getStatusText(c) === 'Active').length : 0).toString(),
                description: "Currently running",
                icon: PlayCircle,
                gradientColors: "bg-gradient-to-br from-emerald-500 to-emerald-600",
                iconBgColor: "emerald",
                descriptionIcon: Activity
              },
              {
                title: "Total Campaigns",
                value: (Array.isArray(campaigns) ? campaigns.length : 0).toString(),
                description: "All campaigns",
                icon: Target,
                gradientColors: "bg-gradient-to-br from-blue-500 to-blue-600", 
                iconBgColor: "blue",
                descriptionIcon: CheckCircle
              },
              {
                title: "Success Rate", 
                value: "98.5%",
                description: "Performance",
                icon: TrendingUp,
                gradientColors: "bg-gradient-to-br from-purple-500 to-purple-600",
                iconBgColor: "purple", 
                descriptionIcon: TrendingUp
              },
              {
                title: "Global Markets",
                value: "3",
                description: "Coverage",
                icon: Globe,
                gradientColors: "bg-gradient-to-br from-orange-500 to-orange-600",
                iconBgColor: "orange",
                descriptionIcon: Globe
              }
            ]}
            columns="4"
          />
        </div>

        {/* Compact Filters */}
        <div className="mb-8">
          <Card className="border border-gray-200 shadow-md bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center text-lg">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription className="text-slate-200 text-sm">
                Filter campaigns by market, channel, and date range
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Compact Filter Grid */}
              <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
                {/* Market Filter */}
                <div className="space-y-2">
                  <Label htmlFor="market" className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                    Market
                  </Label>
                  <Select
                    value={filters.market}
                    onValueChange={(value) => handleFilterChange('market', value)}
                  >
                    <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Markets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌍 All Markets</SelectItem>
                      <SelectItem value="HK">🇭🇰 Hong Kong</SelectItem>
                      <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                      <SelectItem value="TW">🇹🇼 Taiwan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Channel Filter */}
                <div className="space-y-2">
                  <Label htmlFor="channel" className="text-sm font-medium text-gray-700 flex items-center">
                    <Globe className="h-3 w-3 mr-1 text-blue-600" />
                    Channel
                  </Label>
                  <Select
                    value={filters.channel}
                    onValueChange={(value) => handleFilterChange('channel', value)}
                  >
                    <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">📱 All Channels</SelectItem>
                      <SelectItem value="LINE">💬 LINE</SelectItem>
                      <SelectItem value="COUNTER">🏪 Counter</SelectItem>
                      <SelectItem value="ALL">🌐 All Channels</SelectItem>
                      <SelectItem value="STORE">🏬 Store</SelectItem>
                      <SelectItem value="ONLINE">💻 Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* End Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 justify-center">
                <Button
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 font-medium"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 font-medium"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <span className="text-lg text-gray-600 font-medium">Loading campaigns...</span>
              </div>
            </div>
          ) : (Array.isArray(campaigns) && campaigns.length === 0) ? (
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-16 text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">No Campaigns Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or create a new campaign to get started.
                </p>
                <Button
                  onClick={handleCreateCampaign}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.isArray(campaigns) && campaigns.map((campaign) => {
                const marketColor = getMarketColor(campaign.market);
                const statusColor = getStatusColor(getStatusText(campaign));
                const status = getStatusText(campaign);
                
                return (
                  <Card key={campaign.campaignCode} className={`border ${marketColor.border} hover:shadow-lg transition-all duration-200 overflow-hidden bg-white h-fit`}>
                    {/* Compact Header */}
                    <CardHeader className={`${marketColor.bg} py-3`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`p-1.5 bg-white rounded-lg shadow-sm`}>
                            <Calendar className={`h-4 w-4 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className={`text-base font-bold ${marketColor.text} truncate`}>
                              {campaign.name}
                            </CardTitle>
                            <CardDescription className={`text-xs ${marketColor.text} opacity-70 truncate`}>
                              {campaign.campaignCode}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor.light} ${statusColor.text}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 space-y-3">
                      {/* Market and Channel Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Market
                          </p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-100 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-700`}>
                            {campaign.market}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            Channel
                          </p>
                          <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            {campaign.channel}
                          </div>
                        </div>
                      </div>
                      
                      {/* Compact Date Range */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-center">
                            <p className="text-gray-500 mb-1">Start</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {new Date(campaign.startDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(campaign.startDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex-1 flex justify-center">
                            <div className="h-px w-6 bg-blue-300 mt-3"></div>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 mb-1">End</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {new Date(campaign.endDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(campaign.endDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                      </div>
                      
                      {/* Campaign Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 py-2 border-t border-gray-100">
                        <span>Rules: {campaign.ruleIds?.length || 0}</span>
                      </div>

                      {/* Status display */}
                      {campaign.status && (
                        <div className="flex items-center justify-center mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status).light} ${getStatusColor(campaign.status).text}`}>
                            {campaign.status}
                          </span>
                        </div>
                      )}

                      {/* Compact Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleEditCampaign(campaign)}
                          size="sm"
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteCampaign(campaign)}
                          size="sm"
                          variant="destructive"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="text-xs">Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Form Modal with subtle blur overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CampaignForm
            campaign={null}
            onSave={handleSaveNewCampaign}
            onCancel={() => setShowCreateForm(false)}
            loading={loading}
          />
        </div>
      )}

      {/* Edit Campaign Dialog with subtle blur overlay */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <EditCampaignDialog
            campaign={editingCampaign}
            onSave={handleSaveEditedCampaign}
            onCancel={() => setEditingCampaign(null)}
            loading={loading}
          />
        </div>
      )}

      {/* Delete Campaign Dialog with subtle blur overlay */}
      {deletingCampaign && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <DeleteCampaignDialog
            campaign={deletingCampaign}
            onDelete={handleConfirmDelete}
            onCancel={() => setDeletingCampaign(null)}
            loading={loading}
          />
        </div>
      )}

      {/* Enhanced Toast Notifications */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`
            px-6 py-4 rounded-xl shadow-lg border backdrop-blur-sm
            ${toast.type === 'success' 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' 
              : 'bg-red-50/90 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">{toast.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToast(null)}
                className="h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;