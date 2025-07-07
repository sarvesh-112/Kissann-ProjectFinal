'use server';
/**
 * @fileOverview A government scheme information retrieval AI agent.
 *
 * - getGovernmentSchemeInformation - A function that handles the government scheme information retrieval process.
 * - GovernmentSchemeInformationInput - The input type for the getGovernmentSchemeInformation function.
 * - GovernmentSchemeInformationOutput - The return type for the getGovernmentSchemeInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { logSchemeQuery } from '@/services/firestoreService';

const GovernmentSchemeInformationInputSchema = z.object({
  query: z.string().describe('The farmer\u2019s query about government schemes.'),
});
export type GovernmentSchemeInformationInput = z.infer<typeof GovernmentSchemeInformationInputSchema>;

const GovernmentSchemeInformationOutputSchema = z.object({
  scheme: z.string().describe('The name of the relevant government scheme.'),
  eligibility: z.string().describe('The eligibility criteria for the scheme.'),
  link: z.string().url().describe('A link to apply for or learn more about the scheme.'),
  summary: z.string().describe('A summary of the scheme.'),
});
export type GovernmentSchemeInformationOutput = z.infer<typeof GovernmentSchemeInformationOutputSchema>;

export async function getGovernmentSchemeInformation(input: GovernmentSchemeInformationInput): Promise<GovernmentSchemeInformationOutput> {
    try {
        const result = await governmentSchemeInformationFlow(input);
        // Do not await logging
        logSchemeQuery(input.query, result);
        return result;
    } catch (error) {
        console.error("Error in getGovernmentSchemeInformation flow:", error);
        throw new Error("Failed to retrieve government scheme information.");
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
