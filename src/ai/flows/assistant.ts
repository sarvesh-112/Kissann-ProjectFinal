'use server';
/**
 * @fileOverview A conversational AI assistant for farmers.
 *
 * - askAssistant - A function that handles conversational queries.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getMarketPriceAnalysis } from './market-price-analysis';
import { getGovernmentSchemeInformation } from './government-scheme-information';
import { 
    MarketPriceAnalysisInputSchema,
    MarketPriceAnalysisOutputSchema,
    GovernmentSchemeInformationInputSchema,
    GovernmentSchemeInformationOutputSchema
} from '@/ai/schemas';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user query, which could be about market prices or government schemes.'),
});

// Define tools that the assistant can use
const findMarketPrice = ai.defineTool(
  {
    name: 'findMarketPrice',
    description:
      'Get the market price for a crop in a specific location and advice on selling.',
    inputSchema: MarketPriceAnalysisInputSchema,
    outputSchema: MarketPriceAnalysisOutputSchema,
  },
  async (input) => {
    return getMarketPriceAnalysis(input);
  }
);

const findGovernmentScheme = ai.defineTool(
  {
    name: 'findGovernmentScheme',
    description:
      'Get information about government schemes for farmers based on a query.',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async (input) => {
    return getGovernmentSchemeInformation(input);
  }
);

// Define the main assistant prompt
const assistantPrompt = ai.definePrompt({
  name: 'assistantPrompt',
  tools: [findMarketPrice, findGovernmentScheme],
  input: { schema: AssistantInputSchema },
  output: { schema: z.string() },
  prompt: `You are Project Kisan, a friendly and helpful AI assistant for farmers in India.
Your role is to understand the user's query and use the available tools to provide an accurate and concise answer.

- If the user asks about crop prices, use the 'findMarketPrice' tool.
- If the user asks about government programs or subsidies, use the 'findGovernmentScheme' tool.
- After the tool returns a result, format it into a clear, natural language paragraph. Do not just return the raw JSON.
- If you cannot answer the question with the available tools, politely state that you can only help with market prices and government schemes for now.
- Your responses should be helpful and easy to understand for a farmer.

User Query: {{{query}}}
`,
});

// Define the main flow
const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await assistantPrompt(input);
    if (!output) {
      throw new Error("The model did not return a valid response.");
    }
    return output;
  }
);

export async function askAssistant(query: string): Promise<string> {
    try {
        const result = await assistantFlow({ query });
        return result;
    } catch (error) {
        console.error("Error in askAssistant flow:", error);
        throw new Error("Failed to get a response from the assistant.");
    }
}
