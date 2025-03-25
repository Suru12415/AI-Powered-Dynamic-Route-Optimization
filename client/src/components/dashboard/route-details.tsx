import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, MapPin, Truck, Leaf, LineChart, BarChart3 } from "lucide-react";
import { Route } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateCO2Emissions, calculateEnvironmentalImpactScore, co2ToTreesEquivalent } from "@/lib/utils/co2";

interface RouteDetailsProps {
  route: Route;
  onRouteUpdated: (route: Route) => void;
}

export default function RouteDetails({ route, onRouteUpdated }: RouteDetailsProps) {
  const { toast } = useToast();
  const [optimizationLevel, setOptimizationLevel] = useState(85);
  const [co2Priority, setCO2Priority] = useState<"Low" | "Medium" | "High">("High");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Environmental impact metrics
  const environmentalScore = calculateEnvironmentalImpactScore(route.co2Saved, route.distance);
  const equivalentTrees = co2ToTreesEquivalent(route.co2Saved);
  const originalEmissions = calculateCO2Emissions(route.distance * 1.25, route.transportType);
  const currentEmissions = calculateCO2Emissions(route.distance, route.transportType);
  const emissionsReduction = ((originalEmissions - currentEmissions) / originalEmissions) * 100;

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      interface OptimizeRouteResponse {
        success: boolean;
        route: Route;
        usesFallback?: boolean;
        error?: { message: string };
        optimizationDetails?: {
          distanceReduction: number;
          efficiencyImprovement: number;
          additionalCO2Saved: number;
        };
      }
      
      const response = await apiRequest<OptimizeRouteResponse>({
        method: "POST",
        url: "/api/optimize-route",
        data: {
          routeId: route.id,
          optimizationLevel,
          co2Priority
        }
      });

      if (response.success) {
        onRouteUpdated(response.route);
        toast({
          title: "Route optimized",
          description: "The route has been successfully optimized.",
          variant: "default"
        });

        if (response.usesFallback) {
          toast({
            title: "Using simulation mode",
            description: response.error?.message || "Google Maps API not available. Using fallback simulation.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Failed to optimize route:", error);
      toast({
        title: "Optimization failed",
        description: "Failed to optimize the route. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{route.name}</CardTitle>
            <CardDescription>
              {route.transportType} • {Math.round(route.distance)} km
            </CardDescription>
          </div>
          <Badge variant={route.optimized ? "default" : "outline"}>
            {route.optimized ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Optimized
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Not Optimized
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Origin</div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{route.origin}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Destination</div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{route.destination}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Transport</div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{route.transportType}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Distance</div>
                <div className="flex items-center">
                  <span className="font-medium">{route.distance.toFixed(1)} km</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="flex items-center">
                  <span className="font-medium">{route.status}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Efficiency</div>
                <div className="flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{route.efficiency.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 border rounded-lg p-3">
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">{route.co2Saved.toFixed(2)} tons</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="environmental" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Environmental Impact Score</div>
                <div className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-xl font-bold">{environmentalScore.toFixed(1)}/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on CO₂ saved and route efficiency
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Equivalent to</div>
                <div className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-xl font-bold">{equivalentTrees.toFixed(0)} trees</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Planted and grown for 10 years
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col space-y-2 p-3 border rounded-lg">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">Emissions Reduction</div>
                  <div className="text-sm font-medium text-green-500">{emissionsReduction.toFixed(1)}%</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 rounded-full h-2" 
                    style={{ width: `${Math.min(100, emissionsReduction)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Original: {originalEmissions.toFixed(2)} tons → Current: {currentEmissions.toFixed(2)} tons
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 p-3 border rounded-lg">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">Route Efficiency</div>
                  <div className="text-sm font-medium text-primary">{route.efficiency.toFixed(1)}%</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: `${route.efficiency}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 p-3 border rounded-lg">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">CO₂ Saved</div>
                  <div className="text-sm font-medium text-green-500">{route.co2Saved.toFixed(2)} tons</div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    That's {(route.co2Saved * 1000).toFixed(0)} kg of CO₂ not released into the atmosphere
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="optimize" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Optimization Level</div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`px-3 py-1 rounded-md ${optimizationLevel === 65 ? 'bg-primary text-white' : 'bg-muted'}`}
                    onClick={() => setOptimizationLevel(65)}
                  >
                    Low
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md ${optimizationLevel === 85 ? 'bg-primary text-white' : 'bg-muted'}`}
                    onClick={() => setOptimizationLevel(85)}
                  >
                    Medium
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md ${optimizationLevel === 95 ? 'bg-primary text-white' : 'bg-muted'}`}
                    onClick={() => setOptimizationLevel(95)}
                  >
                    High
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">CO₂ Priority</div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`px-3 py-1 rounded-md ${co2Priority === 'Low' ? 'bg-primary text-white' : 'bg-muted'}`}
                    onClick={() => setCO2Priority("Low")}
                  >
                    Low
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md ${co2Priority === 'Medium' ? 'bg-primary text-white' : 'bg-muted'}`}
                    onClick={() => setCO2Priority("Medium")}
                  >
                    Medium
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md ${co2Priority === 'High' ? 'bg-primary text-white' : 'bg-muted'}`}
                    onClick={() => setCO2Priority("High")}
                  >
                    High
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  className="w-full" 
                  disabled={isOptimizing || (route.optimized && optimizationLevel === 85 && co2Priority === "High")}
                  onClick={handleOptimize}
                >
                  {isOptimizing ? "Optimizing..." : route.optimized ? "Re-optimize Route" : "Optimize Route"}
                </Button>
                {route.optimized && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This route is already optimized. Re-optimizing may yield different results.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}