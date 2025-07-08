'use server';

/**
 * @fileOverview A conversational AI assistant for farmers called KisanBot.
 *
 * - askKisanBot - A function that handles conversational queries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

import { getMarketPriceAnalysis } from './market-price-analysis';
import { getGovernmentSchemeInformation } from './government-scheme-information';
import { getDiagnosisFromSymptoms } from './symptom-checker';

import {
  MarketPriceAnalysisInputSchema,
  MarketPriceAnalysisOutputSchema,
  GovernmentSchemeInformationInputSchema,
  GovernmentSchemeInformationOutputSchema,
  DiagnoseCropDiseaseBySymptomsInputSchema,
  DiagnoseCropDiseaseOutputSchema,
  SupportedLanguageSchema,
  type SupportedLanguage,
} from '@/ai/schemas';

import {
  logAgentInteraction,
  logAgentFailure,
} from '@/services/firestoreService';

// Input schema
const AssistantInputSchema = z.object({
  query: z.string().describe('The user query.'),
  language: SupportedLanguageSchema.describe('The language of the user query.'),
});

// Tool: Market Price
const findMarketPrice = ai.defineTool(
  {
    name: 'findMarketPrice',
    description: 'Get the market price for a crop in a specific location and advice on selling.',
    inputSchema: MarketPriceAnalysisInputSchema,
    outputSchema: MarketPriceAnalysisOutputSchema,
  },
  async (input) => {
    return getMarketPriceAnalysis(input);
  }
);

// Tool: Government Scheme
const findGovernmentScheme = ai.defineTool(
  {
    name: 'findGovernmentScheme',
    description: 'Get information about government schemes for farmers based on a query.',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async (input) => {
    return getGovernmentSchemeInformation(input);
  }
);

// Tool: Crop Disease Diagnosis
const diagnoseDiseaseFromSymptoms = ai.defineTool(
  {
    name: 'diagnoseDiseaseFromSymptoms',
    description: "Use this tool *only* when the user describes the physical appearance of a sick plant (e.g., spots on leaves, wilting, discoloration) to find out the disease and its remedy. Do not use it for general crop advice.",
    inputSchema: DiagnoseCropDiseaseBySymptomsInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => {
    return getDiagnosisFromSymptoms(input);
  }
);

const kisanBotPrompt = ai.definePrompt({
  name: 'kisanBotPrompt',
  tools: [findMarketPrice, findGovernmentScheme, diagnoseDiseaseFromSymptoms],
  input: { schema: AssistantInputSchema },
  output: {
    schema: z.object({
      response: z.string().describe("The AI assistant’s response to the user query."),
    }),
  },
  prompt: `You are KisanBot, a friendly and expert AI assistant for farmers in India.
Your role is to understand the user's query and use the available tools to provide an accurate and concise answer.
You MUST respond in the same language as the user's query. The user is speaking {{language}}.
Your final response MUST be returned as a JSON object with a single key "response" that holds your text answer. For example: { "response": "Your answer goes here." }

- If the user asks about crop prices, use the 'findMarketPrice' tool.
- If the user asks about government programs or subsidies, use the 'findGovernmentScheme' tool.
- If the user describes symptoms of a sick plant (e.g., 'my tomato leaves have yellow spots and are curling'), you MUST use the 'diagnoseDiseaseFromSymptoms' tool. Extract the symptoms and the crop name to pass to the tool.
- After a tool returns a result, format it into a clear, natural language paragraph. For a disease diagnosis, present the disease and remedy clearly. For example: 'Based on the symptoms, it sounds like [disease]. Here is a recommended remedy: [remedy]'.
- If the user's query is too general for a tool (e.g., "tell me about prices"), guide them to the specific page. For instance, suggest they explore the 'Price Insights' page for market prices, the 'Crop Diagnosis' page for diseases, and the 'Schemes' page for government programs.
- If you cannot answer the question with the available tools, politely state that you can help with market prices, government schemes, and crop disease symptoms, and suggest they could try rephrasing.
- Your responses should be helpful and easy to understand for a farmer.

User Query: {{{query}}}
`,
});

// 🌾 Flow that calls the prompt and logs interaction
const kisanBotFlow = ai.defineFlow(
  {
    name: 'kisanBotFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: z.string(), // Ultimately returns a plain string to frontend
  },
  async (input) => {
    console.log('[KisanBot] Flow input:', input);

    const { output } = await kisanBotPrompt(input);

    console.log('[KisanBot] Raw Gemini output:', output);

    if (!output || !output.response) {
      throw new Error('The model did not return a valid response.');
    }

    const responseText = output.response;

    logAgentInteraction(input.query, responseText, input.language);
    return responseText;
  }
);

// 🧠 Public method: safe wrapper with fallback + error logging
export async function askKisanBot(
  query: string,
  language: SupportedLanguage = 'english'
): Promise<string> {
  try {
    const result = await kisanBotFlow({ query, language });

    if (!result) {
      throw new Error('Received an empty or invalid response from the assistant flow.');
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in askKisanBot:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack available',
      input: query,
      language,
    });

    let fallbackMessage = "I'm unable to fetch a response right now. Try again shortly or ask something simpler.";
    
    // Provide more specific feedback for common API issues
    if (errorMessage.toLowerCase().includes('api key not valid')) {
        fallbackMessage = 'There is an issue with the AI service configuration. Please check your API key.';
    } else if (errorMessage.toLowerCase().includes('quota')) {
        fallbackMessage = 'The request failed because the API quota has been exceeded. Please check the billing status and usage limits for your Google Cloud project.';
    } else if (errorMessage.toLowerCase().includes('permission denied')) {
        fallbackMessage = 'The AI service permission is denied. Please ensure the API is enabled in your cloud project.';
    }

    logAgentFailure(query, error, language);
    return fallbackMessage;
  }
}
