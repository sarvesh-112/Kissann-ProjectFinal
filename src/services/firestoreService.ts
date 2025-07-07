'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { 
    DiagnoseCropDiseaseOutput,
    MarketPriceAnalysisInput,
    MarketPriceAnalysisOutput,
    GovernmentSchemeInformationOutput
} from '@/ai/schemas';

// A placeholder for session management. In a real app, you'd get this from user auth.
const getSessionInfo = () => ({
  sessionId: 'session_placeholder_id',
  language: 'en', // Default language, can be updated later
});

export const logDiseaseDiagnosis = async (
  imageDataUri: string,
  result: DiagnoseCropDiseaseOutput
) => {
  try {
    if (!db) return;
    const { sessionId, language } = getSessionInfo();
    await addDoc(collection(db, 'disease_diagnosis_logs'), {
      // Storing the full data URI can be large. In production, consider storing a GCS link.
      image_preview: imageDataUri.substring(0, 100) + '...',
      result,
      sessionId,
      language,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    // In a real app, you might want more robust error logging here.
    console.error('Error logging disease diagnosis to Firestore:', error);
  }
};

export const logPriceQuery = async (
  input: MarketPriceAnalysisInput,
  result: MarketPriceAnalysisOutput
) => {
  try {
    if (!db) return;
    const { sessionId, language } = getSessionInfo();
    await addDoc(collection(db, 'price_queries'), {
      query: input,
      result,
      sessionId,
      language,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging price query to Firestore:', error);
  }
};

export const logSchemeQuery = async (
  query: string,
  result: GovernmentSchemeInformationOutput
) => {
  try {
    if (!db) return;
    const { sessionId, language } = getSessionInfo();
    await addDoc(collection(db, 'scheme_queries'), {
      query,
      result,
      sessionId,
      language,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging scheme query to Firestore:', error);
  }
};
