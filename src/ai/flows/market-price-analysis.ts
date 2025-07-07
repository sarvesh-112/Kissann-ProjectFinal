'use server';

/**
 * @fileOverview Fetches market prices for crops and provides advice on selling or waiting.
 *
 * - getMarketPriceAnalysis - A function that handles the market price analysis process.
 * - MarketPriceAnalysisInput - The input type for the getMarketPriceAnalysis function.
 * - MarketPriceAnalysisOutput - The return type for the getMarketPriceAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { logPriceQuery } from '@/services/firestoreService';

const MarketPriceAnalysisInputSchema = z.object({
  crop: z.string().describe('The crop to get market prices for, e.g., tomato, potato.'),
  location: z.string().describe('The location to get market prices for, e.g., Hassan, Bangalore.'),
});
export type MarketPriceAnalysisInput = z.infer<typeof MarketPriceAnalysisInputSchema>;

const MarketPriceAnalysisOutputSchema = z.object({
  summary: z.string().describe('A summary of the current market prices for the crop.'),
  advice: z.string().describe('Advice on whether to sell or wait, based on the market prices.'),
});
export type MarketPriceAnalysisOutput = z.infer<typeof MarketPriceAnalysisOutputSchema>;

export async function getMarketPriceAnalysis(input: MarketPriceAnalysisInput): Promise<MarketPriceAnalysisOutput> {
    try {
        const result = await marketPriceAnalysisFlow(input);
        // Do not await logging
        logPriceQuery(input, result);
        return result;
    } catch (error) {
        console.error("Error in getMarketPriceAnalysis flow:", error);
        throw new Error("Failed to analyze market prices.");
    }
}

const getMarketData = ai.defineTool({
  name: 'getMarketData',
  description: 'Retrieves the current market data for a given crop and location.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to get market prices for.'),
    location: z.string().describe('The location to get market prices for.'),
  }),
  outputSchema: z.object({
    crop: z.string().describe('The crop for which the market data is retrieved.'),
    location: z.string().describe('The location for which the market data is retrieved.'),
    price: z.string().describe('The current market price for the crop in the given location.'),
    trend: z.string().describe('The trend of the market price (e.g., increasing, decreasing, stable).'),
  }),
}, async (input) => {
  // Mock implementation for fetching market data from external APIs like AGMARKNET
  console.log(`Fetching market data for ${input.crop} in ${input.location}`);
  return {
    crop: input.crop,
    location: input.location,
    price: `₹${(Math.random() * 20 + 15).toFixed(0)}/kg`,
    trend: 'Prices have been stable this week, with a slight increase expected tomorrow. Selling now is a safe bet, but waiting a day might yield higher returns.',
  };
});

const marketPriceAnalysisPrompt = ai.definePrompt({
  name: 'marketPriceAnalysisPrompt',
  tools: [getMarketData],
  input: {schema: MarketPriceAnalysisInputSchema},
  output: {schema: MarketPriceAnalysisOutputSchema},
  prompt: `You are an agricultural expert advising farmers on market prices.

  Based on the current market data, provide a summary of the prices and advice on whether to sell or wait.

  The farmer is interested in {{crop}} prices in {{location}}.

  Use the getMarketData tool to get the current market data.

  Format the output as a JSON object with 'summary' and 'advice' keys.
  `,
});

const marketPriceAnalysisFlow = ai.defineFlow(
  {
    name: 'marketPriceAnalysisFlow',
    inputSchema: MarketPriceAnalysisInputSchema,
    outputSchema: MarketPriceAnalysisOutputSchema,
  },
  async input => {
    const {output} = await marketPriceAnalysisPrompt(input);
    if (!output) {
      throw new Error("The model did not return a valid market analysis.");
    }
    return output;
  }
);
