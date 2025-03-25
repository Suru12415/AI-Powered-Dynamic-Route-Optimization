import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { type CO2Saving } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EmissionsChartProps {
  co2Data: CO2Saving[];
}

export default function EmissionsChart({ co2Data }: EmissionsChartProps) {
  // Format data for the chart
  const chartData = co2Data.map(item => ({
    name: item.month,
    saved: item.amount,
    target: item.target
  }));
  
  // Get current month's data if available
  const currentMonthIndex = new Date().getMonth();
  const currentMonthData = co2Data.find(item => 
    item.month === ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonthIndex]
  );
  
  // Calculate YTD reduction
  const ytdReduction = co2Data
    .filter(item => {
      const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(item.month);
      return monthIndex <= currentMonthIndex;
    })
    .reduce((sum, item) => sum + item.amount, 0);
  
  // Get target for current year
  const yearlyTarget = co2Data.reduce((sum, item) => sum + item.target, 0);

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-700 flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-semibold">CO2 Emissions Reduction</CardTitle>
          <p className="text-xs text-slate-400">Monthly tracking of emissions saved</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-8 px-2 rounded hover:bg-slate-700 text-slate-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tickFormatter={(value) => `${value} t`}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#334155',
                  color: '#f8fafc',
                  fontSize: '12px',
                  borderRadius: '4px'
                }}
                itemStyle={{ color: '#f8fafc' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <defs>
                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line 
                type="monotone" 
                dataKey="saved" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ r: 4, stroke: '#0ea5e9', strokeWidth: 2, fill: '#0f172a' }}
                activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2, fill: '#0f172a' }}
                name="Emissions Saved"
                fillOpacity={1}
                fill="url(#colorSaved)"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#f59e0b" 
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-3 divide-x divide-slate-700 border-t border-slate-700 p-0">
        <div className="py-3 px-4">
          <p className="text-xs text-slate-400">Current Month</p>
          <p className="text-lg font-mono font-medium text-blue-500">
            {currentMonthData ? `${currentMonthData.amount.toFixed(1)} tons` : "0.0 tons"}
          </p>
        </div>
        <div className="py-3 px-4">
          <p className="text-xs text-slate-400">YTD Reduction</p>
          <p className="text-lg font-mono font-medium text-green-400">
            {ytdReduction.toFixed(1)} tons
          </p>
        </div>
        <div className="py-3 px-4">
          <p className="text-xs text-slate-400">Target 2023</p>
          <p className="text-lg font-mono font-medium text-amber-500">
            {yearlyTarget.toFixed(1)} tons
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
