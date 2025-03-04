
import React from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Transaction } from '@/lib/types';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction,
  onDelete
}) => {
  const { getCategoryById } = useExpense();
  
  const category = getCategoryById(transaction.categoryId);
  
  return (
    <div className="glass-card rounded-lg p-4 transition-all hover:shadow-md animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: category?.color || '#999' }}
          >
            <span className="text-white text-sm">
              {category?.name.substring(0, 2) || 'UC'}
            </span>
          </div>
          
          <div>
            <h3 className="font-medium">{transaction.description}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {category?.name || 'Uncategorized'}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span 
            className={cn(
              "font-semibold",
              transaction.type === 'income' ? 'text-expense-green' : 'text-expense-red'
            )}
          >
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </span>
          
          <div className="flex gap-1 mt-1">
            <Link to={`/transactions?edit=${transaction.id}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-destructive" 
              onClick={() => onDelete(transaction.id)}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
