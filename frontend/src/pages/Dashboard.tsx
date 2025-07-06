import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RuleManager from '@/components/RuleManager';
import { rulesApi, eventsApi, consumersApi } from '@/services/api';
import type { Rule, EventData } from '@/services/api';
import { 
  RefreshCw, 
  Play, 
  Users, 
  Settings, 
  Crown, 
  TrendingUp, 
  Target, 
  Zap,
  Award,
  BarChart3,
  Activity,
  Globe,
  CheckCircle,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRules: 0,
    totalConsumers: 0,
    totalPointsAwarded: 0,
    activeMarkets: ['JP', 'HK', 'TW'],
    avgResponseTime: 95,
    successRate: 99.8,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const rulesResponse = await rulesApi.getAllRules();
      if (rulesResponse.success && rulesResponse.rules) {
        setRules(rulesResponse.rules);
        setStats(prev => ({ ...prev, totalRules: rulesResponse.rules!.length }));
      }

      const consumersData = await consumersApi.getAllConsumers();
      const totalPoints = consumersData.reduce((sum, consumer) => sum + consumer.balance.total, 0);
      
      setStats(prev => ({ 
        ...prev, 
        totalConsumers: consumersData.length,
        totalPointsAwarded: totalPoints
      }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEvent = async () => {
    const testEvent: EventData = {
      eventId: `TEST_${Date.now()}`,
      eventType: 'PURCHASE',
      timestamp: new Date().toISOString(),
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
    };

    try {
      const result = await eventsApi.processEvent(testEvent);
      console.log('Test event result:', result);
      alert(`Test successful! Awarded ${result.totalPointsAwarded} points to ${result.consumerId}`);
      loadDashboardData();
    } catch (error) {
      console.error('Test event failed:', error);
      alert('Test event failed. Check console for details.');
    }
  };

  const rulesByCategory = {
    transaction: rules.filter(r => 
      ['INTERACTION_REGISTRY_POINT', 'ORDER_BASE_POINT', 'ORDER_MULTIPLE_POINT_LIMIT', 
       'FLEXIBLE_CAMPAIGN_BONUS', 'INTERACTION_ADJUST_POINT_TIMES_PER_YEAR', 
       'CONSULTATION_BONUS', 'INTERACTION_ADJUST_POINT_BY_MANAGER'].includes(r.event.type)
    ),
    consumer: rules.filter(r => 
      ['FIRST_PURCHASE_BIRTH_MONTH_BONUS', 'FLEXIBLE_VIP_MULTIPLIER'].includes(r.event.type)
    ),
    product: rules.filter(r => 
      ['FLEXIBLE_PRODUCT_MULTIPLIER', 'FLEXIBLE_COMBO_PRODUCT_MULTIPLIER'].includes(r.event.type)
    ),
    basket: rules.filter(r => 
      ['FLEXIBLE_BASKET_AMOUNT'].includes(r.event.type)
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-poppins text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Beautiful Header with Light Blue P&G Theme */}
      <div className="bg-blue-700 text-white shadow-xl">
        <div className="container mx-auto px-8 py-12">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-white/20 p-3 rounded-2xl mr-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white tracking-tight">
                    Loyalty Engine
                  </h1>
                  <p className="text-blue-100 text-xl mt-2 font-medium">
                    Smart Rules - Exceptional Experiences
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={handleTestEvent} 
                className="bg-white text-blue-700 hover:bg-blue-50 border-0 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Play className="mr-3 h-5 w-5" />
                Test Event
              </Button>
              <Button 
                onClick={loadDashboardData} 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="mr-3 h-5 w-5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        {/* Beautiful Stats Cards with Different Gradients */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Total Rules Card - Orange Gradient */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-100 uppercase tracking-wider">Total Rules</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{stats.totalRules}</div>
              <div className="flex items-center text-orange-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">Active business rules</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Consumers Card - Green Gradient */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">Total Consumers</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{stats.totalConsumers}</div>
              <div className="flex items-center text-emerald-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Registered users</span>
              </div>
            </CardContent>
          </Card>

          {/* Points Awarded Card - Purple Gradient */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-100 uppercase tracking-wider">Points Awarded</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{stats.totalPointsAwarded.toLocaleString()}</div>
              <div className="flex items-center text-purple-100">
                <Crown className="h-4 w-4 mr-1" />
                <span className="text-sm">Total distributed</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Markets Card - Teal Gradient */}
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-teal-100 uppercase tracking-wider">Active Markets</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{stats.activeMarkets.length}</div>
              <div className="flex items-center text-teal-100">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">{stats.activeMarkets.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 bg-blue-50">
              <CardTitle className="flex items-center text-blue-800">
                <CheckCircle className="mr-3 h-6 w-6 text-blue-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Engine Status</span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Success Rate</span>
                  <span className="text-2xl font-bold text-green-600">{stats.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: `${stats.successRate}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center text-gray-800">
                <Zap className="mr-3 h-6 w-6 text-blue-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Avg Response</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">API Health</span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Excellent
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-gray-800">
                <Calendar className="mr-3 h-6 w-6 text-purple-600" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Events Processed</span>
                  <span className="text-2xl font-bold text-purple-600">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Points Awarded</span>
                  <span className="text-lg font-bold text-purple-600">15,638</span>
                </div>
                <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Management Section with Beautiful Tabs */}
        <Card className="bg-white border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <Target className="mr-3 h-7 w-7 text-blue-600" />
                  Rules Management
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Configure and manage business rules across all categories
                </CardDescription>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">{rules.length} Total Rules</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-50 to-slate-50 m-0 rounded-none border-b border-gray-200 h-16">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-blue-500 font-medium text-gray-600 data-[state=active]:text-blue-600 h-full"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="transaction" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 font-medium text-gray-600 data-[state=active]:text-emerald-600 h-full"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Transaction ({rulesByCategory.transaction.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="consumer" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-purple-500 font-medium text-gray-600 data-[state=active]:text-purple-600 h-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Consumer ({rulesByCategory.consumer.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="product" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-orange-500 font-medium text-gray-600 data-[state=active]:text-orange-600 h-full"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Product ({rulesByCategory.product.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="basket" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-red-500 font-medium text-gray-600 data-[state=active]:text-red-600 h-full"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Basket ({rulesByCategory.basket.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <CardTitle className="flex items-center text-xl text-gray-800">
                        <Target className="mr-3 h-6 w-6 text-blue-600" />
                        Rules Distribution
                      </CardTitle>
                      <CardDescription>Rules organized by category and type</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {[
                          { label: 'Transaction Rules', count: rulesByCategory.transaction.length, color: 'emerald', bgColor: 'bg-emerald-500' },
                          { label: 'Consumer Rules', count: rulesByCategory.consumer.length, color: 'purple', bgColor: 'bg-purple-500' },
                          { label: 'Product Rules', count: rulesByCategory.product.length, color: 'orange', bgColor: 'bg-orange-500' },
                          { label: 'Basket Rules', count: rulesByCategory.basket.length, color: 'red', bgColor: 'bg-red-500' }
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full ${item.bgColor} mr-4 shadow-lg`}></div>
                              <span className="font-medium text-gray-700">{item.label}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-gray-800 mr-2">{item.count}</span>
                              <span className="text-sm text-gray-500">rules</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="flex items-center text-xl text-gray-800">
                        <Zap className="mr-3 h-6 w-6 text-green-600" />
                        System Insights
                      </CardTitle>
                      <CardDescription>Real-time system status and metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-green-50">
                          <span className="font-medium text-gray-700">Engine Status</span>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="font-bold text-green-700">Active</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50">
                          <span className="font-medium text-gray-700">API Response</span>
                          <span className="font-bold text-blue-700">&lt; 100ms</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-purple-50">
                          <span className="font-medium text-gray-700">Success Rate</span>
                          <span className="font-bold text-purple-700">99.8%</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-orange-50">
                          <span className="font-medium text-gray-700">Last Update</span>
                          <span className="font-bold text-orange-700">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transaction" className="p-8">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Transaction Rules</h3>
                  <p className="text-gray-600">Configure rules that trigger based on purchase transactions and order events</p>
                </div>
                <RuleManager 
                  category="transaction" 
                  rules={rulesByCategory.transaction}
                  onRulesUpdate={loadDashboardData}
                />
              </TabsContent>

              <TabsContent value="consumer" className="p-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Consumer Attribute Rules</h3>
                  <p className="text-gray-600">Rules based on consumer attributes like VIP status, birth month, and preferences</p>
                </div>
                <RuleManager 
                  category="consumer" 
                  rules={rulesByCategory.consumer}
                  onRulesUpdate={loadDashboardData}
                />
              </TabsContent>

              <TabsContent value="product" className="p-8">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Product Multiplier Rules</h3>
                  <p className="text-gray-600">Rules that apply multipliers based on specific products or product categories</p>
                </div>
                <RuleManager 
                  category="product" 
                  rules={rulesByCategory.product}
                  onRulesUpdate={loadDashboardData}
                />
              </TabsContent>

              <TabsContent value="basket" className="p-8">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Basket Threshold Rules</h3>
                  <p className="text-gray-600">Rules that trigger when purchase amounts exceed certain thresholds</p>
                </div>
                <RuleManager 
                  category="basket" 
                  rules={rulesByCategory.basket}
                  onRulesUpdate={loadDashboardData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
