import { Link, useLocation } from "wouter";
import { Globe, Zap, Shield, LightbulbIcon, BarChartHorizontal, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  const NavItem = ({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) => {
    const isActive = location === href;
    
    return (
      <li>
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-slate-300 hover:text-white cursor-pointer",
          isActive ? "bg-blue-600 bg-opacity-20 text-blue-400" : "hover:bg-slate-700"
        )} onClick={() => window.location.href = href}>
          <Icon className="h-5 w-5" />
          {children}
        </div>
      </li>
    );
  };

  return (
    <div className="w-full md:w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col h-screen md:h-auto">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-7 h-7 text-blue-500" />
          <h1 className="text-xl font-bold text-white">
            <span className="text-blue-500">Eco</span>Logistics
          </h1>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="p-2 flex-grow overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-3">Dashboard</p>
          <NavItem href="/" icon={BarChartHorizontal}>
            Overview
          </NavItem>
        </div>
        
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-3">Logistics</p>
          <ul className="space-y-1">
            <NavItem href="/routes" icon={Globe}>
              Route Optimization
            </NavItem>
            <NavItem href="/emissions" icon={Zap}>
              Emission Tracking
            </NavItem>
            <NavItem href="/fleet" icon={Shield}>
              Fleet Management
            </NavItem>
          </ul>
        </div>
        
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 px-3">AI Tools</p>
          <ul className="space-y-1">
            <NavItem href="/predictions" icon={LightbulbIcon}>
              Demand Prediction
            </NavItem>
            <NavItem href="/risk" icon={BarChartHorizontal}>
              Risk Assessment
            </NavItem>
          </ul>
        </div>
      </nav>
      
      <div className="mt-auto p-4 border-t border-slate-700">
        <div className="bg-slate-900 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-green-500 bg-opacity-20 rounded-md">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm font-medium text-white">System Status</p>
          </div>
          <p className="text-xs text-slate-400">All systems operational</p>
        </div>
      </div>
    </div>
  );
}
