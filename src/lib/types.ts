
export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  type: 'income' | 'expense';
};

export type ExpenseSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categories: {
    [key: string]: number;
  };
};
