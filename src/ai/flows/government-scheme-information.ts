'use server';

/**
 * @fileOverview An AI agent to find relevant government schemes for farmers.
 * This implementation uses a more robust RAG (Retrieval-Augmented Generation) pattern.
 * 1. Retrieve: A local fuzzy search (Fuse.js) finds candidate schemes from a JSON file.
 * 2. Augment: The candidates are passed to the AI model.
 * 3. Generate: The AI model returns ONLY the name of the best scheme, which is safer than generating a full JSON object.
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

// Configure Fuse.js for fuzzy searching. Lower threshold is more strict.
const fuse = new Fuse(schemes, {
  keys: ['scheme', 'summary', 'eligibility'],
  includeScore: true,
  threshold: 0.5, // Loosened threshold to cast a wider net for the AI to analyze
});


// Define the input for the AI prompt, which includes the user query and a list of candidate schemes.
const SchemeSelectorPromptInputSchema = z.object({
  query: z.string(),
  candidates: z.array(z.object({
    scheme: z.string(),
    summary: z.string(),
  })),
});

// Define a simpler output schema for the AI. It only needs to return the name.
const SchemeSelectorPromptOutputSchema = z.object({
    bestSchemeName: z.string().describe('The "scheme" name of the single best match from the list, or the exact string "Not Found".'),
});


// The prompt instructs the AI to select the best match from the pre-filtered candidates.
const schemeSelectorPrompt = ai.definePrompt({
  name: 'schemeSelectorPrompt',
  input: { schema: SchemeSelectorPromptInputSchema },
  output: { schema: SchemeSelectorPromptOutputSchema },
  prompt: `You are an expert assistant for Indian farmers. Your task is to select the single most relevant government scheme from a list of pre-selected candidates that best matches the user's query.

User's Query: "{{query}}"

Here is a list of candidate government schemes.
{{#each candidates}}
- Scheme Name: "{{scheme}}", Summary: "{{summary}}"
{{/each}}

Instructions:
1.  Analyze the user's query carefully to understand their core need.
2.  Examine the candidate schemes and select the single best match for the user's query.
3.  You MUST return only the exact name of the best matching scheme.
4.  If none of the candidates are a good match, you MUST return the exact string "Not Found".
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
      // Pass only the necessary info to the prompt
      candidates: candidates.map(c => ({ scheme: c.scheme, summary: c.summary })),
    });

    if (!output || !output.bestSchemeName) {
      throw new Error("The model did not return a valid scheme name.");
    }
    
    if (output.bestSchemeName === 'Not Found') {
        return {
            scheme: 'Not Found',
            summary: `I reviewed a few options but could not find a specific scheme for "${input.query}". You can find all schemes on the official government portal.`,
            eligibility: 'N/A',
            link: 'https://www.india.gov.in/',
        };
    }

    // Find the full scheme details from the original list
    const finalScheme = schemes.find(s => s.scheme === output.bestSchemeName);

    if (!finalScheme) {
      // This case handles if the AI hallucinates a scheme name not in the list.
      throw new Error(`Model returned a scheme name "${output.bestSchemeName}" that was not in the candidate list.`);
    }

    return finalScheme;
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
