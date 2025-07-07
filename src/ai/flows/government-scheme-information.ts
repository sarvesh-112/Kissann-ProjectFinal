'use server';

/**
 * @fileOverview An AI agent to find relevant government schemes for farmers by reasoning over a local JSON file.
 */

import fs from 'fs';
import path from 'path';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

import {
  GovernmentSchemeInformationInputSchema,
  GovernmentSchemeInformationOutputSchema,
  type GovernmentSchemeInformationInput,
  type GovernmentSchemeInformationOutput,
} from '@/ai/schemas';

import {
  logSchemeQuery,
  logSchemeQueryFailure,
} from '@/services/firestoreService';

// Load the schemes data from the JSON file.
const SCHEMES_FILE = path.join(process.cwd(), 'src/data/govt-schemes.json');
let schemes: any[] = [];
let schemesJSON: string = '';
try {
  const raw = fs.readFileSync(SCHEMES_FILE, 'utf-8');
  schemes = JSON.parse(raw);
  schemesJSON = JSON.stringify(schemes, null, 2); // Keep the JSON string for the prompt
} catch (error) {
  console.error('❌ Failed to load or parse govt-schemes.json:', error);
}

// Define the input for the AI prompt, which includes the user query and the list of schemes.
const SchemeFinderPromptInputSchema = z.object({
  query: z.string(),
  schemes: z.string(), // JSON string of all schemes
});

// The prompt instructs the AI to find the best match from the JSON data.
const schemeFinderPrompt = ai.definePrompt({
  name: 'schemeFinderPrompt',
  input: { schema: SchemeFinderPromptInputSchema },
  output: { schema: GovernmentSchemeInformationOutputSchema },
  prompt: `You are an expert assistant for Indian farmers. Your task is to find the most relevant government scheme from the provided JSON data that matches the user's query.

User's Query: "{{query}}"

Here is the list of available government schemes in JSON format:
\`\`\`json
{{schemes}}
\`\`\`

Instructions:
1.  Analyze the user's query to understand their need (e.g., "loan for seeds", "crop insurance", "help for organic farming").
2.  Carefully search through the provided JSON data to find the *single best* scheme that addresses the user's need.
3.  If you find a relevant scheme, return its details ("scheme", "summary", "eligibility", "link") in the exact output format.
4.  If no scheme directly matches the query, use your best judgment to find the closest one.
5.  If you are absolutely sure that no scheme is relevant, return an object with the scheme name "Not Found" and a helpful summary explaining that you could not find a match in the provided data.
`,
});


const schemeFinderFlow = ai.defineFlow(
  {
    name: 'schemeFinderFlow',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async (input) => {
    // We pass the user's query and the full list of schemes to the AI.
    const { output } = await schemeFinderPrompt({
      query: input.query,
      schemes: schemesJSON,
    });

    if (!output) {
      throw new Error("The model did not return a valid scheme information object.");
    }
    
    return output;
  }
);


export async function getGovernmentSchemeInformation(
  input: GovernmentSchemeInformationInput
): Promise<GovernmentSchemeInformationOutput> {
  try {
    if (schemes.length === 0) {
      throw new Error('Government schemes data is not loaded or is empty.');
    }
    const result = await schemeFinderFlow(input);
    logSchemeQuery(input.query, result);
    return result;
  } catch (error) {
    console.error('Error in getGovernmentSchemeInformation flow:', error);
    const fallbackResponse: GovernmentSchemeInformationOutput = {
      scheme: 'Error',
      summary: 'Sorry, I had a problem searching for schemes right now. Please try again later.',
      eligibility: 'N/A',
      link: 'https://www.india.gov.in/',
    };
    logSchemeQueryFailure(input.query, error);
    return fallbackResponse;
  }
}
