import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Route } from "@shared/schema";

interface RouteOptimizationTableProps {
  routes: Route[];
}

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-32">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-slate-400">Efficiency</span>
      <span className="text-xs text-blue-500 font-medium">{value}%</span>
    </div>
    <div className="h-1 bg-slate-700 rounded-sm overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-sm" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-green-500";
  let textColor = "text-green-400";
  
  if (status === "Delayed") {
    bgColor = "bg-amber-500";
    textColor = "text-amber-400";
  } else if (status === "Planning") {
    bgColor = "bg-blue-500";
    textColor = "text-blue-400";
  }
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-medium",
      `${bgColor} bg-opacity-20 ${textColor}`
    )}>
      {status}
    </span>
  );
}

export default function RouteOptimizationTable({ routes }: RouteOptimizationTableProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-700 flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-semibold">Route Optimization</CardTitle>
          <p className="text-xs text-slate-400">Top performing routes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8 px-2 bg-slate-900 hover:bg-slate-700 text-slate-300"
          >
            Last Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2 bg-slate-900 hover:bg-slate-700 text-slate-300 p-0 w-8"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Route</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Distance</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Optimization</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">CO2 Saved</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {routes.map((route) => (
              <tr key={route.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0 rounded bg-blue-500 bg-opacity-10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{route.name}</p>
                      <p className="text-xs text-slate-400">{route.transportType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="font-mono text-slate-200">{route.distance.toLocaleString()} km</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ProgressBar value={route.efficiency} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-mono text-green-400 font-medium">{route.co2Saved.toFixed(2)} tons</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={route.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <CardFooter className="px-4 py-3 border-t border-slate-700 bg-slate-900">
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs text-blue-500 hover:text-blue-400 p-0 h-auto"
        >
          View All Routes
        </Button>
      </CardFooter>
    </Card>
  );
}
