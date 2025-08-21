import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExpenseData {
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseChartProps {
  expenses: ExpenseData[];
}

const COLORS = {
  Food: '#3B82F6',
  Transport: '#10B981', 
  Groceries: '#F59E0B',
  Entertainment: '#8B5CF6',
  Bills: '#EF4444',
  Other: '#6B7280'
};

export const ExpenseChart = ({ expenses }: ExpenseChartProps) => {
  // Aggregate expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: COLORS[category as keyof typeof COLORS] || COLORS.Other
  }));

  // Daily spending data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => {
    const dayExpenses = expenses.filter(exp => exp.date === date);
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      name: dayName,
      amount: total,
      date
    };
  });

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 gradient-card shadow-medium">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Spending by Category</h3>
            <p className="text-2xl font-bold text-primary">
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total spent this month</p>
          </div>
          
          <div className="h-[250px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No expense data yet. Start logging your expenses!
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 gradient-card shadow-medium">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Daily Spending</h3>
            <p className="text-sm text-muted-foreground">Last 7 days overview</p>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Spent']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};