import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ExpenseData {
  id?: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  created_at?: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error('Failed to load expenses');
      } else {
        setExpenses(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<ExpenseData, 'id' | 'created_at'>) => {
    if (!user) {
      toast.error('Please sign in to add expenses');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        toast.error('Failed to add expense');
      } else {
        setExpenses(prev => [data, ...prev]);
        toast.success('Expense added successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add expense');
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      } else {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
        toast.success('Expense deleted');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete expense');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
};