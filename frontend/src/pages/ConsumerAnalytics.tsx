import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { consumersApi } from '@/services/api';
import { 
  Search, 
  User, 
  CreditCard, 
  Clock, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Globe
} from 'lucide-react';

interface ConsumerPoints {
  consumerId: string;
  total: number;
  available: number;
  used: number;
  pointsExpirationDate?: string;
  expirationPolicy?: string;
  market: string;
  timezone?: string;
  accountVersion: number;
}

interface HistoryEntry {
  eventId: string;
  eventType: string;
  timestamp: string;
  pointsAwarded: number;
  pointsUsed: number;
  balance: {
    total: number;
    available: number;
    used: number;
  };
  description?: string;
}

const ConsumerAnalytics: React.FC = () => {
  const [selectedConsumerId, setSelectedConsumerId] = useState('user_hk_standard');
  const [consumerPoints, setConsumerPoints] = useState<ConsumerPoints | null>(null);
  const [consumerHistory, setConsumerHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchConsumerId, setSearchConsumerId] = useState('');

  const sampleConsumerIds = [
    'user_hk_standard',
    'user_hk_vip', 
    'user_jp_standard',
    'user_tw_essence_lover',
    'user_tw_vip'
  ];

  useEffect(() => {
    if (selectedConsumerId) {
      loadConsumerData(selectedConsumerId);
    }
  }, [selectedConsumerId]);

  const loadConsumerData = async (consumerId: string) => {
    try {
      setLoading(true);
      
      const pointsData = await consumersApi.getConsumerPoints(consumerId);
      setConsumerPoints(pointsData);

      try {
        const historyData = await consumersApi.getConsumerHistory(consumerId);
        setConsumerHistory(historyData || []);
      } catch (error) {
        console.warn('History data not available for this consumer');
        setConsumerHistory([]);
      }
    } catch (error) {
      console.error('Error loading consumer data:', error);
      setConsumerPoints(null);
      setConsumerHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchConsumerId.trim()) {
      setSelectedConsumerId(searchConsumerId.trim());
    }
  };

  const handleQuickSelect = (consumerId: string) => {
    setSelectedConsumerId(consumerId);
    setSearchConsumerId(consumerId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTierDisplay = (consumerId: string) => {
    if (consumerId.includes('vip')) return { tier: 'VIP', color: 'text-purple-600 bg-purple-50', bgGradient: 'from-purple-500 to-purple-600' };
    if (consumerId.includes('essence')) return { tier: 'Essence Lover', color: 'text-pink-600 bg-pink-50', bgGradient: 'from-pink-500 to-rose-500' };
    return { tier: 'Standard', color: 'text-blue-600 bg-blue-50', bgGradient: 'from-blue-500 to-blue-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-poppins text-lg">Loading consumer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 font-poppins">
      {/* Beautiful Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 text-white shadow-xl">
        <div className="container mx-auto px-8 py-12">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-white/20 p-3 rounded-2xl mr-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Consumer Analytics
                  </h1>
                  <p className="text-blue-100 text-xl mt-2">
                    Deep insights into customer behavior and point transactions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => loadConsumerData(selectedConsumerId)} 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 px-8 py-3 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="mr-3 h-5 w-5" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        {/* Consumer Search Card */}
        <Card className="bg-white border-0 shadow-2xl mb-10 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
              <Search className="mr-3 h-7 w-7 text-blue-600" />
              Consumer Lookup
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Search for specific consumers or explore sample customer profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div>
              <Label htmlFor="consumerId" className="text-lg font-semibold text-gray-700 mb-3 block">Consumer ID</Label>
              <div className="flex gap-4">
                <Input
                  id="consumerId"
                  value={searchConsumerId}
                  onChange={(e) => setSearchConsumerId(e.target.value)}
                  placeholder="Enter consumer ID (e.g., user_hk_standard)"
                  className="text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-700">Quick Select Sample Consumers</Label>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleConsumerIds.map((consumerId) => {
                  const { tier, color, bgGradient } = getTierDisplay(consumerId);
                  return (
                    <Button
                      key={consumerId}
                      variant={selectedConsumerId === consumerId ? "default" : "outline"}
                      onClick={() => handleQuickSelect(consumerId)}
                      className={`p-6 h-auto justify-start transition-all duration-300 hover:scale-105 ${
                        selectedConsumerId === consumerId 
                          ? `bg-gradient-to-r ${bgGradient} text-white border-0 shadow-lg` 
                          : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg ${selectedConsumerId === consumerId ? 'bg-white/20' : 'bg-blue-100'}`}>
                          <User className={`h-5 w-5 ${selectedConsumerId === consumerId ? 'text-white' : 'text-blue-600'}`} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-mono text-sm font-medium">{consumerId}</div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            selectedConsumerId === consumerId ? 'bg-white/20 text-white' : color
                          }`}>
                            {tier}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {consumerPoints && (
          <>
            {/* Beautiful Stats Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-10">
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">Total Points</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{consumerPoints.total.toLocaleString()}</div>
                  <div className="flex items-center text-emerald-100">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">Lifetime earned</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Available</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{consumerPoints.available.toLocaleString()}</div>
                  <div className="flex items-center text-blue-100">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-sm">Ready to redeem</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-100 uppercase tracking-wider">Used Points</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{consumerPoints.used.toLocaleString()}</div>
                  <div className="flex items-center text-purple-100">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm">Already redeemed</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-orange-100 uppercase tracking-wider">Market</CardTitle>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{consumerPoints.market}</div>
                  <div className="flex items-center text-orange-100">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">v{consumerPoints.accountVersion}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consumer Details Card */}
            <Card className="bg-white border-0 shadow-2xl mb-10 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <User className="mr-3 h-7 w-7 text-blue-600" />
                  Consumer Profile
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Detailed information for {selectedConsumerId}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                    <Label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Consumer ID</Label>
                    <div className="font-mono text-lg font-bold text-blue-800 mt-2 break-all">
                      {consumerPoints.consumerId}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl">
                    <Label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Market</Label>
                    <div className="text-lg font-bold text-emerald-800 mt-2">
                      {consumerPoints.market}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                    <Label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Account Version</Label>
                    <div className="text-lg font-bold text-purple-800 mt-2">
                      {consumerPoints.accountVersion}
                    </div>
                  </div>

                  {consumerPoints.pointsExpirationDate && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                      <Label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Points Expiration</Label>
                      <div className="text-sm font-bold text-orange-800 mt-2">
                        {formatDate(consumerPoints.pointsExpirationDate)}
                      </div>
                    </div>
                  )}

                  {consumerPoints.expirationPolicy && (
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl">
                      <Label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Expiration Policy</Label>
                      <div className="text-sm font-bold text-pink-800 mt-2">
                        {consumerPoints.expirationPolicy}
                      </div>
                    </div>
                  )}

                  {consumerPoints.timezone && (
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl">
                      <Label className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Timezone</Label>
                      <div className="text-sm font-bold text-cyan-800 mt-2">
                        {consumerPoints.timezone}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="bg-white border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <Clock className="mr-3 h-7 w-7 text-purple-600" />
                  Transaction History
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Recent point transactions and customer activity
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {consumerHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Transaction History</h3>
                    <p className="text-gray-500 text-lg mb-1">No transactions have been processed for this consumer yet.</p>
                    <p className="text-gray-400">Try processing a test event to see transaction history.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {consumerHistory.map((entry, index) => (
                      <div key={entry.eventId || index} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-bold text-lg text-gray-800">{entry.eventType}</span>
                                <span className="font-mono text-sm text-gray-500 ml-3">{entry.eventId}</span>
                              </div>
                            </div>
                            <div className="text-gray-600 mb-2">
                              {formatDate(entry.timestamp)}
                            </div>
                            {entry.description && (
                              <div className="text-gray-700 bg-gray-100 p-3 rounded-lg">{entry.description}</div>
                            )}
                          </div>
                          <div className="text-right ml-6">
                            {entry.pointsAwarded > 0 && (
                              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold text-lg mb-2">
                                +{entry.pointsAwarded} pts
                              </div>
                            )}
                            {entry.pointsUsed > 0 && (
                              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl font-bold text-lg mb-2">
                                -{entry.pointsUsed} pts
                              </div>
                            )}
                            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                              Balance: {entry.balance.available.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!consumerPoints && !loading && selectedConsumerId && (
          <Card className="bg-white border-0 shadow-2xl">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-100 to-red-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Consumer Not Found</h3>
                <p className="text-gray-500 text-lg mb-1">Unable to load data for this consumer ID.</p>
                <p className="text-gray-400">Please check the consumer ID and try again.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsumerAnalytics;
