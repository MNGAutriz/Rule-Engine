import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventsApi } from '@/services/api';
import type { EventData, EventResponse } from '@/services/api';
import { Play, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

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
      
      const fullEventData: EventData = {
        ...eventData as EventData,
        eventId: `EVENT_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      const response = await eventsApi.processEvent(fullEventData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process event');
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

  const sampleEvents = [
    {
      name: 'Standard Purchase',
      data: {
        eventType: 'PURCHASE',
        market: 'HK',
        channel: 'STORE',
        productLine: 'PREMIUM_SERIES',
        consumerId: 'user_hk_standard',
        context: { storeId: 'HK_STORE_001' },
        attributes: { amount: 1500, currency: 'HKD', srpAmount: 1500, skuList: ['SK_HK_001'] }
      }
    },
    {
      name: 'VIP Purchase',
      data: {
        eventType: 'PURCHASE',
        market: 'HK',
        channel: 'ONLINE',
        productLine: 'LUXURY_SERIES',
        consumerId: 'user_hk_vip',
        context: { websiteId: 'HK_WEB_001' },
        attributes: { amount: 5000, currency: 'HKD', srpAmount: 5000, skuList: ['SK_HK_LUX_001'] }
      }
    },
    {
      name: 'Birthday Purchase',
      data: {
        eventType: 'FIRST_PURCHASE_BIRTH_MONTH_BONUS',
        market: 'JP',
        channel: 'STORE',
        productLine: 'PREMIUM_SERIES',
        consumerId: 'user_jp_birthday',
        context: { storeId: 'JP_STORE_001' },
        attributes: { amount: 2000, currency: 'JPY', srpAmount: 2000, skuList: ['SK_JP_001'] }
      }
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Processor</h1>
          <p className="text-muted-foreground">
            Test and validate event processing through the rules engine
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetForm} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Event Configuration</CardTitle>
            <CardDescription>
              Configure the event data to be processed by the rules engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Sample Events */}
            <div className="space-y-2">
              <Label>Load Sample Event</Label>
              <div className="flex gap-2 flex-wrap">
                {sampleEvents.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setEventData(sample.data)}
                  >
                    {sample.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Basic Event Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={eventData.eventType}
                  onValueChange={(value) => handleInputChange('eventType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                    <SelectItem value="INTERACTION_REGISTRY_POINT">Interaction Registry</SelectItem>
                    <SelectItem value="FIRST_PURCHASE_BIRTH_MONTH_BONUS">Birthday Bonus</SelectItem>
                    <SelectItem value="CONSULTATION_BONUS">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumerId">Consumer ID</Label>
                <Select
                  value={eventData.consumerId}
                  onValueChange={(value) => handleInputChange('consumerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_hk_standard">HK Standard User</SelectItem>
                    <SelectItem value="user_hk_vip">HK VIP User</SelectItem>
                    <SelectItem value="user_jp_standard">JP Standard User</SelectItem>
                    <SelectItem value="user_jp_birthday">JP Birthday User</SelectItem>
                    <SelectItem value="user_tw_manager">TW Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="market">Market</Label>
                <Select
                  value={eventData.market}
                  onValueChange={(value) => handleInputChange('market', value)}
                >
                  <SelectTrigger>
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
                <Label htmlFor="channel">Channel</Label>
                <Select
                  value={eventData.channel}
                  onValueChange={(value) => handleInputChange('channel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STORE">Store</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productLine">Product Line</Label>
                <Select
                  value={eventData.productLine}
                  onValueChange={(value) => handleInputChange('productLine', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREMIUM_SERIES">Premium Series</SelectItem>
                    <SelectItem value="STANDARD_SERIES">Standard Series</SelectItem>
                    <SelectItem value="LUXURY_SERIES">Luxury Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Purchase Amount for Purchase Events */}
            {eventData.eventType === 'PURCHASE' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    type="number"
                    value={eventData.attributes?.amount || ''}
                    onChange={(e) => handleNestedChange('attributes', 'amount', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    value={eventData.attributes?.currency || ''}
                    onChange={(e) => handleNestedChange('attributes', 'currency', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Context and Attributes as JSON */}
            <div className="space-y-2">
              <Label htmlFor="context">Context (JSON)</Label>
              <Textarea
                id="context"
                value={JSON.stringify(eventData.context, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('context', parsed);
                  } catch (error) {
                    // Invalid JSON, keep as is for user to fix
                  }
                }}
                rows={3}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attributes">Attributes (JSON)</Label>
              <Textarea
                id="attributes"
                value={JSON.stringify(eventData.attributes, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('attributes', parsed);
                  } catch (error) {
                    // Invalid JSON, keep as is for user to fix
                  }
                }}
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <Button onClick={handleProcessEvent} disabled={loading} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              {loading ? 'Processing...' : 'Process Event'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              View the results of event processing and point calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center space-x-2 p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 border border-green-200 rounded-lg bg-green-50 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Event processed successfully!</span>
                </div>

                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Consumer ID:</span>
                        <span className="font-mono">{result.consumerId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Event ID:</span>
                        <span className="font-mono">{result.eventId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Event Type:</span>
                        <span>{result.eventType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Points Awarded:</span>
                        <span className="font-semibold text-green-600">{result.totalPointsAwarded}</span>
                      </div>
                    </div>
                  </div>

                  {result.pointBreakdown && result.pointBreakdown.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Point Breakdown</h4>
                      <div className="space-y-2">
                        {result.pointBreakdown.map((breakdown, index) => (
                          <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>{breakdown.description}</span>
                            <span className="font-semibold">{breakdown.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Resulting Balance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{result.resultingBalance.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span>{result.resultingBalance.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used:</span>
                        <span>{result.resultingBalance.used}</span>
                      </div>
                    </div>
                  </div>

                  {result.errors && result.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                      <div className="space-y-1">
                        {result.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure an event above and click "Process Event" to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventProcessor;
