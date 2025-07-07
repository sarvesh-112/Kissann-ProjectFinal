'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) service.
 *
 * - textToSpeech - A function that converts text to speech.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';
import {
    TextToSpeechInputSchema,
    TextToSpeechOutputSchema,
    type TextToSpeechInput,
    type TextToSpeechOutput
} from '@/ai/schemas';

export async function textToSpeech(
  input: TextToSpeechInput,
  languageCode: 'en-US' | 'kn-IN' = 'kn-IN'
): Promise<TextToSpeechOutput> {
  return ttsFlow({ text: input, languageCode });
}

const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: z.object({
        text: TextToSpeechInputSchema,
        languageCode: z.enum(['en-US', 'kn-IN']),
    }),
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, languageCode }) => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          languageCode: languageCode,
        },
      },
      prompt: text,
    });
    if (!media) {
      throw new Error('no media returned from TTS model');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavData = await toWav(audioBuffer);
    return {
      media: 'data:audio/wav;base64,' + wavData,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
