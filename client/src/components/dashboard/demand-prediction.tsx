import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { type DemandPrediction as DemandPredictionType, type RoutePrediction } from "@shared/schema";

interface DemandPredictionProps {
  demandPredictions: DemandPredictionType[];
  routePredictions: RoutePrediction[];
}

export default function DemandPrediction({ demandPredictions, routePredictions }: DemandPredictionProps) {
  const getPercentageClass = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-yellow-400";
  };
  
  const getConfidenceClass = (confidence: string) => {
    switch (confidence) {
      case "High":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-700 flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-semibold">AI Demand Prediction</CardTitle>
          <p className="text-xs text-slate-400">Next 30 days forecast</p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          className="text-xs h-8 px-2 bg-slate-900 text-slate-300 p-0 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {demandPredictions.map((prediction) => (
            <div key={prediction.id} className="bg-slate-900 p-3 rounded-lg flex flex-col">
              <div className="text-xs text-slate-400 mb-1">{prediction.region}</div>
              <div className={cn(
                "text-lg font-mono font-medium",
                getPercentageClass(prediction.percentageChange)
              )}>
                {prediction.percentageChange > 0 ? "+" : ""}{prediction.percentageChange}%
              </div>
              <div className={cn(
                "text-xs mt-auto",
                getConfidenceClass(prediction.confidence)
              )}>
                {prediction.confidence} confidence
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-300 mb-2">Top Predicted Routes</p>
          <div className="space-y-3">
            {routePredictions.map((prediction) => (
              <div key={prediction.id} className="p-2 rounded bg-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white">{prediction.route}</span>
                  <span className={cn(
                    "text-xs",
                    prediction.percentageChange > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {prediction.percentageChange > 0 ? "+" : ""}{prediction.percentageChange}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 bg-slate-700 rounded-sm overflow-hidden w-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-sm" 
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">{prediction.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-slate-700 bg-slate-900">
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs text-blue-500 hover:text-blue-400 p-0 h-auto"
        >
          Run Custom Forecast
        </Button>
      </CardFooter>
    </Card>
  );
}
