import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { Transaction, Category, ExpenseSummary } from "@/lib/types";
import { toast } from "sonner";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  or,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

// Default categories with Apple-inspired colors
const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Food & Dining",
    color: "#FF5A5F",
    icon: "utensils",
    isDefault: true,
  },
  {
    id: "2",
    name: "Transportation",
    color: "#63C4A5",
    icon: "car",
    isDefault: true,
  },
  {
    id: "3",
    name: "Entertainment",
    color: "#36A2EB",
    icon: "film",
    isDefault: true,
  },
  {
    id: "4",
    name: "Shopping",
    color: "#FFC857",
    icon: "shopping-bag",
    isDefault: true,
  },
  { id: "5", name: "Housing", color: "#9E7DC5", icon: "home", isDefault: true },
  {
    id: "6",
    name: "Utilities",
    color: "#FF9F40",
    icon: "bolt",
    isDefault: true,
  },
  {
    id: "7",
    name: "Income",
    color: "#4BC0C0",
    icon: "wallet",
    isDefault: true,
  },
];

// State type definitions
type State = {
  transactions: Transaction[];
  categories: Category[];
  summary: ExpenseSummary;
  isLoading: boolean;
};

type Action =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string };

const calculateSummary = (transactions: Transaction[]): ExpenseSummary => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const categories = transactions.reduce((acc, t) => {
    if (!acc[t.categoryId]) {
      acc[t.categoryId] = 0;
    }
    if (t.type === "expense") {
      acc[t.categoryId] += t.amount;
    }
    return acc;
  }, {} as { [key: string]: number });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    categories,
  };
};

const initialState: State = {
  transactions: [],
  categories: [],
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categories: {},
  },
  isLoading: true,
};

const reducer = (state: State, action: Action): State => {
  let newState;

  switch (action.type) {
    case "SET_TRANSACTIONS":
      newState = {
        ...state,
        transactions: action.payload,
      };
      break;

    case "SET_CATEGORIES":
      newState = {
        ...state,
        categories: action.payload,
      };
      break;

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "ADD_TRANSACTION":
      newState = {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
      break;

    case "UPDATE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
      break;

    case "DELETE_TRANSACTION":
      newState = {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
      break;

    case "ADD_CATEGORY":
      newState = {
        ...state,
        categories: [...state.categories, action.payload],
      };
      break;

    case "UPDATE_CATEGORY":
      newState = {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
      break;

    case "DELETE_CATEGORY":
      // Check if category is used in any transaction
      const isUsedInTransaction = state.transactions.some(
        (t) => t.categoryId === action.payload
      );

      if (isUsedInTransaction) {
        toast.error("Cannot delete category that is used in transactions");
        return state;
      }

      newState = {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
      break;

    default:
      return state;
  }

  // Recalculate summary for the new state
  newState.summary = calculateSummary(newState.transactions);
  return newState;
};

type ExpenseContextType = {
  state: State;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();

  // Firebase collections
  const transactionsCollection = collection(db, "transactions");
  const categoriesCollection = collection(db, "categories");

  // Initialize Firebase data
  useEffect(() => {
    if (!user && !user?.uid) return;

    const initializeFirebase = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // Check if categories exist, if not add default categories
        const categoriesQuery = query(
          categoriesCollection,
          or(
            where("ownerDocId", "==", user.uid),
            where("isDefault", "==", true)
          )
        );
        const categoriesSnapshot = await getDocs(categoriesCollection);
        let categories: Category[] = [];

        if (categoriesSnapshot.empty) {
          // Add default categories to Firestore
          for (const category of defaultCategories) {
            await addDoc(categoriesCollection, category);
          }
          categories = defaultCategories;
        } else {
          // Map Firestore documents to Category objects
          categories = categoriesSnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Category)
          );
        }

        dispatch({ type: "SET_CATEGORIES", payload: categories });
        const transactionsQuery = query(
          transactionsCollection,
          where("ownerDocId", "==", user.uid)
        );

        const unsubscribeTransactions = onSnapshot(
          transactionsQuery,
          (snapshot) => {

            const transactions = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as Transaction)
            );

            dispatch({ type: "SET_TRANSACTIONS", payload: transactions });
            dispatch({ type: "SET_LOADING", payload: false });
          }
        );

        const unsubscribeCategories = onSnapshot(
          categoriesCollection,
          (snapshot) => {
            const categories = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as Category)
            );

            dispatch({ type: "SET_CATEGORIES", payload: categories });
          }
        );

        // Clean up listeners on unmount
        return () => {
          unsubscribeTransactions();
          unsubscribeCategories();
        };
      } catch (error) {
        console.error("Error initializing Firebase:", error);
        toast.error("Failed to connect to the database");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeFirebase();
  }, [user]);

  // Firebase CRUD operations
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const newTransaction = { ...transaction, ownerDocId: user.uid };
      const docRef = await addDoc(transactionsCollection, newTransaction);
      toast.success("Transaction added");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      const docRef = doc(db, "transactions", transaction.id);
      await updateDoc(docRef, { ...transaction });
      toast.success("Transaction updated");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const docRef = doc(db, "transactions", id);
      await deleteDoc(docRef);
      toast.success("Transaction deleted");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = { ...category, ownerDocId: user.uid };
      const docRef = await addDoc(categoriesCollection, newCategory);
      toast.success("Category added");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const docRef = doc(db, "categories", category.id);
      await updateDoc(docRef, { ...category });
      toast.success("Category updated");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Check if category is used in any transaction
      const q = query(transactionsCollection, where("categoryId", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Cannot delete category that is used in transactions");
        return;
      }

      const docRef = doc(db, "categories", id);
      await deleteDoc(docRef);
      toast.success("Category deleted");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const getCategoryById = (id: string) => {
    return state.categories.find((c) => c.id === id);
  };

  return (
    <ExpenseContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};
