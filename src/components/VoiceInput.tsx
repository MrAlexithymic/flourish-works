import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onExpenseAdd: (expense: {
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => void;
}

export const VoiceInput = ({ onExpenseAdd }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Simulate voice input since we can't use real speech API without backend
  const startListening = () => {
    setIsListening(true);
    setTranscript("Listening...");
    
    // Simulate voice processing
    setTimeout(() => {
      const sampleInputs = [
        "I spent 25 dollars on lunch at Subway",
        "Dinner cost me 45 dollars at the Italian restaurant", 
        "Paid 8 dollars for coffee this morning",
        "Gas station bill was 60 dollars",
        "Grocery shopping came to 120 dollars"
      ];
      
      const randomInput = sampleInputs[Math.floor(Math.random() * sampleInputs.length)];
      setTranscript(randomInput);
      setIsListening(false);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processTranscript = () => {
    if (!transcript || transcript === "Listening...") return;
    
    setIsProcessing(true);
    
    // Simulate AI processing to extract expense data
    setTimeout(() => {
      // Simple parsing simulation
      const amountMatch = transcript.match(/(\d+)\s*dollars?/i);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
      
      let category = "Other";
      if (transcript.toLowerCase().includes("lunch") || transcript.toLowerCase().includes("dinner") || transcript.toLowerCase().includes("food")) {
        category = "Food";
      } else if (transcript.toLowerCase().includes("gas") || transcript.toLowerCase().includes("fuel")) {
        category = "Transport";
      } else if (transcript.toLowerCase().includes("coffee") || transcript.toLowerCase().includes("starbucks")) {
        category = "Food";
      } else if (transcript.toLowerCase().includes("grocery") || transcript.toLowerCase().includes("shopping")) {
        category = "Groceries";
      }
      
      if (amount > 0) {
        onExpenseAdd({
          amount,
          category,
          description: transcript,
          date: new Date().toISOString().split('T')[0]
        });
        
        toast({
          title: "Expense Added! 🎉",
          description: `$${amount} logged for ${category}`,
        });
        
        setTranscript("");
      }
      
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Card className="p-6 gradient-card shadow-medium">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Voice Expense Logger</h3>
            <p className="text-sm text-muted-foreground">
              Speak to log your expenses instantly
            </p>
          </div>
          <Badge variant={isListening ? "destructive" : "secondary"}>
            {isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>
        
        <div className="min-h-[80px] p-4 bg-muted/50 rounded-lg border-2 border-dashed border-border">
          {transcript ? (
            <p className="text-sm">{transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Your voice input will appear here...
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
            disabled={isProcessing}
          >
            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
          
          {transcript && !isListening && (
            <Button
              onClick={processTranscript}
              disabled={isProcessing}
              className="gradient-primary"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? "Processing..." : "Log Expense"}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          💡 Try saying: "I spent 25 dollars on lunch" or "Paid 60 dollars for gas"
        </div>
      </div>
    </Card>
  );
};