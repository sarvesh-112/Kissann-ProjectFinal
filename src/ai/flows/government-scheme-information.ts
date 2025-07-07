'use server';

/**
 * @fileOverview An AI agent to find relevant government schemes for farmers.
 * This implementation uses a RAG (Retrieval-Augmented Generation) pattern.
 * 1. Retrieve: A local fuzzy search (Fuse.js) finds candidate schemes from a JSON file.
 * 2. Augment: The candidates are passed to the AI model.
 * 3. Generate: The AI model reasons over the candidates to find the best match.
 */

import fs from 'fs';
import path from 'path';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Fuse from 'fuse.js';

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

// Configure Fuse.js for fuzzy searching
const fuse = new Fuse(schemes, {
  keys: ['scheme', 'summary', 'eligibility'],
  includeScore: true,
  threshold: 0.4, // Adjust threshold for sensitivity
});


// Define the input for the AI prompt, which includes the user query and a list of candidate schemes.
const SchemeSelectorPromptInputSchema = z.object({
  query: z.string(),
  candidates: z.string(), // JSON string of candidate schemes
});

// The prompt instructs the AI to select the best match from the pre-filtered candidates.
const schemeSelectorPrompt = ai.definePrompt({
  name: 'schemeSelectorPrompt',
  input: { schema: SchemeSelectorPromptInputSchema },
  output: { schema: GovernmentSchemeInformationOutputSchema },
  prompt: `You are an expert assistant for Indian farmers. Your task is to select the single most relevant government scheme from a list of pre-selected candidates that best matches the user's query.

User's Query: "{{query}}"

Here is a list of candidate government schemes in JSON format. These have been pre-filtered to be potentially relevant.
\`\`\`json
{{candidates}}
\`\`\`

Instructions:
1.  Analyze the user's query carefully to understand their core need.
2.  Examine the candidate schemes and select the single best match for the user's query.
3.  If you find a perfectly relevant scheme, return its details ("scheme", "summary", "eligibility", "link") in the required JSON format.
4.  If none of the candidates are a good match, you MUST return an object with \`scheme: "Not Found"\`, \`summary: "A helpful message explaining no match was found for the query '{{query}}'"\`, \`eligibility: "N/A"\`, and \`link: "https://www.india.gov.in/"\`.
`,
});


const schemeFinderFlow = ai.defineFlow(
  {
    name: 'schemeFinderFlow',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async (input) => {
    // 1. Retrieve: Use Fuse.js to find top 5 candidate schemes
    const searchResults = fuse.search(input.query).slice(0, 5);
    const candidates = searchResults.map(result => result.item);

    // If no candidates are found by the local search, return a specific message.
    if (candidates.length === 0) {
        return {
            scheme: 'Not Found',
            summary: `I could not find any schemes related to your query for "${input.query}". Please try rephrasing or search for a different topic.`,
            eligibility: 'N/A',
            link: 'https://www.india.gov.in/',
        };
    }
    
    // 2. Augment & 3. Generate: Pass candidates to the AI for the final selection
    const { output } = await schemeSelectorPrompt({
      query: input.query,
      candidates: JSON.stringify(candidates, null, 2),
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
