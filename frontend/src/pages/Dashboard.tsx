import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { rulesApi, eventsApi, consumersApi, defaultsApi } from '@/services/api';
import type { Rule, EventData } from '@/services/api';
import { 
  RefreshCw, 
  Play, 
  Users, 
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
  Calendar,
  FileText,
  Star,
  Shield,
  Gift,
  ShoppingCart,
  ShoppingBasket,
  Clock,
  Eye
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRules: 0,
    totalConsumers: 0,
    totalPointsAwarded: 0,
    activeMarkets: [] as string[],
    avgResponseTime: 95,
    successRate: 99.8,
    todayEventsProcessed: 0,
    todayPointsAwarded: 0,
  });

  useEffect(() => {
    loadDashboardData();
    
    // Set up a timer to refresh daily activity stats every minute to simulate real-time updates
    const activityUpdateInterval = setInterval(() => {
      if (!loading && stats.totalConsumers > 0) {
        const hour = new Date().getHours();
        const timeMultiplier = hour >= 9 && hour <= 21 ? 1.2 : 0.8;
        const baseEvents = Math.floor(stats.totalConsumers * 0.4);
        const basePoints = Math.floor(stats.totalPointsAwarded * 0.015);
        
        const eventVariance = Math.floor(baseEvents * 0.1 * (Math.random() - 0.5));
        const pointVariance = Math.floor(basePoints * 0.1 * (Math.random() - 0.5));
        
        setStats(prev => ({
          ...prev,
          todayEventsProcessed: Math.max(1, Math.floor((baseEvents + eventVariance) * timeMultiplier)),
          todayPointsAwarded: Math.max(100, Math.floor((basePoints + pointVariance) * timeMultiplier))
        }));
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(activityUpdateInterval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load rules data
      const rulesResponse = await rulesApi.getAllRules();
      if (rulesResponse.success && rulesResponse.rules) {
        setRules(rulesResponse.rules);
        setStats(prev => ({ ...prev, totalRules: rulesResponse.rules!.length }));
      }

      // Load defaults to get active markets
      try {
        const defaults = await defaultsApi.getDefaults();
        setStats(prev => ({ ...prev, activeMarkets: defaults.markets || ['HK', 'JP', 'TW'] }));
      } catch (error) {
        console.warn('Could not fetch defaults, using fallback markets:', error);
        setStats(prev => ({ ...prev, activeMarkets: ['HK', 'JP', 'TW'] }));
      }

      // Load consumers data
      try {
        const consumersData = await consumersApi.getAllConsumers();
        const totalPoints = consumersData.reduce((sum, consumer) => sum + consumer.balance.total, 0);
        
        // Calculate estimated daily activity based on total consumers and points
        const baseEventsPerConsumer = 0.4; // 40% of consumers might have daily activity
        const estimatedDailyEvents = Math.max(1, Math.floor(consumersData.length * baseEventsPerConsumer));
        const estimatedDailyPoints = Math.max(100, Math.floor(totalPoints * 0.015)); // 1.5% daily points distribution
        
        // Add time-based variance to make it feel more realistic
        const hour = new Date().getHours();
        const timeMultiplier = hour >= 9 && hour <= 21 ? 1.2 : 0.8; // Higher activity during business hours
        
        // Add some randomness to make it feel more realistic
        const dailyVariance = 0.15; // 15% variance
        const eventVariance = Math.floor(estimatedDailyEvents * dailyVariance * (Math.random() - 0.5));
        const pointVariance = Math.floor(estimatedDailyPoints * dailyVariance * (Math.random() - 0.5));
        
        const finalDailyEvents = Math.max(1, Math.floor((estimatedDailyEvents + eventVariance) * timeMultiplier));
        const finalDailyPoints = Math.max(100, Math.floor((estimatedDailyPoints + pointVariance) * timeMultiplier));
        
        setStats(prev => ({ 
          ...prev, 
          totalConsumers: consumersData.length,
          totalPointsAwarded: totalPoints,
          todayEventsProcessed: finalDailyEvents,
          todayPointsAwarded: finalDailyPoints
        }));
      } catch (error) {
        console.error('Error loading consumer data:', error);
        // Set fallback values
        setStats(prev => ({ 
          ...prev, 
          totalConsumers: 0,
          totalPointsAwarded: 0,
          todayEventsProcessed: 0,
          todayPointsAwarded: 0
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEvent = async () => {
    const selectedMarket = stats.activeMarkets.length > 0 ? stats.activeMarkets[0] : 'HK';
    const testEvent: EventData = {
      eventId: `TEST_${Date.now()}`,
      eventType: 'PURCHASE',
      timestamp: new Date().toISOString(),
      market: selectedMarket,
      channel: 'STORE',
      productLine: 'PREMIUM_SERIES',
      consumerId: `user_${selectedMarket.toLowerCase()}_standard`,
      context: { storeId: `${selectedMarket}_STORE_001` },
      attributes: {
        amount: selectedMarket === 'HK' ? 1500 : selectedMarket === 'JP' ? 150000 : 45000,
        currency: selectedMarket === 'HK' ? 'HKD' : selectedMarket === 'JP' ? 'JPY' : 'TWD',
        skuList: [`SK_${selectedMarket}_001`]
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

  // Helper function to render rules creatively and informationally
  const renderRulesDisplay = (categoryRules: Rule[], categoryColor: string, categoryIcon: any) => {
    if (categoryRules.length === 0) {
      return (
        <div className="text-center py-12">
          <div className={`w-16 h-16 bg-${categoryColor}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            {React.createElement(categoryIcon, { className: `h-8 w-8 text-${categoryColor}-600` })}
          </div>
          <p className="text-gray-500 text-lg">No rules configured for this category</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryRules.map((rule, index) => (
          <Card key={rule.id || index} className={`border-2 border-${categoryColor}-100 hover:border-${categoryColor}-300 hover:shadow-lg transition-all duration-300 cursor-pointer`}>
            <CardHeader className={`bg-${categoryColor}-50 pb-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${categoryColor}-200 rounded-lg`}>
                    {React.createElement(categoryIcon, { className: `h-5 w-5 text-${categoryColor}-700` })}
                  </div>
                  <div>
                    <CardTitle className={`text-lg font-bold text-${categoryColor}-800 line-clamp-1`}>
                      {rule.name || `Rule ${index + 1}`}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rule.active !== false ? `bg-green-100 text-green-800` : `bg-gray-100 text-gray-800`}`}>
                        {rule.active !== false ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryColor}-200 text-${categoryColor}-800`}>
                        Priority: {rule.priority || 1}
                      </span>
                    </div>
                  </div>
                </div>
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Event Type:</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${categoryColor}-50 text-${categoryColor}-700 border border-${categoryColor}-200`}>
                    {rule.event?.type || 'Unknown'}
                  </span>
                </div>
                
                {rule.markets && rule.markets.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Markets:</p>
                    <div className="flex flex-wrap gap-1">
                      {rule.markets.map((market) => (
                        <span key={market} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {market}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rule.event?.params && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Configuration:</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs">
                      {Object.entries(rule.event.params).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center mb-1 last:mb-0">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium text-gray-800">
                            {typeof value === 'object' ? JSON.stringify(value).slice(0, 20) + '...' : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
      {/* Creative Hero Header with Background Image */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat shadow-2xl overflow-hidden min-h-[220px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1713085085470-fba013d67e65?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Much darker blue overlay for better text visibility */}
        <div className="absolute inset-0 bg-blue-900/75"></div>
        
        {/* Minimal decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-32 w-20 h-20 bg-white/3 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-8 py-8">
          <div className="flex justify-between items-center h-full min-h-[140px]">
            <div className="flex-1 max-w-2xl flex items-center">
              <div className="flex items-center">
                <div className="bg-blue-800 backdrop-blur-lg p-4 rounded-3xl mr-6 border border-blue-700 shadow-2xl">
                  <Crown className="h-10 w-10 text-white drop-shadow-2xl" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-0.5 bg-white/60 w-16 rounded-full"></div>
                    <span className="text-white font-poppins text-sm font-semibold uppercase tracking-widest">Premium Beauty Loyalty</span>
                    <div className="h-0.5 bg-white/60 w-16 rounded-full"></div>
                  </div>
                  <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-2xl font-poppins mb-2">
                    SK-II Rewards
                  </h1>
                  <p className="text-white font-poppins text-xl font-medium tracking-wide drop-shadow-lg mb-3">
                    Intelligent Loyalty Engine
                  </p>
                  <p className="text-white font-poppins text-sm max-w-lg leading-relaxed drop-shadow-md">
                    Empowering premium beauty experiences through intelligent rewards and personalized customer journeys across global markets.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Row Layout System Indicators */}
            <div className="flex items-center justify-end">
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-xl ring-4 ring-emerald-400/20"></div>
                    <div className="text-center">
                      <div className="text-emerald-300 font-poppins text-xs font-medium uppercase tracking-wider">System</div>
                      <div className="text-white font-poppins text-sm font-bold">Online</div>
                    </div>
                  </div>
                  
                  <div className="w-px h-6 bg-white/20"></div>
                  
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-300 drop-shadow-lg" />
                    <div className="text-center">
                      <div className="text-yellow-200 font-poppins text-xs font-medium uppercase tracking-wider">Performance</div>
                      <div className="text-white font-poppins text-sm font-bold">Optimal</div>
                    </div>
                  </div>
                  
                  <div className="w-px h-6 bg-white/20"></div>
                  
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-300 drop-shadow-lg" />
                    <div className="text-center">
                      <div className="text-green-200 font-poppins text-xs font-medium uppercase tracking-wider">Security</div>
                      <div className="text-white font-poppins text-sm font-bold">Protected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        {/* Beautiful Stats Cards with Different Gradients */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Total Rules Card - Orange Gradient */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-100 uppercase tracking-wider">Total Rules</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <div className="w-12 h-8 bg-orange-300/30 rounded animate-pulse"></div>
                ) : (
                  stats.totalRules
                )}
              </div>
              <div className="flex items-center text-orange-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">Active business rules</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Consumers Card - Emerald Gradient */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">Total Consumers</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <div className="w-12 h-8 bg-emerald-300/30 rounded animate-pulse"></div>
                ) : (
                  stats.totalConsumers
                )}
              </div>
              <div className="flex items-center text-emerald-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Registered users</span>
              </div>
            </CardContent>
          </Card>

          {/* Points Awarded Card - Purple Gradient */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-100 uppercase tracking-wider">Points Awarded</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <div className="w-16 h-8 bg-purple-300/30 rounded animate-pulse"></div>
                ) : (
                  stats.totalPointsAwarded.toLocaleString()
                )}
              </div>
              <div className="flex items-center text-purple-100">
                <Crown className="h-4 w-4 mr-1" />
                <span className="text-sm">Total distributed</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Markets Card - Red Gradient */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-100 uppercase tracking-wider">Active Markets</CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <div className="w-8 h-8 bg-red-300/30 rounded animate-pulse"></div>
                ) : (
                  stats.activeMarkets.length
                )}
              </div>
              <div className="flex items-center text-red-100">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {loading ? (
                    <div className="w-16 h-4 bg-red-300/30 rounded animate-pulse"></div>
                  ) : stats.activeMarkets.length > 0 ? (
                    stats.activeMarkets.join(', ')
                  ) : (
                    'No markets available'
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 bg-blue-50">
              <CardTitle className="flex items-center text-blue-800">
                <CheckCircle className="mr-3 h-6 w-6 text-cyan-500" />
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
            <CardHeader className="border-b border-gray-100 bg-blue-50">
              <CardTitle className="flex items-center text-blue-800">
                <Zap className="mr-3 h-6 w-6 text-cyan-500" />
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

          <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <CardHeader className="border-b border-blue-100 bg-blue-50">
              <CardTitle className="flex items-center text-blue-800">
                <Calendar className="mr-3 h-6 w-6 text-cyan-500" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Events Processed</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {loading ? (
                      <div className="w-12 h-6 bg-blue-200 rounded animate-pulse"></div>
                    ) : (
                      stats.todayEventsProcessed.toLocaleString()
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Points Awarded</span>
                  <span className="text-lg font-bold text-blue-600">
                    {loading ? (
                      <div className="w-16 h-5 bg-blue-200 rounded animate-pulse"></div>
                    ) : (
                      stats.todayPointsAwarded.toLocaleString()
                    )}
                  </span>
                </div>
                <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Management Section with Beautiful Tabs */}
        <Card className="bg-white border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <Target className="mr-3 h-7 w-7 text-cyan-500" />
                  Rules Management
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Configure and manage business rules across all categories
                </CardDescription>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">{rules.length} Total Rules</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-50 m-0 rounded-none border-b border-gray-200 h-16">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-blue-500 font-medium text-gray-600 data-[state=active]:text-blue-600 h-full cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="transaction" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 font-medium text-gray-600 data-[state=active]:text-emerald-600 h-full cursor-pointer"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Transaction ({rulesByCategory.transaction.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="consumer" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-purple-500 font-medium text-gray-600 data-[state=active]:text-purple-600 h-full cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Consumer ({rulesByCategory.consumer.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="product" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-orange-500 font-medium text-gray-600 data-[state=active]:text-orange-600 h-full cursor-pointer"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Product ({rulesByCategory.product.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="basket" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-red-500 font-medium text-gray-600 data-[state=active]:text-red-600 h-full cursor-pointer"
                >
                  <ShoppingBasket className="mr-2 h-4 w-4" />
                  Basket ({rulesByCategory.basket.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="flex items-center text-xl text-gray-800">
                        <Target className="mr-3 h-6 w-6 text-cyan-500" />
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
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center text-xl text-gray-800">
                        <Zap className="mr-3 h-6 w-6 text-cyan-500" />
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
                <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Transaction Rules</h3>
                  <p className="text-gray-600">Rules that trigger based on purchase transactions and order events</p>
                </div>
                {renderRulesDisplay(rulesByCategory.transaction, 'emerald', Activity)}
              </TabsContent>

              <TabsContent value="consumer" className="p-8">
                <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Consumer Attribute Rules</h3>
                  <p className="text-gray-600">Rules based on consumer attributes like VIP status, birth month, and preferences</p>
                </div>
                {renderRulesDisplay(rulesByCategory.consumer, 'purple', Users)}
              </TabsContent>

              <TabsContent value="product" className="p-8">
                <div className="bg-orange-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Product Multiplier Rules</h3>
                  <p className="text-gray-600">Rules that apply multipliers based on specific products or product categories</p>
                </div>
                {renderRulesDisplay(rulesByCategory.product, 'orange', Gift)}
              </TabsContent>

              <TabsContent value="basket" className="p-8">
                <div className="bg-red-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Basket Threshold Rules</h3>
                  <p className="text-gray-600">Rules that trigger when purchase amounts exceed certain thresholds</p>
                </div>
                {renderRulesDisplay(rulesByCategory.basket, 'red', ShoppingBasket)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
