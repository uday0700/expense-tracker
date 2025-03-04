
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import TransactionList from '@/components/TransactionList';
import AddTransaction from '@/components/AddTransaction';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useExpense } from '@/context/ExpenseContext';
import { Transaction } from '@/lib/types';

const Transactions: React.FC = () => {
  const { state } = useExpense();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
  
  useEffect(() => {
    const action = searchParams.get('action');
    const editId = searchParams.get('edit');
    
    if (action === 'add') {
      setIsAddDialogOpen(true);
    } else if (editId) {
      const transaction = state.transactions.find(t => t.id === editId);
      if (transaction) {
        setTransactionToEdit(transaction);
        setIsAddDialogOpen(true);
      }
    }
  }, [searchParams, state.transactions]);
  
  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setTransactionToEdit(undefined);
    
    // Remove URL parameters
    if (searchParams.has('action') || searchParams.has('edit')) {
      setSearchParams({});
    }
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Transactions</h1>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
        
        <TransactionList showFilters={true} />
      </div>
      
      {/* Add/Edit Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <AddTransaction 
            transactionToEdit={transactionToEdit} 
            onComplete={handleDialogClose} 
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Transactions;
