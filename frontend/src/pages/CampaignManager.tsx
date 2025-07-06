import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { campaignsApi } from '@/services/api';
import { Calendar, Filter, RefreshCw, Search, MapPin, Globe } from 'lucide-react';

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

  const getStatusColor = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    
    if (now < start) return 'text-blue-600 bg-blue-50';
    if (now > end) return 'text-gray-600 bg-gray-50';
    return 'text-green-600 bg-green-50';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Monitor and manage active loyalty campaigns across markets
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadCampaigns()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Campaign Filters
          </CardTitle>
          <CardDescription>
            Filter campaigns by market, channel, date range, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Select
                value={filters.market}
                onValueChange={(value) => handleFilterChange('market', value)}
              >
                <SelectTrigger>
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
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={filters.channel}
                onValueChange={(value) => handleFilterChange('channel', value)}
              >
                <SelectTrigger>
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productLine">Product Line</Label>
              <Select
                value={filters.productLine}
                onValueChange={(value) => handleFilterChange('productLine', value)}
              >
                <SelectTrigger>
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

          <div className="flex gap-2">
            <Button onClick={applyFilters}>
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => getStatusText(c) === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Markets</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(campaigns.map(c => c.market)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              {Array.from(new Set(campaigns.map(c => c.market))).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rules</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((total, c) => total + (c.ruleIds?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total rules linked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Campaigns {loading ? '(Loading...)' : `(${campaigns.length})`}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No campaigns found with the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.campaignCode}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {campaign.campaignCode}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign)}`}>
                      {getStatusText(campaign)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Market:</span>
                      <div className="text-muted-foreground">{campaign.market}</div>
                    </div>
                    <div>
                      <span className="font-medium">Channel:</span>
                      <div className="text-muted-foreground">{campaign.channel}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Duration:</div>
                    <div className="text-muted-foreground">
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Brand:</div>
                    <div className="text-muted-foreground">{campaign.brand}</div>
                  </div>

                  {campaign.ruleIds && campaign.ruleIds.length > 0 && (
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">Linked Rules:</div>
                      <div className="flex flex-wrap gap-1">
                        {campaign.ruleIds.slice(0, 3).map((ruleId, index) => (
                          <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                            {ruleId}
                          </span>
                        ))}
                        {campaign.ruleIds.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                            +{campaign.ruleIds.length - 3} more
                          </span>
                        )}
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
  );
};

export default CampaignManager;
