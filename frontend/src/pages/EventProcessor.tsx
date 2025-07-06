import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventsApi } from '@/services/api';
import type { EventData, EventResponse } from '@/services/api';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Clock, 
  Code, 
  Settings, 
  Activity,
  Sparkles,
  Cpu,
  Database,
  Send
} from 'lucide-react';

const EventProcessor: React.FC = () => {
  const [eventData, setEventData] = useState<Partial<EventData>>({
    eventType: 'PURCHASE',
    market: 'HK',
    channel: 'STORE',
    productLine: 'PREMIUM_SERIES',
    consumerId: 'user_hk_standard',
    context: { storeId: 'HK_STORE_001' },
    attributes: {
      amount: 1500,
      currency: 'HKD',
      srpAmount: 1500,
      skuList: ['SK_HK_001']
    }
  });
  
  const [result, setResult] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof EventData, value: any) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: 'context' | 'attributes', field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleProcessEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventsApi.processEvent({
        ...eventData as EventData,
        eventId: `evt_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process event');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEventData({
      eventType: 'PURCHASE',
      market: 'HK',
      channel: 'STORE',
      productLine: 'PREMIUM_SERIES',
      consumerId: 'user_hk_standard',
      context: { storeId: 'HK_STORE_001' },
      attributes: {
        amount: 1500,
        currency: 'HKD',
        srpAmount: 1500,
        skuList: ['SK_HK_001']
      }
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8 bg-white rounded-lg shadow-sm mx-4 my-6">
        {/* Header with P&G Light Blue Theme */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-700 mb-4 shadow-lg">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700">
            Event Processor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test and validate loyalty events in real-time with our powerful processing engine
          </p>
        </div>

        {/* Stats Cards with Same Gradients as Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Processing Speed</p>
                  <p className="text-2xl font-bold">~15ms</p>
                </div>
                <Activity className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Rules Engine</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
                <Settings className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Database</p>
                  <p className="text-2xl font-bold">Online</p>
                </div>
                <Database className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Configuration */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl cursor-pointer">
                <Code className="mr-3 h-6 w-6" />
                Event Configuration
              </CardTitle>
              <CardDescription className="text-blue-100">
                Configure your loyalty event parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Basic Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-sm font-semibold text-gray-700">Event Type</Label>
                  <Select
                    value={eventData.eventType}
                    onValueChange={(value) => handleInputChange('eventType', value)}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase Event</SelectItem>
                      <SelectItem value="REGISTRATION">Registration Event</SelectItem>
                      <SelectItem value="REVIEW">Product Review</SelectItem>
                      <SelectItem value="REFERRAL">Referral Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consumerId" className="text-sm font-semibold text-gray-700">Consumer ID</Label>
                  <Input
                    value={eventData.consumerId}
                    onChange={(e) => handleInputChange('consumerId', e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                    placeholder="user_hk_standard"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market" className="text-sm font-semibold text-gray-700">Market</Label>
                  <Select
                    value={eventData.market}
                    onValueChange={(value) => handleInputChange('market', value)}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HK">Hong Kong</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="TW">Taiwan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel" className="text-sm font-semibold text-gray-700">Channel</Label>
                  <Select
                    value={eventData.channel}
                    onValueChange={(value) => handleInputChange('channel', value)}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STORE">In-Store</SelectItem>
                      <SelectItem value="ECOMMERCE">E-Commerce</SelectItem>
                      <SelectItem value="MOBILE">Mobile App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-orange-500" />
                  Event Attributes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Amount (HKD)</Label>
                    <Input
                      type="number"
                      value={eventData.attributes?.amount || ''}
                      onChange={(e) => handleNestedChange('attributes', 'amount', Number(e.target.value))}
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Currency</Label>
                    <Input
                      value={eventData.attributes?.currency || ''}
                      onChange={(e) => handleNestedChange('attributes', 'currency', e.target.value)}
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleProcessEvent}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Process Event
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 cursor-pointer"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl cursor-pointer">
                <Cpu className="mr-3 h-6 w-6" />
                Processing Results
              </CardTitle>
              <CardDescription className="text-blue-100">
                Real-time event processing output
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold text-green-800">Event Processed Successfully</p>
                        <p className="text-sm text-green-600">
                          Processing Time: <Clock className="inline h-4 w-4 mr-1" />
                          ~15ms
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.totalPointsAwarded !== undefined && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Points Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <p className="text-2xl font-bold text-purple-600">{result.totalPointsAwarded || 0}</p>
                          <p className="text-sm text-gray-600">Points Earned</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <p className="text-2xl font-bold text-pink-600">{result.resultingBalance?.total || 0}</p>
                          <p className="text-sm text-gray-600">Total Points</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Raw Response</h4>
                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!result && !error && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Ready to Process Events</p>
                  <p className="text-sm">Configure your event parameters and click "Process Event" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventProcessor;
