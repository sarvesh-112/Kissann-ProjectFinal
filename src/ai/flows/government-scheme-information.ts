'use server';

/**
 * @fileOverview Finds relevant government schemes for farmers using a robust local search.
 * This implementation uses a fast fuzzy search (Fuse.js) to find the best match
 * directly from the `govt-schemes.json` file, ensuring reliability and speed.
 */

import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';

import {
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

// Configure Fuse.js for fuzzy searching. A lower threshold is more strict.
const fuse = new Fuse(schemes, {
  keys: ['scheme', 'summary', 'eligibility'],
  includeScore: true,
  threshold: 0.4, // A balanced threshold to catch relevant terms.
});


export async function getGovernmentSchemeInformation(
  input: GovernmentSchemeInformationInput
): Promise<GovernmentSchemeInformationOutput> {
  try {
    if (schemes.length === 0) {
      throw new Error('Government schemes data is not loaded or is empty.');
    }

    // 1. Retrieve: Use Fuse.js to find the best match directly from the JSON file.
    const searchResults = fuse.search(input.query);

    // 2. If a result is found, return the best match.
    if (searchResults.length > 0) {
      const bestMatch = searchResults[0].item;
      logSchemeQuery(input.query, bestMatch);
      return bestMatch;
    }

    // 3. If no results are found, return a clear "Not Found" response.
    const notFoundResponse: GovernmentSchemeInformationOutput = {
      scheme: 'Not Found',
      summary: `I could not find any schemes related to your query for "${input.query}". Please try rephrasing or search for a different topic.`,
      eligibility: 'N/A',
      link: 'https://www.india.gov.in/',
    };
    logSchemeQuery(input.query, notFoundResponse);
    return notFoundResponse;

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
