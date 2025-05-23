
// Fix: Added Content to the import from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content } from "@google/genai";
import { ChatMessage, QuizItem } from '../types';

let apiKeyFromEnv: string | undefined;
try {
    // This check ensures 'process', 'process.env', and 'process.env.API_KEY' are accessed safely.
    if (typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        typeof process.env.API_KEY === 'string' &&
        process.env.API_KEY.length > 0) { // Ensure API_KEY is a non-empty string
        apiKeyFromEnv = process.env.API_KEY;
    }
} catch (e) {
    // This catch is a fallback, though the typeof checks should prevent ReferenceErrors for 'process'.
    console.warn("Could not safely access process.env.API_KEY. This might be an environment without Node.js 'process' defined or API_KEY is not a string.", e);
}

const EFFECTIVE_API_KEY = apiKeyFromEnv;

if (!EFFECTIVE_API_KEY) {
  console.error(
    "CRITICAL: API_KEY environment variable not found, is empty, or is not a string. " +
    "PDF Insights Genie's core features will not function. " +
    "Ensure process.env.API_KEY is correctly set in your environment."
  );
}

// The GoogleGenAI constructor requires an apiKey argument (string).
// If EFFECTIVE_API_KEY is undefined (not found or invalid), pass a non-empty placeholder string.
// SDK calls will fail, and this is handled in each function by checking EFFECTIVE_API_KEY.
// This prevents the constructor itself from throwing due to a missing/undefined key argument.
const ai = new GoogleGenAI({ apiKey: EFFECTIVE_API_KEY || "MISSING_API_KEY_PLACEHOLDER" });

let activeChat: Chat | null = null;
let currentPdfContextForChat: string | null = null;

export const summarizeText = async (text: string): Promise<string> => {
  if (!EFFECTIVE_API_KEY) {
    console.error("summarizeText: API Key not configured.");
    return "Error: API Key not configured. Please ensure API_KEY environment variable is set.";
  }
  try {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `Please provide a concise summary of the following document. Focus on the key points and main arguments. Document: """${text}"""`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Error: Could not summarize the document.";
  }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string, pdfText: string): Promise<string> => {
  if (!EFFECTIVE_API_KEY) {
    console.error("getChatResponse: API Key not configured.");
    return "Error: API Key not configured. Please ensure API_KEY environment variable is set.";
  }
  try {
    const model = 'gemini-2.5-flash-preview-04-17';

    if (pdfText !== currentPdfContextForChat || !activeChat) {
      // Fix: Changed type of chatHistory from Part[] to Content[] to match the expected type for ai.chats.create history.
      // Each element in chatHistory is a Content object, which has 'role' and 'parts' (Part[]).
      const chatHistory: Content[] = [
        { role: 'user', parts: [{ text: `You are an AI assistant. I have provided a document with the following content. Please answer my questions based SOLELY on this document. Do not use external knowledge. If the answer is not in the document, say so. Document: """${pdfText}"""` }] },
        { role: 'model', parts: [{ text: "Understood. I have read the document and will answer your questions based on its content. How can I help you?" }] }
      ];
      
      history.slice(0,-1).forEach(msg => { 
         chatHistory.push({role: msg.role as ('user' | 'model'), parts: [{text: msg.text}]});
      });

      activeChat = ai.chats.create({
        model: model,
        history: chatHistory,
      });
      currentPdfContextForChat = pdfText;
    }
    
    const response = await activeChat.sendMessage({ message: newMessage });
    return response.text;

  } catch (error) {
    console.error("Error getting chat response:", error);
    return "Error: Could not get a response from the chat assistant.";
  }
};


export const generatePodcastScript = async (text: string): Promise<string> => {
  if (!EFFECTIVE_API_KEY) {
    console.error("generatePodcastScript: API Key not configured.");
    return "Error: API Key not configured. Please ensure API_KEY environment variable is set.";
  }
  try {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `Based on the following text, generate a script for a short podcast episode (around 300-500 words) featuring two speakers: a Host and a Guest.
The script should be engaging, cover the key points from the text, and be suitable for audio narration.
- Clearly label each speaker's lines (e.g., "Host:", "Guest:"). These labels are for script structure and speaker identification by the app, not for the TTS to speak.
- Include a brief intro (usually by the Host), main content segments where Host and Guest discuss the topic, and an outro (usually by the Host).
- You can suggest where sound effects or music might be placed using bracketed cues like [upbeat music fades] or [sound effect: page turn]. These cues are for an audio editor and should NOT be part of the spoken dialogue.
- You can also include parenthetical emotional or tonal cues for the speakers, like (excitedly) or (thoughtfully). These are also NOT to be spoken aloud by the TTS.
- Ensure a natural conversational flow. Incorporate realistic conversational elements such as brief pauses (you can indicate these with "..." in the script if it helps readability, but they will be stripped for TTS), and natural interjections like "umm," "ah," "well," "you know," "right," "so," where they would organically occur. The goal is for the dialogue to sound less like a formal reading and more like a spontaneous human conversation.

Text: """${text}"""

Example of lines:
Host: (warmly) Welcome back to "PDF Insights"! Today, we have a special guest... umm, I'm really excited for this one. [intro music fades]
Guest: Thanks for having me! (enthusiastic) Ah, yes, I'm excited to discuss this.
Host: So, well, diving right into the document, what was your main takeaway?
Guest: (thoughtfully) Well, you know, the section on climate impact really stood out to me... [sound effect: gentle underscore music starts]
`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating podcast script:", error);
    return "Error: Could not generate the podcast script.";
  }
};

