import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Zap
} from 'lucide-react';

interface Campaign {
  campaignCode: string;
  name: string;
  market: string;
  channel: string;
  brand: string;
  startDate: string;
  endDate: string;
  ruleIds: string[];
}

const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    market: '',
    channel: '',
    startDate: '',
    endDate: '',
    productLine: ''
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async (customFilters?: typeof filters) => {
    try {
      setLoading(true);
      const filtersToUse = customFilters || filters;
      
      // Remove empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filtersToUse).filter(([_, value]) => value !== '')
      );
      
      const campaignData = await campaignsApi.getActiveCampaigns(cleanFilters);
      setCampaigns(campaignData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
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
      market: '',
      channel: '',
      startDate: '',
      endDate: '',
      productLine: ''
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header with P&G Light Blue Theme */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-700 mb-4 shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700 tracking-tight">
            Campaign Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor and manage active loyalty campaigns across global markets
          </p>
        </div>

        {/* Stats Cards with Different Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Active Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => getStatusText(c) === 'Active').length}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Total Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <Target className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Markets</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Globe className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Performance</p>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 shadow-lg bg-white">
          <CardHeader className="bg-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Filter className="mr-3 h-6 w-6" />
              Campaign Filters
            </CardTitle>
            <CardDescription className="text-blue-100">
              Filter campaigns by market, channel, date range, and more
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="market" className="text-sm font-semibold text-gray-700">Market</Label>
                <Select
                  value={filters.market}
                  onValueChange={(value) => handleFilterChange('market', value)}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All Markets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Markets</SelectItem>
                    <SelectItem value="HK">Hong Kong</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="TW">Taiwan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel" className="text-sm font-semibold text-gray-700">Channel</Label>
                <Select
                  value={filters.channel}
                  onValueChange={(value) => handleFilterChange('channel', value)}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All Channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Channels</SelectItem>
                    <SelectItem value="STORE">Store</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productLine" className="text-sm font-semibold text-gray-700">Product Line</Label>
                <Select
                  value={filters.productLine}
                  onValueChange={(value) => handleFilterChange('productLine', value)}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    <SelectItem value="PREMIUM_SERIES">Premium Series</SelectItem>
                    <SelectItem value="STANDARD_SERIES">Standard Series</SelectItem>
                    <SelectItem value="LUXURY_SERIES">Luxury Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={applyFilters}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear All
              </Button>
              <Button
                onClick={() => loadCampaigns()}
                variant="outline"
                className="border-cyan-300 text-cyan-600 hover:bg-cyan-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-lg text-gray-600">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Campaigns Found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later for new campaigns.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.campaignCode} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 overflow-hidden">
                  <CardHeader className={`text-white ${
                    getStatusText(campaign) === 'Active' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    getStatusText(campaign) === 'Upcoming' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                    'bg-gradient-to-r from-gray-500 to-slate-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold truncate">{campaign.name}</CardTitle>
                        <CardDescription className="text-sm opacity-90">
                          {campaign.campaignCode}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusText(campaign) === 'Active' && <CheckCircle className="h-5 w-5" />}
                        {getStatusText(campaign) === 'Upcoming' && <Clock className="h-5 w-5" />}
                        {getStatusText(campaign) === 'Ended' && <XCircle className="h-5 w-5" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Market</p>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-gray-800">{campaign.market}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Channel</p>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4 text-cyan-500" />
                          <span className="font-semibold text-gray-800">{campaign.channel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaign Period</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusText(campaign) === 'Active' ? 'bg-green-100 text-green-800' :
                        getStatusText(campaign) === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(campaign)}
                      </span>
                    </div>

                    {campaign.ruleIds && campaign.ruleIds.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Associated Rules</p>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {campaign.ruleIds.length} rule{campaign.ruleIds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;