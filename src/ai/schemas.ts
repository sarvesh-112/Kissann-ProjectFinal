/**
 * @fileOverview
 * Defines the Zod schemas and TypeScript types for the AI flows in KisanBot.
 * These can be safely shared across client and server components.
 */

import { z } from 'genkit';

//
// 🔤 Supported Languages
//
export const SupportedLanguageSchema = z.enum(['english', 'hindi', 'kannada', 'tamil']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

//
// 🧪 Crop Disease Diagnosis (Image-based)
//
export const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z.string().describe(
    "A photo of a crop as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

export const DiagnoseCropDiseaseOutputSchema = z.object({
  disease: z.string().describe('The detected disease or pest affecting the crop.'),
  remedy: z.string().describe('Local remedy suggestions to address the identified issue.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

//
// 📝 Crop Disease Diagnosis (Symptom-based)
//
export const DiagnoseCropDiseaseBySymptomsInputSchema = z.object({
  symptoms: z.string().describe('A text description of the crop symptoms.'),
  crop: z.string().optional().describe('The name of the crop affected (optional).'),
});
export type DiagnoseCropDiseaseBySymptomsInput = z.infer<
  typeof DiagnoseCropDiseaseBySymptomsInputSchema
>;

//
// 📈 Market Price Analysis
//
export const MarketPriceAnalysisInputSchema = z.object({
  crop: z.string().describe('The crop to get market prices for, e.g., tomato, paddy.'),
  location: z.string().describe('The location to get market prices for, e.g., Mandya, Bengaluru.'),
});
export type MarketPriceAnalysisInput = z.infer<typeof MarketPriceAnalysisInputSchema>;

export const MarketPriceAnalysisOutputSchema = z.object({
  summary: z.string().describe('Summary of the current market price trend.'),
  advice: z.string().describe('Suggested action for the farmer based on current prices.'),
});
export type MarketPriceAnalysisOutput = z.infer<typeof MarketPriceAnalysisOutputSchema>;

//
// 🏛️ Government Scheme Information
//
export const GovernmentSchemeInformationInputSchema = z.object({
  query: z.string().describe('The farmer’s question or interest related to government schemes.'),
});
export type GovernmentSchemeInformationInput = z.infer<
  typeof GovernmentSchemeInformationInputSchema
>;

export const GovernmentSchemeInformationOutputSchema = z.object({
  scheme: z.string().describe('The name of the relevant government scheme.'),
  summary: z.string().describe('A plain-language explanation of what the scheme offers.'),
  eligibility: z.string().describe('The eligibility criteria for the scheme.'),
  link: z.string().describe('A link to apply for or read more about the scheme.'),
});
export type GovernmentSchemeInformationOutput = z.infer<
  typeof GovernmentSchemeInformationOutputSchema
>;

//
// 🔊 Text-to-Speech (TTS)
//
export const TextToSpeechInputSchema = z.string();
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  media: z.string().describe('Base64-encoded WAV audio data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
