
import React from 'react';
import ExpenseSummary from './ExpenseSummary';
import ExpenseChart from './ExpenseChart';
import TransactionList from './TransactionList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">View your expense overview</p>
        </div>
        
        <Link to="/transactions?action=add">
          <Button className="group">
            <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
            Add Transaction
          </Button>
        </Link>
      </div>
      
      <ExpenseSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ExpenseChart />
        
        <div className="glass-card rounded-xl p-5 animate-fade-in animation-delay-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          
          <TransactionList limit={5} showFilters={false} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
