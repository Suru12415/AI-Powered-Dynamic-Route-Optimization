import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Route } from "@shared/schema";

interface RouteOptimizationControlsProps {
  routes: Route[];
}

export default function RouteOptimizationControls({ routes }: RouteOptimizationControlsProps) {
  const [optimizationLevel, setOptimizationLevel] = useState(85);
  const [co2Priority, setCO2Priority] = useState<"Low" | "Medium" | "High">("High");
  const [aiAssistance, setAIAssistance] = useState(true);
  const [trafficAdaptation, setTrafficAdaptation] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(routes[0]?.id || null);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();
  
  const handleOptimizationChange = (value: number[]) => {
    setOptimizationLevel(value[0]);
  };
  
  const getOptimizationText = (level: number): string => {
    if (level < 33) return "Low";
    if (level < 66) return "Medium";
    return "High";
  };
  
  const handleOptimize = async () => {
    if (!selectedRouteId) {
      toast({
        title: "No route selected",
        description: "Please select a route to optimize",
        variant: "destructive"
      });
      return;
    }
    
    setIsOptimizing(true);
    
    try {
      await apiRequest("POST", "/api/optimize-route", {
        routeId: selectedRouteId,
        optimizationLevel,
        co2Priority,
        aiAssistance,
        trafficAdaptation
      });
      
      await queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      
      toast({
        title: "Optimization applied",
        description: "The route has been successfully optimized",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-700">
        <CardTitle className="text-base font-semibold">Route Optimization Controls</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-slate-300">Optimization Level</Label>
            <span className="text-xs font-mono font-medium text-blue-500">{optimizationLevel}%</span>
          </div>
          <Slider
            value={[optimizationLevel]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleOptimizationChange}
            className="w-full h-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-slate-300">CO2 Reduction Priority</Label>
            <span className="text-xs font-mono font-medium text-blue-500">{co2Priority}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={co2Priority === "Low" ? "default" : "outline"} 
              size="sm" 
              className={co2Priority === "Low" 
                ? "text-xs py-1.5 rounded bg-blue-600 text-white" 
                : "text-xs py-1.5 rounded bg-slate-900 text-slate-300"
              }
              onClick={() => setCO2Priority("Low")}
            >
              Low
            </Button>
            <Button 
              variant={co2Priority === "Medium" ? "default" : "outline"} 
              size="sm" 
              className={co2Priority === "Medium" 
                ? "text-xs py-1.5 rounded bg-blue-600 text-white" 
                : "text-xs py-1.5 rounded bg-slate-900 text-slate-300"
              }
              onClick={() => setCO2Priority("Medium")}
            >
              Medium
            </Button>
            <Button 
              variant={co2Priority === "High" ? "default" : "outline"} 
              size="sm" 
              className={co2Priority === "High" 
                ? "text-xs py-1.5 rounded bg-blue-600 text-white" 
                : "text-xs py-1.5 rounded bg-slate-900 text-slate-300"
              }
              onClick={() => setCO2Priority("High")}
            >
              High
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-slate-300">AI Assistance</Label>
            <span className="text-xs text-blue-500">
              <Info className="h-4 w-4 inline-block" />
            </span>
          </div>
          <div className="flex items-center mb-3 bg-slate-900 p-3 rounded-md">
            <Checkbox 
              id="ai-routes" 
              checked={aiAssistance}
              onCheckedChange={(checked) => setAIAssistance(checked as boolean)}
              className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor="ai-routes" className="ml-2 text-xs text-slate-300">
              Enable AI route suggestions
            </Label>
          </div>
          <div className="flex items-center bg-slate-900 p-3 rounded-md">
            <Checkbox 
              id="traffic-adapt" 
              checked={trafficAdaptation}
              onCheckedChange={(checked) => setTrafficAdaptation(checked as boolean)}
              className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor="traffic-adapt" className="ml-2 text-xs text-slate-300">
              Real-time traffic adaptation
            </Label>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-slate-300">Select Route</Label>
          </div>
          <select 
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-sm"
            value={selectedRouteId || ""}
            onChange={(e) => setSelectedRouteId(Number(e.target.value))}
          >
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.name} ({route.transportType})
              </option>
            ))}
          </select>
        </div>

        <Button 
          className="w-full py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          disabled={isOptimizing}
          onClick={handleOptimize}
        >
          {isOptimizing ? "Optimizing..." : "Apply Optimization"}
        </Button>
      </CardContent>
    </Card>
  );
}
