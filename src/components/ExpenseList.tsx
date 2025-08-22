import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Calendar, DollarSign } from "lucide-react";

interface ExpenseData {
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseListProps {
  expenses: ExpenseData[];
  onDeleteExpense?: (index: number) => void;
}

const categoryIcons = {
  Food: "🍽️",
  Transport: "🚗",
  Groceries: "🛒",
  Entertainment: "🎬",
  Bills: "📄",
  Other: "💼"
};

const categoryColors = {
  Food: "bg-blue-100 text-blue-800 border-blue-200",
  Transport: "bg-green-100 text-green-800 border-green-200",
  Groceries: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Entertainment: "bg-purple-100 text-purple-800 border-purple-200",
  Bills: "bg-red-100 text-red-800 border-red-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200"
};

export const ExpenseList = ({ expenses, onDeleteExpense }: ExpenseListProps) => {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="p-6 gradient-card shadow-medium">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recent Expenses</h3>
            <p className="text-sm text-muted-foreground">
              {expenses.length} expenses logged
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            Total: ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0)}
          </div>
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium mb-2">No expenses yet</h4>
              <p className="text-muted-foreground">
                Use the voice input above to log your first expense!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenses.map((expense, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card-elevated transition-smooth hover:shadow-soft"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">
                      {categoryIcons[expense.category as keyof typeof categoryIcons] || categoryIcons.Other}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary"
                          className={categoryColors[expense.category as keyof typeof categoryColors] || categoryColors.Other}
                        >
                          {expense.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(expense.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-primary">
                      ₹{expense.amount}
                    </span>
                    
                    {onDeleteExpense && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteExpense(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {expenses.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  ₹{(expenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(1, expenses.length)).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Avg per expense</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};