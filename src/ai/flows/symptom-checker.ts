'use server';

/**
 * @fileOverview An AI agent to diagnose crop diseases from a text description of symptoms.
 *
 * - getDiagnosisFromSymptoms - A function that handles the diagnosis process.
 */

import {ai} from '@/ai/genkit';
import { 
    DiagnoseCropDiseaseBySymptomsInputSchema,
    DiagnoseCropDiseaseOutputSchema,
    type DiagnoseCropDiseaseBySymptomsInput
} from '@/ai/schemas';

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseaseBySymptomsPrompt',
  input: {schema: DiagnoseCropDiseaseBySymptomsInputSchema},
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the provided symptoms for the specified crop and identify the most likely disease or pest.
  
  Crop: {{#if crop}}{{crop}}{{else}}Not Specified{{/if}}
  Symptoms: {{symptoms}}
  
  Based on your analysis, provide a concise diagnosis and suggest simple, actionable remedies a farmer in India can apply.`,
});

const diagnoseCropDiseaseBySymptomsFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseBySymptomsFlow',
    inputSchema: DiagnoseCropDiseaseBySymptomsInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return a valid diagnosis from the symptoms provided.");
    }
    return output;
  }
);

export async function getDiagnosisFromSymptoms(input: DiagnoseCropDiseaseBySymptomsInput) {
  return diagnoseCropDiseaseBySymptomsFlow(input);
}
