import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VoiceInput } from "@/components/VoiceInput";
import { ExpenseChart } from "@/components/ExpenseChart";
import { AIAdvisor } from "@/components/AIAdvisor";
import { ExpenseList } from "@/components/ExpenseList";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, ExpenseData } from "@/hooks/useExpenses";
import { useProfile } from "@/hooks/useProfile";
import { TrendingUp, TrendingDown, DollarSign, Target, Mic, Edit3, Check, X, LogOut, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(2000);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setTempBudget(profile.monthly_budget);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleBudgetSave = () => {
    if (profile && tempBudget !== profile.monthly_budget) {
      updateProfile({ monthly_budget: tempBudget });
    }
    setIsEditingBudget(false);
  };

  const handleBudgetCancel = () => {
    if (profile) {
      setTempBudget(profile.monthly_budget);
    }
    setIsEditingBudget(false);
  };

  const handleAddExpense = (newExpense: Omit<ExpenseData, 'id' | 'created_at'>) => {
    addExpense({
      ...newExpense,
      expense_date: newExpense.expense_date || new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const monthlyBudget = profile?.monthly_budget || 2000;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Welcome, {profile?.display_name || user?.email?.split('@')[0]}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Voice Enabled
                </Badge>
              </div>
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
                <p className="text-2xl font-bold text-primary">₹{totalSpent}</p>
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
                <p className="text-2xl font-bold text-success">₹{remainingBudget}</p>
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
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Monthly Goal</p>
                {isEditingBudget ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(Number(e.target.value))}
                      className="h-8 w-24 text-lg font-bold"
                    />
                    <Button size="sm" variant="ghost" onClick={handleBudgetSave}>
                      <Check className="w-4 h-4 text-success" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleBudgetCancel}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-accent">₹{monthlyBudget}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsEditingBudget(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Voice Input */}
        <VoiceInput onExpenseAdd={handleAddExpense} />

        {/* Charts */}
        <ExpenseChart expenses={expenses} />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} loading={expensesLoading} />
          <AIAdvisor expenses={expenses} />
        </div>
      </div>
    </div>
  );
};

export default Index;
