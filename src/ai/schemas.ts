/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
 * This file does not use 'use server' and can be safely imported by both
 * client and server components.
 */

import {z} from 'genkit';

// Schemas for Crop Disease Diagnosis (Image-based)
export const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

export const DiagnoseCropDiseaseOutputSchema = z.object({
  disease: z.string().describe('The detected disease or pest affecting the crop.'),
  remedy: z.string().describe('Local remedy suggestions to address the identified issue.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;


// Schemas for Crop Disease Diagnosis (Symptom-based)
export const DiagnoseCropDiseaseBySymptomsInputSchema = z.object({
  symptoms: z.string().describe('A text description of the crop symptoms.'),
  crop: z.string().optional().describe('The name of the crop affected.'),
});
export type DiagnoseCropDiseaseBySymptomsInput = z.infer<typeof DiagnoseCropDiseaseBySymptomsInputSchema>;


// Schemas for Market Price Analysis
export const MarketPriceAnalysisInputSchema = z.object({
  crop: z.string().describe('The crop to get market prices for, e.g., tomato, potato.'),
  location: z.string().describe('The location to get market prices for, e.g., Hassan, Bangalore.'),
});
export type MarketPriceAnalysisInput = z.infer<typeof MarketPriceAnalysisInputSchema>;

export const MarketPriceAnalysisOutputSchema = z.object({
  summary: z.string().describe('A summary of the current market prices for the crop.'),
  advice: z.string().describe('Advice on whether to sell or wait, based on the market prices.'),
});
export type MarketPriceAnalysisOutput = z.infer<typeof MarketPriceAnalysisOutputSchema>;

// Schemas for Government Scheme Information
export const GovernmentSchemeInformationInputSchema = z.object({
  query: z.string().describe('The farmer’s query about government schemes.'),
});
export type GovernmentSchemeInformationInput = z.infer<typeof GovernmentSchemeInformationInputSchema>;

export const GovernmentSchemeInformationOutputSchema = z.object({
  scheme: z.string().describe('The name of the relevant government scheme.'),
  eligibility: z.string().describe('The eligibility criteria for the scheme.'),
  link: z.string().url().describe('A link to apply for or learn more about the scheme.'),
  summary: z.string().describe('A summary of the scheme.'),
});
export type GovernmentSchemeInformationOutput = z.infer<typeof GovernmentSchemeInformationOutputSchema>;

// Schemas for Text-to-Speech
export const TextToSpeechInputSchema = z.string();
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  media: z.string().describe('The base64 encoded WAV audio data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// Supported Languages for KisanBot
export const SupportedLanguageSchema = z.enum(['english', 'kannada', 'hindi', 'tamil']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;
