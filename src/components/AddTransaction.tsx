import React, { useState, useEffect } from "react";
import { useExpense } from "@/context/ExpenseContext";
import { Transaction } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddTransactionProps {
  transactionToEdit?: Transaction;
  onComplete: () => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({
  transactionToEdit,
  onComplete,
}) => {
  const { state, addTransaction, updateTransaction } = useExpense();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
    categoryId?: string;
  }>({});

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setDate(new Date(transactionToEdit.date));
      setCategoryId(transactionToEdit.categoryId);
      setType(transactionToEdit.type);
    } else {
      // Default values for new transaction
      setAmount("");
      setDescription("");
      setDate(new Date());
      setCategoryId("");
      setType("expense");
    }
  }, [transactionToEdit]);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description";
    }

    if (!categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const transactionData = {
      amount: Number(amount),
      description,
      date: format(date, "yyyy-MM-dd"),
      categoryId,
      type,
    };

    if (transactionToEdit) {
      updateTransaction({
        ...transactionData,
        id: transactionToEdit.id,
      });
    } else {
      addTransaction(transactionData);
    }

    onComplete();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {transactionToEdit ? "Edit Transaction" : "Add New Transaction"}
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          {transactionToEdit
            ? "Update transaction details"
            : "Enter the details for your new transaction"}
        </p>
      </DialogHeader>

      <div className="space-y-5 py-5">
        <div className="space-y-2">
          <Label>Transaction Type</Label>
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as "income" | "expense")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="cursor-pointer">
                Expense
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="cursor-pointer">
                Income
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {state.categories
                .filter((c) =>
                  type === "income" ? c.name === "Income" : c.name !== "Income"
                )
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {transactionToEdit ? "Update Transaction" : "Add Transaction"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddTransaction;
