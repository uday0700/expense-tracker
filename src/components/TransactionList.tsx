
import React, { useState, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import TransactionCard from './TransactionCard';
import { Transaction } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchIcon, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface TransactionListProps {
  limit?: number;
  showFilters?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  limit,
  showFilters = true 
}) => {
  const { state, deleteTransaction } = useExpense();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  useEffect(() => {
    let result = [...state.transactions];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.categoryId === categoryFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      
      switch (dateFilter) {
        case 'today':
          result = result.filter(t => {
            const transactionDate = format(parseISO(t.date), 'yyyy-MM-dd');
            return transactionDate === todayStr;
          });
          break;
        case 'this-week': {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);
          
          result = result.filter(t => {
            const transactionDate = parseISO(t.date);
            return (
              isAfter(transactionDate, sevenDaysAgo) || 
              isEqual(transactionDate, sevenDaysAgo)
            );
          });
          break;
        }
        case 'this-month': {
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          result = result.filter(t => {
            const transactionDate = parseISO(t.date);
            return (
              isAfter(transactionDate, firstDayOfMonth) || 
              isEqual(transactionDate, firstDayOfMonth)
            );
          });
          break;
        }
      }
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Apply limit
    if (limit && result.length > limit) {
      result = result.slice(0, limit);
    }
    
    setFilteredTransactions(result);
  }, [state.transactions, searchTerm, typeFilter, categoryFilter, dateFilter, limit]);
  
  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };
  
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteTransaction(deleteConfirm);
      setDeleteConfirm(null);
    }
  };
  
  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {state.categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <Alert variant="default" className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No transactions found. Try adjusting your filters or add a new transaction.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionList;
