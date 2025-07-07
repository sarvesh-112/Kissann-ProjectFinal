'use server';

/**
 * @fileOverview An AI agent to diagnose crop diseases from an image and provide remedies.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { logDiseaseDiagnosis } from '@/services/firestoreService';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  disease: z.string().describe('The detected disease or pest affecting the crop.'),
  remedy: z.string().describe('Local remedy suggestions to address the identified issue.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
    try {
        const result = await diagnoseCropDiseaseFlow(input);
        // Do not await logging to avoid delaying the response to the user
        logDiseaseDiagnosis(input.photoDataUri, result);
        return result;
    } catch (error) {
        console.error("Error in diagnoseCropDisease flow:", error);
        throw new Error("Failed to diagnose crop disease.");
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
