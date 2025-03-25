import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EstimatedSavings() {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-base font-semibold">Estimated Savings</CardTitle>
            <p className="text-xs text-slate-400">Based on AI optimization</p>
          </div>
          <div className="text-xs text-slate-300">Monthly</div>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="relative w-[120px] h-[120px]">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="transparent" 
                stroke="#334155" 
                strokeWidth="8"
              />
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="transparent" 
                stroke="#0ea5e9" 
                strokeWidth="8" 
                strokeDasharray="339.3" 
                strokeDashoffset="84.8" 
                transform="rotate(-90 60 60)" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-mono font-semibold text-white">3.29</div>
              <div className="text-sm text-slate-400">Million USD</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-3 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Fuel Savings</p>
            <div className="text-lg font-mono font-medium text-blue-500">$1.25M</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Time Savings</p>
            <div className="text-lg font-mono font-medium text-cyan-500">$0.87M</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Maintenance</p>
            <div className="text-lg font-mono font-medium text-amber-500">$0.48M</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Labor</p>
            <div className="text-lg font-mono font-medium text-purple-500">$0.69M</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
