
// WARNING: Storing API keys directly in client-side code is a MAJOR SECURITY RISK.
// This key is visible to anyone inspecting the browser's JavaScript code.
// For production applications, API keys should be handled securely,
// typically by making requests through a backend server that proxies requests
// to the third-party API and stores the key in a secure environment variable.
// The key below was provided by the user for this specific development context.
const GOOGLE_TTS_API_KEY = 'AIzaSyAK_kdJ0zVsNSM7eH7Bk_LyRLBdpZikd80';

/**
 * Generates audio from the given text using the Google Cloud Text-to-Speech API.
 * @param text The text to convert to speech.
 * @param voiceName The name of the Google Cloud TTS voice to use (e.g., 'en-US-Standard-C').
 * @returns A promise that resolves to an object URL for the generated audio.
 * @throws Will throw an error if the API key is missing or if the API request fails.
 */
export const generateAudioFromGoogleTTS = async (text: string, voiceName: string): Promise<string> => {
  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY.length < 20) {
    console.error('Google Cloud TTS API key is not configured or seems invalid.');
    throw new Error('Google Cloud TTS API key is not properly configured.');
  }
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate audio from empty text.');
  }
  if (!voiceName) {
    throw new Error('Voice name must be provided for audio generation.');
  }

  const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;
  
  try {
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: text },
        voice: {
          languageCode: 'en-US', 
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          effectsProfileId: ['headphone-class-device'] // Added for potentially better quality with Chirp3
        },
      }),
    });

    if (!response.ok) {
      let errorBody = "Unknown error";
      try {
        const errorData = await response.json();
        if (errorData && errorData.error && errorData.error.message) {
            errorBody = errorData.error.message;
        } else {
            errorBody = response.statusText;
        }
      } catch (e) {
        errorBody = response.statusText;
      }
      console.error('Google Cloud TTS API Error:', response.status, errorBody);
      throw new Error(`Google Cloud TTS API request failed: ${errorBody}`);
    }

    const responseData = await response.json();
    if (!responseData.audioContent) {
        throw new Error('Google Cloud TTS API returned no audio content. The input text might be too short or contain only unsupported characters.');
    }

    const byteCharacters = atob(responseData.audioContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
    
    if (audioBlob.size === 0) {
        throw new Error('Google Cloud TTS API resulted in an empty audio file after decoding.');
    }
    return URL.createObjectURL(audioBlob);

  } catch (error) {
    console.error('Error generating audio from Google Cloud TTS:', error);
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(String(error) || 'An unknown error occurred during Google TTS audio generation.');
    }
  }
};
