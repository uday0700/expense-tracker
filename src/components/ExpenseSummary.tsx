
import React from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { ArrowUp, ArrowDown, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExpenseSummary: React.FC = () => {
  const { state } = useExpense();
  const { summary } = state;
  
  const cards = [
    {
      title: 'Income',
      value: summary.totalIncome,
      icon: <ArrowUp className="w-5 h-5" />,
      color: 'bg-expense-green/10 text-expense-green',
      delay: 'animation-delay-1'
    },
    {
      title: 'Expenses',
      value: summary.totalExpenses,
      icon: <ArrowDown className="w-5 h-5" />,
      color: 'bg-expense-red/10 text-expense-red',
      delay: 'animation-delay-2'
    },
    {
      title: 'Balance',
      value: summary.balance,
      icon: <BarChart className="w-5 h-5" />,
      color: 'bg-expense-blue/10 text-expense-blue',
      delay: 'animation-delay-3'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={cn(
            "glass-card rounded-xl p-5 animate-scale-in",
            card.delay
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {card.title}
            </h3>
            <div className={cn("p-2 rounded-full", card.color)}>
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-semibold">
            ${card.value.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ExpenseSummary;
