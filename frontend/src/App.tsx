import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Dashboard from '@/pages/Dashboard';
import EventProcessor from '@/pages/EventProcessor';
import CampaignManager from '@/pages/CampaignManager';
import ConsumerAnalytics from '@/pages/ConsumerAnalytics';
import { Settings, Play, BarChart3, Menu, Users, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'events' | 'campaigns' | 'consumers'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      name: 'Consumer Analytics',
      icon: Users,
      description: 'Consumer insights'
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
        return <ConsumerAnalytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rules Engine</h1>
              <p className="text-sm text-gray-500">Loyalty Program</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => {
                    setCurrentPage(item.id as any);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Backend:</span>
                <span className="text-green-600">✓ Online</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Rules Engine:</span>
                <span className="text-green-600">✓ Running</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="min-h-screen">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
