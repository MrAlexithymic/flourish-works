import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expenses, monthlyBudget } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate expense insights
    const totalSpent = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const remainingBudget = monthlyBudget - totalSpent;
    const spendingRate = (totalSpent / monthlyBudget) * 100;

    // Categorize expenses
    const categoryTotals = expenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Create prompt for AI advisor
    const prompt = `As a financial advisor, analyze these expense data and provide personalized advice:

Monthly Budget: ₹${monthlyBudget}
Total Spent: ₹${totalSpent}
Remaining Budget: ₹${remainingBudget}
Budget Used: ${spendingRate.toFixed(1)}%

Category Breakdown:
${Object.entries(categoryTotals).map(([category, amount]) => `${category}: ₹${amount}`).join('\n')}

Recent Expenses:
${expenses.slice(0, 5).map((exp: any) => `${exp.description} - ₹${exp.amount} (${exp.category})`).join('\n')}

Provide 3-4 specific, actionable financial advice points based on this data. Focus on:
1. Budget management
2. Spending patterns
3. Savings opportunities
4. Category-specific recommendations

Keep the advice concise, practical, and encouraging.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful financial advisor. Provide practical, encouraging advice in a friendly tone. Use Indian rupees (₹) in your responses.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(JSON.stringify({ error: 'Failed to generate advice' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const advice = data.choices[0].message.content;

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-advisor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});