'use server';
/**
 * @fileOverview A conversational AI assistant for farmers called KisanBot.
 *
 * - askKisanBot - A function that handles conversational queries.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
    type SupportedLanguage
} from '@/ai/schemas';
import { logAgentInteraction, logAgentFailure } from '@/services/firestoreService';


const AssistantInputSchema = z.object({
  query: z.string().describe('The user query.'),
  language: SupportedLanguageSchema.describe('The language of the user query.'),
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

const diagnoseDiseaseFromSymptoms = ai.defineTool(
  {
    name: 'diagnoseDiseaseFromSymptoms',
    description: 'Diagnose a crop disease based on a text description of its symptoms.',
    inputSchema: DiagnoseCropDiseaseBySymptomsInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => {
    return getDiagnosisFromSymptoms(input);
  }
);


// Define the main assistant prompt
const kisanBotPrompt = ai.definePrompt({
  name: 'kisanBotPrompt',
  tools: [findMarketPrice, findGovernmentScheme, diagnoseDiseaseFromSymptoms],
  input: { schema: AssistantInputSchema },
  // Changed schema to `z.any()` for debugging, as Gemini might return a structured object from tools.
  output: { schema: z.any() },
  prompt: `You are KisanBot, a friendly and expert AI assistant for farmers in India.
Your role is to understand the user's query and use the available tools to provide an accurate and concise answer.
You MUST respond in the same language as the user's query. The user is speaking {{language}}.

- If the user asks about crop prices, use the 'findMarketPrice' tool.
- If the user asks about government programs or subsidies, use the 'findGovernmentScheme' tool.
- If the user describes symptoms of a sick plant (e.g., 'leaves have yellow spots'), use the 'diagnoseDiseaseFromSymptoms' tool.
- After a tool returns a result, format it into a clear, natural language paragraph. Do not just return the raw JSON.
- If you cannot answer the question with the available tools, politely state that you can help with market prices, government schemes, and crop disease symptoms.
- Your responses should be helpful and easy to understand for a farmer.

User Query: {{{query}}}
`,
});

// Define the main flow
const kisanBotFlow = ai.defineFlow(
  {
    name: 'kisanBotFlow',
    inputSchema: AssistantInputSchema,
    // The flow must ultimately return a string to the client-side function.
    outputSchema: z.string(),
  },
  async (input) => {
    console.log("[KisanBot] Flow received input:", input);
    
    const { output } = await kisanBotPrompt(input);
    
    console.log("[KisanBot] Raw output from Gemini:", output);

    if (!output) {
      throw new Error("The model did not return a valid response.");
    }

    // The output can be a string or a structured object from a tool call.
    // We ensure it's always a string before returning.
    const responseText = typeof output === 'string' ? output : JSON.stringify(output, null, 2);

    // Do not await logging
    logAgentInteraction(input.query, responseText, input.language);

    return responseText;
  }
);

export async function askKisanBot(query: string, language: SupportedLanguage = 'english'): Promise<string> {
    try {
        const result = await kisanBotFlow({ query, language });
         if (!result) {
            throw new Error("Received an empty or invalid response from the assistant flow.");
        }
        return result;
    } catch (error) {
        // Detailed logging for debugging.
        console.error("Error in askKisanBot:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack available',
            input: query,
            language: language,
        });

        const fallbackMessage = "Sorry, I am having trouble connecting right now. Please try again in a moment.";

        // Log the failure to a dedicated Firestore collection for monitoring.
        // Do not await this to avoid delaying the user response.
        logAgentFailure(query, error, language);
        
        return fallbackMessage;
    }
}
