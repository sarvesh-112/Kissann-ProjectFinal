'use server';

/**
 * @fileOverview Fetches market prices for crops and provides advice on selling or waiting.
 *
 * - getMarketPriceAnalysis - A function that handles the market price analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { logPriceQuery } from '@/services/firestoreService';
import { MarketPriceAnalysisInputSchema, MarketPriceAnalysisOutputSchema, type MarketPriceAnalysisInput, type MarketPriceAnalysisOutput } from '@/ai/schemas';

export async function getMarketPriceAnalysis(input: MarketPriceAnalysisInput): Promise<MarketPriceAnalysisOutput> {
    try {
        const result = await marketPriceAnalysisFlow(input);
        // Do not await logging
        logPriceQuery(input, result);
        return result;
    } catch (error) {
        console.error("Error in getMarketPriceAnalysis flow:", error);
        return {
            summary: `Price for ${input.crop} in ${input.location} is currently unavailable.`,
            advice: 'Unable to fetch prices right now. We are working on it. Please try again later.',
        };
    }
}

const getMandiPrice = ai.defineTool({
  name: 'getMandiPrice',
  description: 'Retrieves the current market price and trend for a given crop and location.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to get market prices for.'),
    location: z.string().describe('The location to get market prices for.'),
  }),
  outputSchema: z.object({
    price: z.string().describe('The current market price per unit for the crop in the given location.'),
    trend: z.string().describe('The recent trend of the market price (e.g., "Prices have dropped by 5% today", "Stable for the past week").'),
  }),
}, async (input) => {
  // In a real-world scenario, this would call a public API like AGMARKNET.
  // For this demo, we are simulating an API call with mock data.
  console.log(`Fetching real-time market data for ${input.crop} in ${input.location}`);
  
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate potential API failure
  if (Math.random() < 0.1) { // 10% chance of failure
    throw new Error("Mandi API is currently unavailable.");
  }
  
  const prices = {
      'tomato': 22,
      'potato': 18,
      'onion': 25,
  };
  const basePrice = prices[input.crop.toLowerCase() as keyof typeof prices] || 30;
  const price = (basePrice + (Math.random() - 0.5) * 10).toFixed(2);
  const trends = ["Prices have dropped by 5% today", "Prices are up 3% from yesterday", "Prices have been stable this week"];
  const trend = trends[Math.floor(Math.random() * trends.length)];

  return {
    price: `₹${price}/kg`,
    trend: trend,
  };
});

const marketPriceAnalysisPrompt = ai.definePrompt({
  name: 'marketPriceAnalysisPrompt',
  tools: [getMandiPrice],
  input: {schema: MarketPriceAnalysisInputSchema},
  output: {schema: MarketPriceAnalysisOutputSchema},
  prompt: `You are an agricultural market expert for Indian farmers.
  
  A farmer wants to know about the market price for **{{crop}}** in **{{location}}**.

  1. Use the 'getMandiPrice' tool to get the latest price and trend data.
  2. Based on this data, provide a clear, concise summary of the current situation.
  3. Then, give a simple recommendation: should the farmer sell today, wait for a better price, or is it a neutral market? Explain your reasoning in one sentence.
  
  Format the output into a 'summary' and 'advice' field.
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
