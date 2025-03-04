
import React from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ExpenseChart: React.FC = () => {
  const { state, getCategoryById } = useExpense();
  const { summary, categories } = state;
  
  // Transform summary data for chart
  const chartData = Object.entries(summary.categories).map(([categoryId, amount]) => {
    const category = getCategoryById(categoryId);
    return {
      name: category?.name || 'Uncategorized',
      value: amount,
      color: category?.color || '#999'
    };
  });
  
  // Sort by amount (descending)
  chartData.sort((a, b) => b.value - a.value);
  
  // Only show top 5 categories, combine others
  const displayData = chartData.length > 5 
    ? [
        ...chartData.slice(0, 4),
        {
          name: 'Others',
          value: chartData.slice(4).reduce((sum, item) => sum + item.value, 0),
          color: '#86868B'
        }
      ]
    : chartData;
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-expense-darkGray">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in animation-delay-4">
      <h3 className="text-lg font-medium mb-4">Expense by Category</h3>
      
      <div className="h-[300px]">
        {displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No expense data available
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {displayData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">${item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;
