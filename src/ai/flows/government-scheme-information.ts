'use server';
/**
 * @fileOverview A government scheme information retrieval AI agent.
 *
 * - getGovernmentSchemeInformation - A function that handles the government scheme information retrieval process.
 */

import {ai} from '@/ai/genkit';
import { logSchemeQuery, logSchemeQueryFailure } from '@/services/firestoreService';
import { 
    GovernmentSchemeInformationInputSchema, 
    GovernmentSchemeInformationOutputSchema, 
    type GovernmentSchemeInformationInput, 
    type GovernmentSchemeInformationOutput 
} from '@/ai/schemas';


export async function getGovernmentSchemeInformation(input: GovernmentSchemeInformationInput): Promise<GovernmentSchemeInformationOutput> {
    try {
        const result = await governmentSchemeInformationFlow(input);
        // Do not await logging
        logSchemeQuery(input.query, result);
        return result;
    } catch (error) {
        console.error("Error in getGovernmentSchemeInformation flow, returning fallback:", error);
        // Do not await logging
        logSchemeQueryFailure(input.query, error);
        return {
            scheme: "Information Not Available",
            eligibility: "Could not determine eligibility at this time.",
            summary: "We're currently facing a temporary issue retrieving scheme details. Please try your query again later.",
            link: "https://agricoop.nic.in/"
        };
    }
}

const prompt = ai.definePrompt({
  name: 'governmentSchemeInformationPrompt',
  input: {schema: GovernmentSchemeInformationInputSchema},
  output: {schema: GovernmentSchemeInformationOutputSchema},
  prompt: `You are an expert on Indian government schemes for farmers.
  Based on the user's query, identify the most relevant scheme.
  Provide a concise summary, the eligibility criteria, and a valid application link.

  User Query: {{{query}}}

  If no specific scheme matches, provide information on a general agricultural support scheme.
  Ensure the link is a valid, working URL.
`,
});

const governmentSchemeInformationFlow = ai.defineFlow(
  {
    name: 'governmentSchemeInformationFlow',
    inputSchema: GovernmentSchemeInformationInputSchema,
    outputSchema: GovernmentSchemeInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return valid scheme information.");
    }
    return output;
  }
);
