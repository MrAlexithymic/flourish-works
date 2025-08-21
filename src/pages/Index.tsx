import { useState } from "react";
import { VoiceInput } from "@/components/VoiceInput";
import { ExpenseChart } from "@/components/ExpenseChart";
import { AIAdvisor } from "@/components/AIAdvisor";
import { ExpenseList } from "@/components/ExpenseList";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, Mic } from "lucide-react";

interface ExpenseData {
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Index = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([
    {
      amount: 25,
      category: "Food",
      description: "Lunch at Subway",
      date: new Date().toISOString().split('T')[0]
    },
    {
      amount: 60,
      category: "Transport", 
      description: "Gas station fill-up",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    },
    {
      amount: 120,
      category: "Groceries",
      description: "Weekly grocery shopping",
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
    }
  ]);

  const addExpense = (newExpense: ExpenseData) => {
    setExpenses(prev => [...prev, newExpense]);
  };

  const deleteExpense = (index: number) => {
    setExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = 2000;
  const remainingBudget = monthlyBudget - totalSpent;
  const spendingRate = (totalSpent / monthlyBudget) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-white shadow-strong">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">FinVoice</h1>
              <p className="text-white/90">AI-Powered Financial Management & Advisory</p>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Voice Enabled
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 gradient-card shadow-medium">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-primary">${totalSpent}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 gradient-card shadow-medium">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Budget</p>
                <p className="text-2xl font-bold text-success">${remainingBudget}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 gradient-card shadow-medium">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold text-warning">{spendingRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 gradient-card shadow-medium">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Goal</p>
                <p className="text-2xl font-bold text-accent">${monthlyBudget}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Voice Input */}
        <VoiceInput onExpenseAdd={addExpense} />

        {/* Charts */}
        <ExpenseChart expenses={expenses} />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
          <AIAdvisor expenses={expenses} />
        </div>
      </div>
    </div>
  );
};

export default Index;
