'use server';

/**
 * @fileOverview An AI agent to find relevant government schemes for farmers.
 */

import fs from 'fs';
import path from 'path';
import { z } from 'genkit';
import { ai } from '@/ai/genkit';

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
try {
  const raw = fs.readFileSync(SCHEMES_FILE, 'utf-8');
  schemes = JSON.parse(raw);
} catch (error) {
  console.error('❌ Failed to load or parse govt-schemes.json:', error);
}

const schemeFinderPrompt = ai.definePrompt({
  name: 'schemeFinderPrompt',
  input: {
    schema: z.object({
      query: z.string(),
      schemes: z.any(), // Pass the whole list as a stringified JSON
    }),
  },
  output: { schema: GovernmentSchemeInformationOutputSchema },
  prompt: `You are an expert on Indian government agricultural schemes. Your task is to find the most relevant scheme for a farmer based on their query.

Here is the list of available schemes:
\`\`\`json
{{{schemes}}}
\`\`\`

Here is the farmer's query: "{{query}}"

Analyze the query and select the single best matching scheme from the list. If no scheme is a good match, you MUST return an object with the "scheme" field set to "Not Found" and provide a helpful message in the "summary" explaining that you couldn't find a direct match.
Do not invent schemes. Only use information from the provided JSON list.
`,
});

const schemeFinderFlow = ai.defineFlow(
  {
    name: 'schemeFinderFlow',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async (input) => {
    // Stringify the schemes to pass them into the prompt
    const schemesAsJsonString = JSON.stringify(schemes, null, 2);

    const { output } = await schemeFinderPrompt({
      query: input.query,
      schemes: schemesAsJsonString,
    });

    if (!output) {
      throw new Error('The model did not return a valid scheme.');
    }
    return output;
  }
);


export async function getGovernmentSchemeInformation(
  input: GovernmentSchemeInformationInput
): Promise<GovernmentSchemeInformationOutput> {
  try {
    if (schemes.length === 0) {
        throw new Error("Government schemes data is not loaded.");
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
