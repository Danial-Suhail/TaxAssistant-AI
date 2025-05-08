import { openai } from "@/lib/openai";
import { streamText } from "ai";

const formatTaxResponse = (query: string) => {
  let response = "";

  if (query.toLowerCase().includes('tax bracket') || query.toLowerCase().includes('income')) {
    response = `Let me help you understand your tax situation.

Here's a detailed breakdown:

|||TABLE_DATA|||
{
  "tableData": [
    {"label": "Total Income", "amount": 85000},
    {"label": "Standard Deduction", "amount": 13850},
    {"label": "Taxable Income", "amount": 71150},
    {"label": "Total Tax", "amount": 11287}
  ]
}
|||END_TABLE|||

|||CHART_DATA|||
{
  "chartData": [
    {"name": "10% Bracket", "value": 1100},
    {"name": "12% Bracket", "value": 4600},
    {"name": "22% Bracket", "value": 5587}
  ]
}
|||END_CHART|||

Based on your income of $85,000, here's how your taxes break down:

1. Your total income is $85,000
2. Minus the standard deduction of $13,850
3. Resulting in taxable income of $71,150

The tax is calculated progressively through each bracket:
- 10% on the first $11,000
- 12% on income from $11,001 to $44,725
- 22% on income from $44,726 to $71,150`;
  }

  return response;
};

export async function POST(req: Request) {
  const { messages } = await req.json();
  const currentQuery = messages[messages.length - 1].content;
  const formattedResponse = formatTaxResponse(currentQuery);

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are TaxAssist AI, a helpful tax assistant specializing in US tax law and Form 1040. 
    Keep responses friendly but professional.
    
    IMPORTANT FORMAT REQUIREMENTS:
    1. Start with a clear markdown explanation
    2. For tables, you MUST use this exact format:
       |||TABLE_DATA|||
       {
         "tableData": [
           {"label": "Category Name", "amount": number},
           {"label": "Another Category", "amount": number}
         ]
       }
       |||END_TABLE|||
       
    3. For charts, you MUST use this exact format:
       |||CHART_DATA|||
       {
         "chartData": [
           {"name": "Category Name", "value": number},
           {"name": "Another Category", "value": number}
         ]
       }
       |||END_CHART|||
       
    4. Follow with detailed breakdown
    
    ${formattedResponse ? `\n\nHere's a template to follow: ${formattedResponse}` : ''}`,
    messages,
  });

  return result.toDataStreamResponse();
}

