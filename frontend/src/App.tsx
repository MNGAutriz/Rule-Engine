import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Dashboard from '@/pages/Dashboard';
import EventProcessor from '@/pages/EventProcessor';
import CampaignManager from '@/pages/CampaignManager';
import ConsumerQuery from '@/pages/ConsumerQuery';
import { Crown, Play, BarChart3, Menu, Calendar, X, Users } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'events' | 'campaigns' | 'consumers'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Rules overview and management'
    },
    {
      id: 'events',
      name: 'Event Processor',
      icon: Play,
      description: 'Test event processing'
    },
    {
      id: 'campaigns',
      name: 'Campaigns',
      icon: Calendar,
      description: 'Campaign management'
    },
    {
      id: 'consumers',
      name: 'Consumer Query',
      icon: Users,
      description: 'Consumer data lookup'
    }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <EventProcessor />;
      case 'campaigns':
        return <CampaignManager />;
      case 'consumers':
        return <ConsumerQuery />;
      default:
        return <Dashboard />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (pageId: string) => {
    setCurrentPage(pageId as any);
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      {/* Enhanced Sidebar with smooth transitions */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 
        transform transition-all duration-500 ease-in-out shadow-lg
        ${sidebarOpen 
          ? 'translate-x-0 w-64' 
          : isMobile 
            ? '-translate-x-full w-64' 
            : 'translate-x-0 w-16'
        }`}
      >
        {/* Sidebar Content */}
        <div className={`h-full flex flex-col transition-all duration-300 ${!sidebarOpen && !isMobile ? 'items-center' : ''}`}>
          {/* Header with clickable wrench for toggle */}
          <div className={`p-6 border-b border-gray-100 ${!sidebarOpen && !isMobile ? 'p-3' : ''}`}>
            <div className={`flex items-center ${!sidebarOpen && !isMobile ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative group">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
                >
                  <Crown className="h-6 w-6 text-blue-700 drop-shadow-sm group-hover:text-blue-800 transition-colors duration-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </button>
              </div>
              {(sidebarOpen || isMobile) && (
                <div className="overflow-hidden transition-all duration-300">
                  <h1 className="text-xl font-bold text-blue-700 tracking-tight">
                    Loyalty Engine
                  </h1>
                  <p className="text-sm text-blue-600 font-medium">Rules Management</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 pb-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`w-full group relative overflow-hidden transition-all duration-300 cursor-pointer mb-2 rounded-lg
                    ${!sidebarOpen && !isMobile 
                      ? 'h-12 w-12 p-3 justify-center flex items-center mx-auto' 
                      : 'h-16 p-4 justify-start flex items-center'
                    }
                    ${isActive 
                      ? 'bg-blue-700 text-white shadow-lg hover:bg-blue-800' 
                      : 'hover:bg-blue-50 hover:shadow-md text-gray-700 hover:text-blue-700'
                    }`}
                    onClick={() => handlePageChange(item.id)}
                    title={!sidebarOpen && !isMobile ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                      sidebarOpen || isMobile ? 'mr-4' : ''
                    } ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-700'}`} />
                    {(sidebarOpen || isMobile) && (
                      <div className="text-left flex-1 min-w-0">
                        <div className={`font-semibold truncate transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-800 group-hover:text-blue-700'
                        }`}>{item.name}</div>
                        <div className={`text-xs truncate transition-colors duration-300 ${
                          isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-500'
                        }`}>{item.description}</div>
                      </div>
                    )}
                    {/* Perfect square active indicator for collapsed sidebar */}
                    {isActive && !sidebarOpen && !isMobile && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 rounded-r-sm"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Status - Only show when sidebar is open */}
          {(sidebarOpen || isMobile) && (
            <div className="p-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-800 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Backend:</span>
                    <span className="text-green-600 font-semibold">✓ Online</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Rules Engine:</span>
                    <span className="text-green-600 font-semibold">✓ Running</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                    <div className="bg-blue-600 h-1 rounded-full w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content with enhanced transitions */}
      <div 
        className={`min-h-screen transition-all duration-500 ease-in-out ${
          sidebarOpen && !isMobile ? 'ml-64' : isMobile ? 'ml-0' : 'ml-16'
        }`}
      >
        <main className="relative">
          {/* Content wrapper */}
          <div className="p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
