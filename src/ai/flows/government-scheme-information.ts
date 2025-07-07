'use server';

/**
 * @fileOverview An AI agent to find relevant government schemes for farmers using local search.
 */

import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';
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

// Initialize Fuse.js for fuzzy searching
const fuse = new Fuse(schemes, {
  keys: ['scheme', 'summary', 'eligibility'],
  threshold: 0.4, // Adjust for more or less strict matching
  includeScore: true,
});

const schemeFinderFlow = ai.defineFlow(
  {
    name: 'schemeFinderFlow',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async (input) => {
    const results = fuse.search(input.query);

    if (results.length > 0) {
      // The best match is the first result with the lowest score
      const bestMatch = results[0].item;
      return {
        scheme: bestMatch.scheme,
        summary: bestMatch.summary,
        eligibility: bestMatch.eligibility,
        link: bestMatch.link,
      };
    } else {
      // If no suitable match is found, return a "Not Found" response.
      // This is handled as a successful flow, but with a specific output.
      return {
        scheme: 'Not Found',
        summary: `I could not find a specific scheme related to "${input.query}". Please try rephrasing your question or ask about a different topic.`,
        eligibility: 'N/A',
        link: 'https://www.india.gov.in/',
      };
    }
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
    // Log the successful query, even if it's a "Not Found" result
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
