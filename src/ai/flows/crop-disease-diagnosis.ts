'use server';

/**
 * @fileOverview An AI agent to diagnose crop diseases from an image and provide remedies.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import { logDiseaseDiagnosis } from '@/services/firestoreService';
import { 
    DiagnoseCropDiseaseInputSchema, 
    DiagnoseCropDiseaseOutputSchema,
    type DiagnoseCropDiseaseInput,
    type DiagnoseCropDiseaseOutput 
} from '@/ai/schemas';

export type { DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput };

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
    try {
        const result = await diagnoseCropDiseaseFlow(input);
        // Do not await logging to avoid delaying the response to the user
        if (result.disease !== 'Diagnosis Failed') {
            logDiseaseDiagnosis(input.photoDataUri, result);
        }
        return result;
    } catch (error) {
        console.error("Error in diagnoseCropDisease flow:", error);
        // Return a structured fallback response to be handled by the UI
        return {
            disease: "Diagnosis Failed",
            remedy: "Sorry, I was unable to analyze the image. This could be due to a temporary issue or if the image is unclear. Please try again with a different photo."
        };
    }
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {schema: DiagnoseCropDiseaseInputSchema},
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the provided image of a crop and identify any potential diseases or pests.
  Based on your analysis, suggest local remedies that a farmer can apply to address the issue.
  Use the following image for diagnosis:
  {{media url=photoDataUri}}`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return a valid diagnosis.");
    }
    return output;
  }
);
