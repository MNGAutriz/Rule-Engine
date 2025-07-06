import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Dashboard from '@/pages/Dashboard';
import EventProcessor from '@/pages/EventProcessor';
import CampaignManager from '@/pages/CampaignManager';
import { Settings, Play, BarChart3, Menu, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'events' | 'campaigns'>('dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      {/* Enhanced Toggle Button - Fixed Position */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className={`bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:bg-white transition-all duration-300 transform hover:scale-110 ${
            sidebarOpen ? 'translate-x-64 lg:translate-x-0' : 'translate-x-0'
          }`}
        >
          {isMobile ? (
            sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />
          ) : (
            sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Enhanced Sidebar with smooth transitions */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-md border-r border-gray-200/50 z-40 
        transform transition-all duration-500 ease-in-out shadow-2xl
        ${sidebarOpen 
          ? 'translate-x-0 w-64' 
          : isMobile 
            ? '-translate-x-full w-64' 
            : 'translate-x-0 w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-500 to-orange-500 ${
          !sidebarOpen && !isMobile ? 'p-2' : ''
        }`}>
          {(sidebarOpen || isMobile) ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Rules Engine</h2>
              <p className="text-purple-100 text-sm">Loyalty Management</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <Settings className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600 hover:shadow-md hover:scale-102'
                } ${!sidebarOpen && !isMobile ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`${!sidebarOpen && !isMobile ? 'h-5 w-5' : 'h-5 w-5'} ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-500'
                }`} />
                {(sidebarOpen || isMobile) && (
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-purple-100' : 'text-gray-500 group-hover:text-purple-400'
                    } truncate`}>
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-gray-200/50 ${!sidebarOpen && !isMobile ? 'p-2' : ''}`}>
          {(sidebarOpen || isMobile) ? (
            <div className="text-center">
              <p className="text-xs text-gray-500">Version 2.0.0</p>
              <p className="text-xs text-gray-400 mt-1">Powered by React & Node.js</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
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
          {/* Content wrapper with padding to prevent overlap with toggle button */}
          <div className="pt-16 lg:pt-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
