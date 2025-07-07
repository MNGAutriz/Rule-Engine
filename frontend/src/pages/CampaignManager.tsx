import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { StatusBadge, StatsGrid } from '@/components/display';
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
      
      const campaignData = await campaignsApi.getActiveCampaigns(cleanFilters);
      // Ensure we always set an array
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8 bg-white rounded-lg shadow-sm mx-4 my-6">
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

        {/* Stats Cards */}
        <StatsGrid 
          stats={[
            {
              title: "Active Campaigns",
              value: (Array.isArray(campaigns) ? campaigns.filter(c => getStatusText(c) === 'Active').length : 0).toString(),
              description: "Currently running",
              icon: PlayCircle,
              gradientColors: "bg-gradient-to-br from-orange-500 to-orange-600",
              iconBgColor: "orange",
              descriptionIcon: Activity
            },
            {
              title: "Total Campaigns",
              value: (Array.isArray(campaigns) ? campaigns.length : 0).toString(),
              description: "All time campaigns",
              icon: Target,
              gradientColors: "bg-gradient-to-br from-emerald-500 to-emerald-600", 
              iconBgColor: "emerald",
              descriptionIcon: CheckCircle
            },
            {
              title: "Performance", 
              value: "98.5%",
              description: "Success rate",
              icon: TrendingUp,
              gradientColors: "bg-gradient-to-br from-purple-500 to-purple-600",
              iconBgColor: "purple", 
              descriptionIcon: TrendingUp
            },
            {
              title: "Markets",
              value: "3",
              description: "Global coverage",
              icon: Globe,
              gradientColors: "bg-gradient-to-br from-red-500 to-red-600",
              iconBgColor: "red",
              descriptionIcon: Globe
            }
          ]}
          columns="4"
        />

        {/* Filters */}
        <Card className="border border-gray-200 shadow-lg bg-white">
          <CardHeader style={{ backgroundColor: '#0072bb' }} className="text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Filter className="mr-3 h-6 w-6" />
              Campaign Filters
            </CardTitle>
            <CardDescription className="text-blue-100">
              Filter campaigns by market, channel, date range, and more
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* Filter Grid */}
            <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
              {/* Market Filter */}
              <div className="space-y-3">
                <Label htmlFor="market" className="text-sm font-semibold text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  Market Region
                </Label>
                <Select
                  value={filters.market}
                  onValueChange={(value) => handleFilterChange('market', value)}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm">
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
              <div className="space-y-3">
                <Label htmlFor="channel" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-blue-600" />
                  Sales Channel
                </Label>
                <Select
                  value={filters.channel}
                  onValueChange={(value) => handleFilterChange('channel', value)}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm">
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
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-3">
                <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 justify-center">
              <Button
                onClick={applyFilters}
                style={{ backgroundColor: '#0072bb' }}
                className="text-white hover:opacity-90 shadow-lg px-8 py-3 h-auto font-semibold"
              >
                <Search className="mr-2 h-5 w-5" />
                Apply Filters
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3 h-auto font-semibold"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Clear All
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
          ) : (Array.isArray(campaigns) && campaigns.length === 0) ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Campaigns Found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later for new campaigns.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.isArray(campaigns) && campaigns.map((campaign) => {
                const marketColor = getMarketColor(campaign.market);
                const statusColor = getStatusColor(getStatusText(campaign));
                const status = getStatusText(campaign);
                
                return (
                  <Card key={campaign.campaignCode} className={`border-2 ${marketColor.border} ${marketColor.hoverBorder} hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}>
                    <CardHeader className={`${marketColor.bg} pb-3 rounded-t-lg`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-200 rounded-lg`}>
                            <Calendar className={`h-5 w-5 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-700`} />
                          </div>
                          <div>
                            <CardTitle className={`text-lg font-bold ${marketColor.text} line-clamp-1`}>{campaign.name}</CardTitle>
                            <CardDescription className={`text-sm ${marketColor.text} opacity-70`}>
                              {campaign.campaignCode}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor.light} ${statusColor.text}`}>
                            {status}
                          </span>
                          {status === 'Active' && <CheckCircle className={`h-5 w-5 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-600`} />}
                          {status === 'Upcoming' && <Clock className={`h-5 w-5 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-600`} />}
                          {status === 'Ended' && <XCircle className={`h-5 w-5 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-600`} />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      {/* Market and Channel Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Market
                          </p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-100 text-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-700 border border-${campaign.market === 'HK' ? 'red' : campaign.market === 'JP' ? 'purple' : campaign.market === 'TW' ? 'green' : 'gray'}-300`}>
                            {campaign.market}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            Channel
                          </p>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                            {campaign.channel}
                          </div>
                        </div>
                      </div>
                      
                      {/* Campaign Duration Card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Campaign Duration
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Start Date</p>
                            <div className="bg-white px-3 py-2 rounded-lg border border-blue-300 shadow-sm">
                              <p className="text-sm font-semibold text-gray-800">
                                {new Date(campaign.startDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex-1 flex justify-center">
                            <div className="h-0.5 w-8 bg-blue-300 relative">
                              <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">End Date</p>
                            <div className="bg-white px-3 py-2 rounded-lg border border-blue-300 shadow-sm">
                              <p className="text-sm font-semibold text-gray-800">
                                {new Date(campaign.endDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Duration calculation */}
                        <div className="mt-3 text-center">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Rules: {campaign.ruleIds?.length || 0}</span>
                          <span className="text-xs text-gray-500">ID: {campaign.campaignCode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;