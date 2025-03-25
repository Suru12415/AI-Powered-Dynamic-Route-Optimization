import { ArrowUp, ArrowDown, Scale, BarChart2, Wallet, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type DashboardStats } from "@shared/schema";

interface StatsCardsProps {
  stats?: DashboardStats;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subValue: string;
  icon: React.ReactNode;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subValue, icon, trend }: StatCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 bg-opacity-20 rounded-md">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-slate-200">{title}</h3>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-mono font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-400">{subValue}</p>
          </div>
          <div className={cn(
            "flex items-center text-sm",
            trend.isPositive ? "text-green-400" : "text-red-400"
          )}>
            {trend.isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ stats, className }: StatsCardsProps) {
  if (!stats) return null;
  
  // Format numbers for display
  const formattedCO2 = stats.co2Savings.toFixed(2);
  const formattedEfficiency = `${stats.routeEfficiency.toFixed(1)}%`;
  const formattedSavings = `$${(stats.costSavings).toFixed(1)}K`;
  const formattedShipments = stats.activeShipments.toLocaleString();
  
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatCard
        title="CO2 Emissions Saved"
        value={formattedCO2}
        subValue="metric tons"
        icon={<Scale className="h-5 w-5 text-blue-500" />}
        trend={{ value: 12.4, isPositive: true }}
      />
      
      <StatCard
        title="Route Efficiency"
        value={formattedEfficiency}
        subValue="avg. optimization"
        icon={<BarChart2 className="h-5 w-5 text-cyan-500" />}
        trend={{ value: 5.2, isPositive: true }}
      />
      
      <StatCard
        title="Cost Savings"
        value={formattedSavings}
        subValue="monthly"
        icon={<Wallet className="h-5 w-5 text-amber-500" />}
        trend={{ value: 9.7, isPositive: true }}
      />
      
      <StatCard
        title="Active Shipments"
        value={formattedShipments}
        subValue="in transit"
        icon={<ClipboardList className="h-5 w-5 text-purple-500" />}
        trend={{ value: 2.1, isPositive: false }}
      />
    </div>
  );
}
