// GovernmentSchemeInformation.ts
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

const GovernmentSchemeInformationInputSchema = z.object({
  query: z.string().describe('The farmer\u2019s query about government schemes.'),
});
export type GovernmentSchemeInformationInput = z.infer<typeof GovernmentSchemeInformationInputSchema>;

const GovernmentSchemeInformationOutputSchema = z.object({
  scheme: z.string().describe('The name of the relevant government scheme.'),
  eligibility: z.string().describe('The eligibility criteria for the scheme.'),
  link: z.string().url().describe('A link to apply for the scheme.'),
  summary: z.string().describe('A summary of the scheme.'),
});
export type GovernmentSchemeInformationOutput = z.infer<typeof GovernmentSchemeInformationOutputSchema>;

export async function getGovernmentSchemeInformation(input: GovernmentSchemeInformationInput): Promise<GovernmentSchemeInformationOutput> {
  return governmentSchemeInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'governmentSchemeInformationPrompt',
  input: {schema: GovernmentSchemeInformationInputSchema},
  output: {schema: GovernmentSchemeInformationOutputSchema},
  prompt: `You are an expert in government schemes for farmers.

You will use this information to understand the farmer's query and match relevant schemes.

Query: {{{query}}}

Match relevant scheme(s), summarize eligibility, and provide an application link.
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
    return output!;
  }
);
