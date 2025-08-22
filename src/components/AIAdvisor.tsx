import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, TrendingUp, AlertTriangle, Target } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  category?: 'insight' | 'warning' | 'recommendation' | 'goal';
}

interface AIAdvisorProps {
  expenses: Array<{
    id?: string;
    amount: number;
    category: string;
    description: string;
    expense_date: string;
  }>;
}

export const AIAdvisor = ({ expenses }: AIAdvisorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI financial advisor. I can help you analyze your spending patterns, set goals, and make smart financial decisions. What would you like to know?",
      timestamp: new Date().toLocaleTimeString(),
      category: 'insight'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const generateAIResponse = (userInput: string): Message => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categorySpending = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];
    
    let response = "";
    let category: Message['category'] = 'insight';
    
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('spending') || lowerInput.includes('analysis')) {
      if (totalSpent > 0) {
        response = `Based on your recent expenses of ₹${totalSpent}, I notice you spend most on ${topCategory?.[0] || 'various categories'} (₹${topCategory?.[1] || 0}). Consider setting a monthly budget of ₹${Math.round(totalSpent * 1.2)} to allow for some flexibility while maintaining control.`;
        category = 'insight';
      } else {
        response = "I don't see any expenses logged yet. Start tracking your spending with voice input to get personalized insights!";
      }
    } else if (lowerInput.includes('save') || lowerInput.includes('budget')) {
      response = `To improve your savings, try the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings. Based on your current spending of ₹${totalSpent}, aim to save at least ₹${Math.round(totalSpent * 0.4)} monthly.`;
      category = 'recommendation';
    } else if (lowerInput.includes('goal') || lowerInput.includes('plan')) {
      response = `Let's set up a savings goal! For a ₹8,00,000 emergency fund, you'd need to save ₹66,667 monthly for 12 months. I can help you track progress and adjust your spending accordingly.`;
      category = 'goal';
    } else if (lowerInput.includes('invest') || lowerInput.includes('sip')) {
      response = `Consider starting a SIP (Systematic Investment Plan) with ₹15,000-40,000 monthly. Based on your spending patterns, you could potentially invest ₹${Math.round(totalSpent * 0.3)} per month in diversified mutual funds for long-term wealth creation.`;
      category = 'recommendation';
    } else if (lowerInput.includes('reduce') || lowerInput.includes('cut')) {
      if (topCategory && topCategory[1] > 200) {
        response = `I notice you're spending ₹${topCategory[1]} on ${topCategory[0]}. Try reducing this by 10-15% by finding alternatives or planning ahead. This could save you ₹${Math.round(topCategory[1] * 0.12)} monthly!`;
        category = 'warning';
      } else {
        response = "Your spending seems reasonable. Focus on increasing income sources or small daily savings like brewing coffee at home instead of buying it.";
      }
    } else {
      response = `I can help you with spending analysis, budget planning, savings goals, and investment advice. Try asking me about "my spending analysis" or "how to save more money"!`;
      category = 'insight';
    }
    
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date().toLocaleTimeString(),
      category
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'insight': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'goal': return <Target className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'insight': return 'bg-primary';
      case 'warning': return 'bg-warning';
      case 'goal': return 'bg-success';
      default: return 'bg-accent';
    }
  };

  return (
    <Card className="p-6 gradient-card shadow-medium h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Financial Advisor</h3>
          <p className="text-sm text-muted-foreground">Your personal finance assistant</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'ai' && (
                <div className={`w-6 h-6 rounded-full ${getCategoryColor(message.category)} flex items-center justify-center text-white flex-shrink-0 mt-1`}>
                  {getCategoryIcon(message.category)}
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp}
                </p>
              </div>
              
              {message.type === 'user' && (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3 h-3 text-success-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="flex gap-2 mt-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your spending, savings goals, or investment advice..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-2 mt-2 text-xs">
        <Badge variant="outline" className="cursor-pointer" onClick={() => setInputValue("Analyze my spending patterns")}>
          💡 Spending Analysis
        </Badge>
        <Badge variant="outline" className="cursor-pointer" onClick={() => setInputValue("How can I save more money?")}>
          💰 Save More
        </Badge>
        <Badge variant="outline" className="cursor-pointer" onClick={() => setInputValue("Help me plan investment goals")}>
          📈 Investment Plan
        </Badge>
      </div>
    </Card>
  );
};