export const generateContentRepurposingSuggestions = async (text: string): Promise<string[]> => {
  if (!EFFECTIVE_API_KEY) {
    console.error("generateContentRepurposingSuggestions: API Key not configured.");
    return ["Error: API Key not configured. Please ensure API_KEY environment variable is set."];
  }
  if (!text || text.trim().length < 50) { // Basic check for meaningful text
    return ["Error: Input text is too short to generate meaningful content ideas."];
  }

  try {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `Based on the following document text, please generate 3-5 creative ideas for repurposing this content into different formats.
For each idea, briefly describe what it is.
Return the output as a JSON array of strings, where each string is one content idea.

Example format:
[
  "Create a 5-tweet thread summarizing the key findings on the main topic.",
  "Write a short blog post outline discussing the implications of specific points A and B.",
  "Develop 3 talking points for a brief presentation on how concept C can be applied.",
  "Design an infographic visualizing the data presented in a data-heavy section."
]

Document Text:
"""
${text.substring(0, 15000)} 
"""
`; // Limiting text length to avoid overly large prompts

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return parsedData as string[];
      } else {
        console.error("Parsed data for content ideas is not an array of strings:", parsedData);
        return ["Error: AI returned an unexpected format for content ideas."];
      }
    } catch (e) {
      console.error("Failed to parse JSON response for content ideas:", e, "\nRaw response text:", response.text);
      // Fallback: Try to extract lines if it's not JSON but simple list
      if (!jsonStr.includes("[") && !jsonStr.includes("{")) { // Not looking like JSON
        const numListRegex = /^\d+\\.\s/; // Matches "1. ", "2. ", etc.
        const lines = response.text.split('\n').filter(line => 
            line.trim().length > 0 && 
            (line.trim().startsWith("- ") || line.trim().startsWith("* ") || numListRegex.test(line.trim()))
        );
        if (lines.length > 0) {
            const prefixToRemoveRegex = /^(- |\\\* |\\d+\\.\\s)/; // Matches "- ", "* " (literal star), or "1. " for removal
            return lines.map(l => l.trim().replace(prefixToRemoveRegex, '').trim());
        }
      }
      return ["Error: AI returned an unparseable format for content ideas. Please try again."];
    }
  } catch (error) {
    console.error("Error generating content repurposing suggestions:", error);
    if (error instanceof Error) {
        return [`Error: ${error.message}`];
    }
    return ["Error: An unknown error occurred while generating content ideas."];
  }
};

