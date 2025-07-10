import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { consumersApi } from '@/services/api';
import { formatNumber } from '@/lib/utils';
import { 
  Search, 
  User, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award, 
  AlertCircle,
  CheckCircle,
  Gift,
  History,
  CreditCard,
  Globe,
  RefreshCw,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
  MinusCircle,
  PlusCircle
} from 'lucide-react';

interface ConsumerPoints {
  consumerId: string;
  total: number;
  available: number;
  used: number;
  pointsExpirationDate: string;
  expirationPolicy: string;
  market: string;
  timezone: string;
  transactionCount: number;
}

interface HistoryItem {
  eventId: string;
  eventType: string;
  timestamp: string;
  points?: number; // Direct points value from API
  pointsAwarded?: number;
  pointsUsed?: number;
  description: string;
  channel: string;
  ruleCategory?: string; // Rule category information
  ruleApplied?: string; // Specific rule that was applied
  ruleId?: string; // Rule ID for reference
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AvailableConsumer {
  consumerId: string;
  market: string;
  tier: string;
  totalPoints: number;
}

interface HistoryResponse {
  transactions: HistoryItem[];
  pagination: PaginationInfo;
}

const ConsumerQuery: React.FC = () => {
  const [consumerId, setConsumerId] = useState('');
  const [consumerData, setConsumerData] = useState<ConsumerPoints | null>(null);
  const [consumerHistory, setConsumerHistory] = useState<HistoryItem[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (page: number = 1) => {
    if (!consumerId.trim()) {
      setError('Please enter a Consumer ID');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Fetch consumer points and history in parallel - automatically using 5 items per page
      const [pointsResponse, historyResponse] = await Promise.all([
        consumersApi.getConsumerPoints(consumerId.trim()),
        consumersApi.getConsumerHistory(consumerId.trim(), page, 5)
      ]);

      setConsumerData(pointsResponse);
      
      // Handle different response formats from backend
      if (Array.isArray(historyResponse)) {
        // If backend returns array directly, create pagination info
        setConsumerHistory(historyResponse);
        setPaginationInfo({
          currentPage: page,
          totalPages: Math.ceil(historyResponse.length / 5),
          totalCount: historyResponse.length,
          limit: 5,
          hasNext: false,
          hasPrev: page > 1
        });
      } else if (historyResponse.transactions) {
        // If backend returns paginated response
        setConsumerHistory(historyResponse.transactions || []);
        setPaginationInfo(historyResponse.pagination || null);
      } else {
        // Fallback - treat as empty
        setConsumerHistory([]);
        setPaginationInfo(null);
      }
      
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch consumer data');
      setConsumerData(null);
      setConsumerHistory([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (page === currentPage || !consumerId.trim()) return;
    await handleSearch(page);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(1);
    }
  };

  const getExpirationStatus = (expirationDate: string) => {
    if (!expirationDate) return { status: 'unknown', color: 'gray', text: 'No expiration data' };
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', color: 'red', text: 'Expired' };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'warning', color: 'orange', text: `Expires in ${daysUntilExpiration} days` };
    } else {
      return { status: 'active', color: 'green', text: `Expires in ${daysUntilExpiration} days` };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMarketFlag = (market: string) => {
    const flags: { [key: string]: string } = {
      'HK': '🇭🇰',
      'JP': '🇯🇵',
      'TW': '🇹🇼',
      'ALL': '🌍'
    };
    return flags[market] || '🌍';
  };

  const renderPaginationButtons = () => {
    if (!paginationInfo || paginationInfo.totalPages <= 1) return null;

    const buttons = [];
    const { currentPage: page, totalPages, hasPrev, hasNext } = paginationInfo;
    const maxVisiblePages = 5;
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={!hasPrev || loading}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          !hasPrev || loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </button>
    );

    // Calculate page range
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          disabled={loading}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      buttons.push(
        <button
          key={pageNum}
          onClick={() => handlePageChange(pageNum)}
          disabled={loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            page === pageNum
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {pageNum}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          disabled={loading}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={!hasNext || loading}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          !hasNext || loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-8 bg-white rounded-lg shadow-sm mx-4 my-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-700 mb-4 shadow-lg">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700 tracking-tight">
            Consumer Query Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Look up consumer points, expiration dates, and transaction history
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-2 border-blue-400 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader style={{ backgroundColor: '#0072bb' }} className="text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Search className="mr-3 h-6 w-6" />
              Consumer Lookup
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter a Consumer ID to view their points and transaction history
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="consumerId" className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  Consumer ID
                </Label>
                <Input
                  id="consumerId"
                  type="text"
                  value={consumerId}
                  onChange={(e) => setConsumerId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Consumer ID (e.g., user123)"
                  className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={() => handleSearch(1)}
                disabled={loading || !consumerId.trim()}
                style={{ backgroundColor: '#0072bb' }}
                className="text-white hover:opacity-90 shadow-lg px-8 py-3 h-12 font-semibold"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Search className="mr-2 h-5 w-5" />
                )}
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Overview - Show when no search has been performed */}
        {!hasSearched && !loading && (
          <div className="space-y-8">
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-800">Points & Balance</CardTitle>
                  <CardDescription className="text-blue-600">
                    View comprehensive points data including total earned, available balance, and used points with real-time calculations
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-green-800">Transaction History</CardTitle>
                  <CardDescription className="text-green-600">
                    Complete chronological record of all consumer activities with detailed breakdowns and pagination support
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-purple-800">Expiration Tracking</CardTitle>
                  <CardDescription className="text-purple-600">
                    Monitor points expiration dates, policies, and status with intelligent alerts and market-specific rules
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Instructions */}
            <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center text-gray-800 text-xl">
                  <Info className="mr-3 h-6 w-6" />
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Enter Consumer ID</h4>
                        <p className="text-sm text-gray-600">Type any valid Consumer ID in the search field above</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">View Comprehensive Data</h4>
                        <p className="text-sm text-gray-600">Access detailed points information, market details, and expiration status</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Explore Transaction History</h4>
                        <p className="text-sm text-gray-600">Browse through paginated transaction records with detailed breakdowns</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Monitor Expiration</h4>
                        <p className="text-sm text-gray-600">Track points expiration dates and understand policy implications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg text-gray-600">Loading consumer data...</span>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !loading && !consumerData && !error && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Consumer Not Found</h3>
              <p className="text-gray-500">The Consumer ID you entered was not found in our system.</p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {consumerData && (
          <div className="space-y-8">
            {/* Consumer Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Points */}
              <Card className="border-2 border-orange-400 hover:border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-orange-100 pb-3 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-200 rounded-lg">
                      <Award className="h-5 w-5 text-orange-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-orange-800">Total Points</CardTitle>
                      <CardDescription className="text-sm text-orange-800 opacity-70">All time earned</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-orange-800">
                    {consumerData.total.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Available Points */}
              <Card className="border-2 border-emerald-400 hover:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-emerald-100 pb-3 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-200 rounded-lg">
                      <Gift className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-emerald-800">Available Points</CardTitle>
                      <CardDescription className="text-sm text-emerald-800 opacity-70">Ready to use</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-emerald-800">
                    {consumerData.available.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Used Points */}
              <Card className="border-2 border-purple-400 hover:border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-purple-100 pb-3 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-purple-800">Used Points</CardTitle>
                      <CardDescription className="text-sm text-purple-800 opacity-70">Redeemed</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-800">
                    {consumerData.used.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card className="border-2 border-red-400 hover:border-red-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-red-100 pb-3 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-200 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-red-800">Transactions</CardTitle>
                      <CardDescription className="text-sm text-red-800 opacity-70">Total count</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-red-800">
                    {consumerData.transactionCount}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consumer Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Points Expiration */}
              <Card className="border-2 border-yellow-400 hover:border-yellow-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-yellow-100 pb-3 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl text-yellow-800">
                    <Clock className="mr-3 h-6 w-6" />
                    Points Expiration
                  </CardTitle>
                  <CardDescription className="text-yellow-800 opacity-70">
                    Expiration details and policy
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {consumerData.pointsExpirationDate ? (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <span className="font-medium text-gray-700">Next Expiration Date</span>
                        <span className="font-bold text-yellow-800">
                          {formatDate(consumerData.pointsExpirationDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <span className="font-medium text-gray-700">Status</span>
                        <div className="flex items-center">
                          {(() => {
                            const status = getExpirationStatus(consumerData.pointsExpirationDate);
                            const StatusIcon = status.status === 'expired' ? AlertCircle : 
                                             status.status === 'warning' ? Clock : CheckCircle;
                            return (
                              <>
                                <StatusIcon className={`h-5 w-5 text-${status.color}-500 mr-2`} />
                                <span className={`font-bold text-${status.color}-700`}>
                                  {status.text}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <span className="font-medium text-gray-700">Expiration Policy</span>
                        <span className="font-medium text-gray-800">
                          {consumerData.expirationPolicy}
                        </span>
                      </div>
                    </>
                  ) : (
                     <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No expiration data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Market & Location */}
              <Card className="border-2 border-blue-400 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-blue-100 pb-3 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl text-blue-800">
                    <Globe className="mr-3 h-6 w-6" />
                    Market Information
                  </CardTitle>
                  <CardDescription className="text-blue-800 opacity-70">
                    Geographic and timezone details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="font-medium text-gray-700 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Market
                    </span>
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getMarketFlag(consumerData.market)}</span>
                      <span className="font-bold text-blue-800">{consumerData.market}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <span className="font-medium text-gray-700 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Timezone
                    </span>
                    <span className="font-medium text-gray-800">
                      {consumerData.timezone || 'Asia/Tokyo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <span className="font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Consumer ID
                    </span>
                    <span className="font-bold text-gray-800 font-mono">
                      {consumerData.consumerId}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History with Pagination */}
            <Card className="border-2 border-indigo-400 hover:border-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-indigo-100 pb-3 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center text-xl text-indigo-800">
                      <History className="mr-3 h-6 w-6" />
                      Transaction History
                    </CardTitle>
                    <CardDescription className="text-indigo-800 opacity-70">
                      Complete points activity and events
                      {paginationInfo && ` (${paginationInfo.totalCount} total transactions)`}
                    </CardDescription>
                  </div>
                  {paginationInfo && paginationInfo.totalPages > 1 && (
                    <div className="text-sm text-indigo-700">
                      Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {consumerHistory.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {consumerHistory.map((item, index) => {
                        // Handle different API response formats
                        let pointsValue = 0;
                        let isPositive = false;
                        let isNegative = false;

                        // Special handling for REDEMPTION transactions - always show as negative/red
                        if (item.eventType === 'REDEMPTION') {
                          // For redemptions, show as negative points deducted
                          if (item.pointsUsed && item.pointsUsed > 0) {
                            pointsValue = item.pointsUsed;
                          } else if (item.pointsAwarded && item.pointsAwarded > 0) {
                            pointsValue = item.pointsAwarded; // Use awarded amount but show as negative
                          } else if (item.points && Math.abs(item.points) > 0) {
                            pointsValue = Math.abs(item.points);
                          } else {
                            // Fallback: try to extract from description or use a default
                            pointsValue = 100; // Default value for redemptions if no points data available
                          }
                          isNegative = true;
                          isPositive = false;
                        } else {
                          // Original logic for non-redemption transactions
                          if (typeof item.points !== 'undefined') {
                            pointsValue = Math.abs(item.points);
                            isPositive = item.points > 0;
                            isNegative = item.points < 0;
                          } else {
                            const pointsAwarded = item.pointsAwarded || 0;
                            const pointsUsed = item.pointsUsed || 0;
                            isPositive = pointsAwarded > 0;
                            isNegative = pointsUsed > 0;
                            pointsValue = isPositive ? pointsAwarded : pointsUsed;
                          }
                        }
                        
                        return (
                          <div
                            key={item.eventId || `${currentPage}-${index}`}
                            className="flex items-start justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                              <div className={`p-2 rounded-full flex-shrink-0 ${
                                isPositive ? 'bg-green-100' : isNegative ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                {isPositive ? (
                                  <PlusCircle className="h-5 w-5 text-green-600" />
                                ) : isNegative ? (
                                  <MinusCircle className="h-5 w-5 text-red-600" />
                                ) : (
                                  <Activity className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-base mb-1">
                                  {item.eventType}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(item.timestamp)}
                                </div>
                                {/* Rule information - show rule category or rule applied if available */}
                                {(item.ruleCategory || item.ruleApplied || item.ruleId) && (
                                  <div className="text-xs text-blue-600 mt-1 font-medium">
                                    {item.ruleCategory && `Category: ${item.ruleCategory}`}
                                    {item.ruleApplied && `Rule: ${item.ruleApplied}`}
                                    {!item.ruleCategory && !item.ruleApplied && item.ruleId && `Rule ID: ${item.ruleId}`}
                                  </div>
                                )}
                                {/* Fallback: extract rule info from description if available */}
                                {!item.ruleCategory && !item.ruleApplied && !item.ruleId && item.description && item.description.includes('Rule') && (
                                  <div className="text-xs text-blue-600 mt-1 font-medium">
                                    {item.description.substring(0, 50)}...
                                  </div>
                                )}
                                {/* Channel information */}
                                {item.channel && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Channel: {item.channel}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4 min-w-[160px]">
                              {(pointsValue > 0 || item.eventType === 'REDEMPTION') ? (
                                <>
                                  <div className={`font-bold text-xl ${
                                    isPositive ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {isPositive ? '+' : '-'}{formatNumber(pointsValue)}
                                  </div>
                                  <div className={`text-sm mt-1 font-semibold px-2 py-1 rounded-full ${
                                    isPositive 
                                      ? 'text-green-700 bg-green-100' 
                                      : 'text-red-700 bg-red-100'
                                  }`}>
                                    {isPositive 
                                      ? 'POINTS EARNED' 
                                      : (item.eventType === 'REDEMPTION' ? 'POINTS REDUCED' : 'POINTS DEDUCTED')
                                    }
                                  </div>
                                  {/* Enhanced transaction description */}
                                  {(isNegative || item.eventType === 'REDEMPTION') && (
                                    <div className="text-xs text-red-600 mt-1 font-bold">
                                      {item.eventType === 'REDEMPTION' 
                                        ? `${formatNumber(pointsValue)} Points Reduced` 
                                        : 'Transaction Deduction'
                                      }
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">No change</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination */}
                    {paginationInfo && paginationInfo.totalPages > 1 && (
                      <div className="mt-6 flex justify-center items-center space-x-2">
                        {renderPaginationButtons()}
                      </div>
                    )}

                    {/* Summary info */}
                    {paginationInfo && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-indigo-700">
                            Showing {((paginationInfo.currentPage - 1) * paginationInfo.limit) + 1}-{Math.min(paginationInfo.currentPage * paginationInfo.limit, paginationInfo.totalCount)} of {paginationInfo.totalCount} transactions
                          </span>
                          <span className="text-indigo-600">
                            5 items per page
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Transaction History</h3>
                    <p className="text-gray-500">No transactions found for this consumer.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerQuery;
