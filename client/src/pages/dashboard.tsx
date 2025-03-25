import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import GlobeVisualization from "@/components/dashboard/globe-visualization";
import EmissionsChart from "@/components/dashboard/emissions-chart";
import RouteOptimizationTable from "@/components/dashboard/route-optimization-table";
import EstimatedSavings from "@/components/dashboard/estimated-savings";
import DemandPrediction from "@/components/dashboard/demand-prediction";
import RouteOptimizationControls from "@/components/dashboard/route-optimization-controls";
import RouteDetails from "@/components/dashboard/route-details";
import { Search, Bell, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type DashboardStats, type Route, type CO2Saving, type DemandPrediction as DemandPredictionType, type RoutePrediction } from "@shared/schema";

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard-stats'],
  });
  
  const { data: routes, isLoading: isLoadingRoutes } = useQuery<Route[]>({
    queryKey: ['/api/routes'],
  });
  
  const { data: co2Savings, isLoading: isLoadingCO2 } = useQuery<CO2Saving[]>({
    queryKey: ['/api/co2-savings'],
  });
  
  const { data: demandPredictions, isLoading: isLoadingDemand } = useQuery<DemandPredictionType[]>({
    queryKey: ['/api/demand-predictions'],
  });
  
  const { data: routePredictions, isLoading: isLoadingRoutePredictions } = useQuery<RoutePrediction[]>({
    queryKey: ['/api/route-predictions'],
  });

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleRouteUpdated = (updatedRoute: Route) => {
    if (routes) {
      // Update the routes cache with the new data
      const updatedRoutes = routes.map(r => 
        r.id === updatedRoute.id ? updatedRoute : r
      );
      
      queryClient.setQueryData(['/api/routes'], updatedRoutes);
      
      // Also update the selected route
      setSelectedRoute(updatedRoute);
    }
  };

  const isLoading = isLoadingStats || isLoadingRoutes || isLoadingCO2 || isLoadingDemand || isLoadingRoutePredictions;
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900 text-slate-100">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar onClose={() => setShowSidebar(false)} />
      )}
      
      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 py-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!showSidebar && (
              <button 
                onClick={() => setShowSidebar(true)}
                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-semibold">Dashboard Overview</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="py-1.5 px-4 pr-9 rounded-md bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-48 md:w-64"
              />
              <Search className="h-4 w-4 text-slate-400 absolute top-1/2 transform -translate-y-1/2 right-3" />
            </div>
            <button className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-blue-600">
                <span className="text-white font-medium text-sm">JD</span>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 h-[calc(100vh-61px)] overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <StatsCards 
                stats={dashboardStats} 
                className="mb-6" 
              />

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Globe Visualization */}
                  <GlobeVisualization routes={routes || []} />

                  {/* CO2 Emissions Chart */}
                  <EmissionsChart co2Data={co2Savings || []} />

                  {/* Route Optimization Table */}
                  <RouteOptimizationTable 
                    routes={routes || []} 
                    onRouteClick={handleRouteClick}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Estimated Savings */}
                  <EstimatedSavings />

                  {/* AI Demand Prediction */}
                  <DemandPrediction 
                    demandPredictions={demandPredictions || []}
                    routePredictions={routePredictions || []}
                  />

                  {/* Route Optimization */}
                  <RouteOptimizationControls routes={routes || []} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Route Details Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="max-w-3xl p-0 bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full" 
                onClick={() => setSelectedRoute(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>Route Details</DialogTitle>
            </div>
          </DialogHeader>
          {selectedRoute && (
            <div className="p-6 pt-0">
              <RouteDetails 
                route={selectedRoute} 
                onRouteUpdated={handleRouteUpdated} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