export const generateQuiz = async (text: string): Promise<QuizItem[]> => {
  if (!EFFECTIVE_API_KEY) {
    console.error("generateQuiz: API Key not configured.");
    return [{id: `err-apikey-${Date.now()}`, question: "Error: API Key not configured.", answer: "Please ensure API_KEY environment variable is set."}];
  }
   if (!text || text.trim().length < 50) {
    return [{id: `err-text-${Date.now()}`, question: "Error: Input text is too short to generate a quiz.", answer: "Provide more content."}];
  }

  try {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `Based on the following document text, please generate 3-5 unique question and answer pairs.
The questions should test understanding of the key concepts in the text.
Return the output as a JSON array of objects, where each object has a "question" (string) and an "answer" (string) field.

Example format:
[
  { "question": "What is the main topic of the document?", "answer": "The main topic is X." },
  { "question": "What are the key challenges mentioned regarding Y?", "answer": "The key challenges are A, B, and C." }
]

Document Text:
"""
${text.substring(0, 15000)}
"""
`; // Limiting text length

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'object' && item !== null && 'question' in item && 'answer' in item && typeof item.question === 'string' && typeof item.answer === 'string')) {
        return parsedData.map((item, index) => ({ ...item, id: `quiz-${Date.now()}-${index}` })) as QuizItem[];
      } else {
        console.warn("Parsed data for quiz is not an array of valid QuizItem structures:", parsedData);
        // Try to salvage if it's a list of strings that look like Q/A
        if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
            const salvagedItems: QuizItem[] = [];
            for (let i = 0; i < parsedData.length; i++) {
                const strItem = parsedData[i] as string;
                // Regex: Q or Question, optional space/digits/dots/hyphens, then colon, then capture group
                const qMatch = strItem.match(/Q(?:uestion)?[\s\d.-]*:(.*)/i);
                const aMatch = strItem.match(/A(?:nswer)?[\s\d.-]*:(.*)/i);

                if (qMatch && qMatch[1] && aMatch && aMatch[1]) {
                     salvagedItems.push({ id: `quiz-salvaged-${Date.now()}-${i}`, question: qMatch[1].trim(), answer: aMatch[1].trim() });
                } else if (i + 1 < parsedData.length && (strItem.toLowerCase().startsWith("q:") || strItem.toLowerCase().startsWith("question:")) && (parsedData[i+1].toLowerCase().startsWith("a:") || parsedData[i+1].toLowerCase().startsWith("answer:"))) {
                    salvagedItems.push({ id: `quiz-salvaged-${Date.now()}-${i}`, question: strItem.substring(strItem.indexOf(":")+1).trim(), answer: parsedData[i+1].substring(parsedData[i+1].indexOf(":")+1).trim() });
                    i++; // Increment i because we consumed the next item as an answer
                }
            }
            if(salvagedItems.length > 0) return salvagedItems;
        }
        return [{ id: `err-format-${Date.now()}`, question: "Error: AI returned an unexpected format for quiz items.", answer: "Please try regenerating the quiz." }];
      }
    } catch (e) {
      console.error("Failed to parse JSON response for quiz:", e, "\nRaw response text:", response.text);
       // Fallback if not JSON but a list of lines like Q: ... A: ...
      if (!jsonStr.includes("[") && !jsonStr.includes("{")) {
        const lines = response.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const salvagedItems: QuizItem[] = [];
        const qRegex = /Q(?:uestion)?[\s\d.-]*:(.*)/i;
        const aRegex = /A(?:nswer)?[\s\d.-]*:(.*)/i;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const qMatch = line.match(qRegex);
            const aMatch = line.match(aRegex);

            if (qMatch && qMatch[1]) {
                let answerText = "Not found";
                if (i + 1 < lines.length) {
                    const nextLineAMatch = lines[i+1].match(aRegex);
                    if (nextLineAMatch && nextLineAMatch[1]) {
                        answerText = nextLineAMatch[1].trim();
                        i++; // Consumed next line as answer
                    }
                }
                 salvagedItems.push({ id: `quiz-fallback-${Date.now()}-${salvagedItems.length}`, question: qMatch[1].trim(), answer: answerText });
            } else if (aMatch && aMatch[1] && salvagedItems.length > 0 && salvagedItems[salvagedItems.length-1].answer === "Not found") {
                // If an answer line appears without a preceding question, try to attach it to the last question if it was missing an answer
                salvagedItems[salvagedItems.length-1].answer = aMatch[1].trim();
            }
        }
        if(salvagedItems.length > 0) return salvagedItems;
      }
      return [{ id: `err-parse-${Date.now()}`, question: "Error: AI returned an unparseable format for quiz items. Please try regenerating the quiz.", answer: "Raw text: " + response.text.substring(0,100) + "..." }];
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error instanceof Error) {
      return [{id: `err-api-${Date.now()}`, question: `Error generating quiz: ${error.message}`, answer: "Please check the console for details."}];
    }
    return [{id: `err-api-unknown-${Date.now()}`, question: "An unknown error occurred while generating the quiz.", answer: "Please try again."}];
  }
};

export const generateFurtherReadingSuggestions = async (text: string): Promise<string[]> => {
  if (!EFFECTIVE_API_KEY) {
    console.error("generateFurtherReadingSuggestions: API Key not configured.");
    return ["Error: API Key not configured. Please ensure API_KEY environment variable is set."];
  }
  if (!text || text.trim().length < 50) {
    return ["Error: Input text is too short to generate meaningful suggestions."];
  }

  try {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `Based on the following document text, please generate 3-5 suggestions for further reading or exploration.
These could be related topics, key concepts for deeper study, or relevant search queries a user might employ.
Return the output as a JSON array of strings, where each string is one suggestion.

Example format:
[
  "Explore the impact of X on Y in more detail.",
  "Research the historical context of Z.",
  "Search for 'advanced techniques in A' or 'theories related to B'.",
  "Read papers by leading experts on C."
]

Document Text:
"""
${text.substring(0, 15000)} 
"""
`; // Limiting text length

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        return parsedData as string[];
      } else {
        console.error("Parsed data for further reading is not an array of strings:", parsedData);
        return ["Error: AI returned an unexpected format for further reading suggestions."];
      }
    } catch (e) {
      console.error("Failed to parse JSON response for further reading:", e, "\nRaw response text:", response.text);
      // Fallback: Try to extract lines if it's not JSON but simple list
       if (!jsonStr.includes("[") && !jsonStr.includes("{")) { 
        const lines = response.text.split('\n').filter(line => 
            line.trim().length > 0 && 
            (line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim()))
        );
        if (lines.length > 0) {
            return lines.map(l => l.trim().replace(/^(- |\* |\d+\.\s)/, '').trim());
        }
      }
      return ["Error: AI returned an unparseable format for further reading suggestions. Please try again."];
    }
  } catch (error) {
    console.error("Error generating further reading suggestions:", error);
    if (error instanceof Error) {
        return [`Error: ${error.message}`];
    }
    return ["Error: An unknown error occurred while generating further reading suggestions."];
  }
};
