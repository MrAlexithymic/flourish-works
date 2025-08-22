import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening...");
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or check your microphone.",
          variant: "destructive",
        });
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    setTranscript("");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processTranscript = () => {
    if (!transcript || transcript === "Listening...") return;
    
    setIsProcessing(true);
    
    // Enhanced AI processing to extract expense data
    setTimeout(() => {
      // Multiple patterns for amount detection
      const amountPatterns = [
        /(\d+(?:\.\d{1,2})?)\s*(?:rupees?|₹|rs\.?|inr)/i,
        /(?:spent|paid|cost|worth)\s*(?:about|around)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i,
        /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)/i,
        /(\d+(?:\.\d{1,2})?)\s*(?:dollars?|\$)/i, // Handle dollar mentions
        /(\d+(?:\.\d{1,2})?)\s*(?:bucks?)/i
      ];
      
      let amount = 0;
      for (const pattern of amountPatterns) {
        const match = transcript.match(pattern);
        if (match) {
          amount = parseFloat(match[1]);
          break;
        }
      }
      
      // Enhanced category detection with more patterns
      let category = "Other";
      const text = transcript.toLowerCase();
      
      // Food categories
      if (text.match(/\b(lunch|dinner|breakfast|food|meal|eat|restaurant|cafe|pizza|burger|sandwich|snack|coffee|tea|starbucks|mcdonalds|kfc|dominos)\b/)) {
        category = "Food";
      }
      // Transport categories  
      else if (text.match(/\b(gas|fuel|petrol|diesel|uber|ola|taxi|bus|train|metro|auto|rickshaw|transport|travel|parking)\b/)) {
        category = "Transport";
      }
      // Groceries categories
      else if (text.match(/\b(grocery|groceries|shopping|supermarket|vegetables|fruits|milk|bread|market|store|buy|bought)\b/)) {
        category = "Groceries";
      }
      // Entertainment categories
      else if (text.match(/\b(movie|cinema|entertainment|game|book|music|netflix|spotify|youtube|subscription)\b/)) {
        category = "Entertainment";
      }
      // Healthcare categories
      else if (text.match(/\b(doctor|hospital|medicine|pharmacy|health|medical|dentist|clinic)\b/)) {
        category = "Healthcare";
      }
      // Utilities categories
      else if (text.match(/\b(electricity|water|internet|phone|mobile|recharge|bill|utility)\b/)) {
        category = "Utilities";
      }
      
      if (amount > 0) {
        // Clean up description by removing amount mentions
        let cleanDescription = transcript;
        for (const pattern of amountPatterns) {
          cleanDescription = cleanDescription.replace(pattern, '').trim();
        }
        // Remove common filler words from start
        cleanDescription = cleanDescription.replace(/^(i\s+)?(spent|paid|bought|got)\s*/i, '').trim();
        if (!cleanDescription) {
          cleanDescription = `${category} expense`;
        }
        
        onExpenseAdd({
          amount,
          category,
          description: cleanDescription,
          date: new Date().toISOString().split('T')[0]
        });
        
        toast({
          title: "Expense Added! 🎉",
          description: `₹${amount} logged for ${category}`,
        });
        
        setTranscript("");
      } else {
        toast({
          title: "Amount Not Detected",
          description: "Please mention the amount in rupees (e.g., '50 rupees' or '₹50')",
          variant: "destructive",
        });
      }
      
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <Card className="p-6 gradient-card shadow-medium">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Voice Expense Logger</h3>
            <p className="text-sm text-muted-foreground">
              {isSupported ? "Speak to log your expenses instantly" : "Speech recognition not supported in this browser"}
            </p>
          </div>
          <Badge variant={!isSupported ? "outline" : isListening ? "destructive" : "secondary"}>
            {!isSupported ? "Unavailable" : isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>
        
        {!isSupported && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning" />
            <p className="text-sm text-warning">
              Voice input requires Chrome, Safari, or Edge browser with microphone permissions.
            </p>
          </div>
        )}
        
        <div className="min-h-[80px] p-4 bg-muted/50 rounded-lg border-2 border-dashed border-border">
          {transcript ? (
            <p className="text-sm">{transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {isSupported ? "Your voice input will appear here..." : "Voice input not available"}
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
            disabled={isProcessing || !isSupported}
          >
            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
          
          {transcript && !isListening && (
            <Button
              onClick={processTranscript}
              disabled={isProcessing || !isSupported}
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
          {isSupported ? (
            <>💡 Try: "I spent 25 rupees on lunch", "Paid 60 for gas", "Bought groceries worth ₹150"</>
          ) : (
            <>🔧 Use Chrome, Safari, or Edge with microphone access for voice input</>
          )}
        </div>
      </div>
    </Card>
  );
};