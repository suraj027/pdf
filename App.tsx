

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, PdfNote, QuizItem } from './types'; // AppView might be deprecated or redefined
import { 
  APP_LOGO_ICON, PLUS_ICON, ELLIPSIS_VERTICAL_ICON,
  HAMBURGER_ICON, CLOSE_ICON_PANEL, LIGHTBULB_ICON, QUIZ_ICON, COMPASS_ICON 
} from './constants';
import { extractTextFromPdf } from './services/pdfService';
import { 
    summarizeText, getChatResponse, generatePodcastScript, 
    generateContentRepurposingSuggestions, generateQuiz,
    generateFurtherReadingSuggestions
} from './services/geminiService';
import { generateAudioFromGoogleTTS } from './services/googleTtsService'; 
import Spinner from './components/common/Spinner';
import Alert from './components/common/Alert';


let apiKeyIsPresent = false;
try {
    if (typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        typeof process.env.API_KEY === 'string' &&
        process.env.API_KEY.length > 0) {
        apiKeyIsPresent = true;
    }
} catch (e) {
    console.warn("App.tsx: Could not safely access process.env.API_KEY.", e);
}
const API_KEY_CONFIGURED = apiKeyIsPresent;

const HOST_VOICE_NAME = 'en-US-Chirp3-HD-Autonoe'; 
const GUEST_VOICE_NAME = 'en-US-Chirp3-HD-Schedar';

interface PodcastSegment {
  id: string;
  speaker: 'Host' | 'Guest'; 
  rawText: string;
  cleanedText: string;
  audioUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AppProps {
  initialNote: PdfNote | null;
  initialFile: File | null;
  onInitialFileProcessed: () => void;
  onNoteProcessed: (data: {
    pdfName: string;
    pdfText: string;
    summary: string | null;
    podcastScript?: string | null;
  }) => void;
  onBackToDashboard: () => void;
}

// Placeholder Icons (replace with actual SVGs from reference or similar ones)
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 4.184 2.25 2.25 0 000-4.184zm0 0A2.25 2.25 0 115.5 13.25v-1.5a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 11-2.25-2.25m0 0h1.5m-1.5 0A2.25 2.25 0 105.5 13.25v-1.5a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 11-2.25-2.25m0 0h1.5m6.25-3.375a2.25 2.25 0 100 4.184 2.25 2.25 0 000-4.184z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-3.352-2.264-6.167-5.25-6.912C13.56 4.363 12.903 4 12 4s-1.56.363-2.25.088C6.764 5.833 4.5 8.648 4.5 12s2.264 6.167 5.25 6.912c.687.729 1.597 1.088 2.25 1.088s1.56-.363 2.25-1.088C17.236 18.167 19.5 15.352 19.5 12z" /></svg>; 
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-.998h2.593c.55-.005 1.02.456 1.11.998l.098.544c.497.195.965.462 1.396.799l.455-.15a1.125 1.125 0 011.268.619l1.297 2.247a1.125 1.125 0 01-.282 1.449l-.396.33c.042.26.062.523.062.791s-.02.532-.062.791l.396.33a1.125 1.125 0 01.282 1.449l-1.297 2.247a1.125 1.125 0 01-1.268.619l-.455-.15c-.43.337-.898.604-1.396.799l-.098.544c-.09.542-.56 1.004-1.11.998h-2.593c-.55.006-1.02-.456-1.11-.998l-.098-.544a6.099 6.099 0 01-1.396-.8l-.455.15a1.125 1.125 0 01-1.268-.619l-1.297-2.247a1.125 1.125 0 01.282-1.449l.396-.33a6.044 6.044 0 01-.062-.791c0-.268.02-.531.062-.791l-.396-.33a1.125 1.125 0 01-.282-1.449l1.297-2.247a1.125 1.125 0 011.268-.619l.455.15c.43-.337.898.604 1.396-.799l.098-.544z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; 
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>; 
const UserAvatar = () => <img className="w-full h-full rounded-full" src="https://via.placeholder.com/32" alt="User Avatar" />;
const PanelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-1.5 5.25H12" /></svg>;
const DiscoverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
// const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625v2.625m-7.5-2.625v-3.5m7.5 2.625c.621 0 1.125-.504 1.125-1.125V15c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v.75c0 .621.504 1.125 1.125 1.125h1.5z" /></svg>;
// const AddNoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;
const PODCAST_ICON = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v.75a4.5 4.5 0 0 0 9 0V11.25a.75.75 0 0 1 1.5 0v.75a6 6 0 0 1-12 0v-.75a.75.75 0 0 1 .75-.75Z" /></svg>;
const AUDIO_WAVE_ICON = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 003.05 15H1.5a.75.75 0 000 1.5h1.55a9.76 9.76 0 001.808 3.495c.342 1.241 1.519 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.099 3.1 3.099 8.132 0 11.232a.75.75 0 01-1.06-1.06 6.996 6.996 0 000-9.112.75.75 0 010-1.06zm2.474-2.474a.75.75 0 011.06 0C25.137 5.65 25.137 15.73 19.122 19.122a.75.75 0 01-1.06-1.061c5.303-5.303 5.303-13.939 0-19.242a.75.75 0 010-1.061z" /></svg>;

const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75V18a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm9 0a.75.75 0 01.75.75V18a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>);

const cleanDisplayName = (name: string | null | undefined, defaultName: string = "Untitled Document"): string => {
  if (!name) return defaultName;
  let cleanedName = name.replace(/\s*\)\}\s*$/, ""); 
  cleanedName = cleanedName.replace(/\)\}\s*$/, "");   
  return cleanedName.trim() || defaultName;
};


const App: React.FC<AppProps> = ({ initialNote, initialFile, onInitialFileProcessed, onNoteProcessed, onBackToDashboard }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(initialNote?.name || null);
  const [pdfText, setPdfText] = useState<string | null>(initialNote?.pdfText || null);
  const [summary, setSummary] = useState<string | null>(initialNote?.summary || null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [podcastScript, setPodcastScript] = useState<string | null>(initialNote?.podcastScript || null);
  
  const [podcastSegments, setPodcastSegments] = useState<PodcastSegment[]>([]);
  const [currentPlayingSegmentIndex, setCurrentPlayingSegmentIndex] = useState<number | null>(null);
  const [isGeneratingAllAudio, setIsGeneratingAllAudio] = useState<boolean>(false);
  
  const [userInput, setUserInput] = useState<string>('');

  const [isLoadingInitialFile, setIsLoadingInitialFile] = useState<boolean>(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [isLoadingPodcastScript, setIsLoadingPodcastScript] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [podcastAudioError, setPodcastAudioError] = useState<string | null>(null);
  const [podcastScriptRateLimitInfo, setPodcastScriptRateLimitInfo] = useState<{ message: string; retryAfterSeconds: number | null } | null>(null);

  // States for Content Repurposing Suggestions
  const [repurposingSuggestions, setRepurposingSuggestions] = useState<string[] | null>(null);
  const [isLoadingRepurposingSuggestions, setIsLoadingRepurposingSuggestions] = useState<boolean>(false);
  const [repurposingSuggestionsError, setRepurposingSuggestionsError] = useState<string | null>(null);
  
  // States for Quiz Feature
  const [quizItems, setQuizItems] = useState<QuizItem[] | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // States for Further Reading Suggestions
  const [furtherReadingSuggestions, setFurtherReadingSuggestions] = useState<string[] | null>(null);
  const [isLoadingFurtherReading, setIsLoadingFurtherReading] = useState<boolean>(false);
  const [furtherReadingError, setFurtherReadingError] = useState<string | null>(null);

  const [isMobileSourcesPanelOpen, setIsMobileSourcesPanelOpen] = useState(false);
  const [isMobileStudioPanelOpen, setIsMobileStudioPanelOpen] = useState(false);

  // States for custom audio player
  const [podcastDurations, setPodcastDurations] = useState<Record<string, number>>({});
  const [isLoadingDurations, setIsLoadingDurations] = useState(false);
  const [overallPodcastDuration, setOverallPodcastDuration] = useState(0);
  const [currentOverallPlaybackTime, setCurrentOverallPlaybackTime] = useState(0);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);


  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const podcastSegmentsRef = useRef<PodcastSegment[]>(podcastSegments); 
  const autoAudioInitiatedForScriptContentRef = useRef<string | null>(null);
  const currentPlayingSegmentIndexRef = useRef<number | null>(currentPlayingSegmentIndex); 


  useEffect(() => {
    podcastSegmentsRef.current = podcastSegments;
  }, [podcastSegments]);

  useEffect(() => {
    currentPlayingSegmentIndexRef.current = currentPlayingSegmentIndex;
  }, [currentPlayingSegmentIndex]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isLoadingChat]);

   useEffect(() => {
    if (initialFile) {
      setIsLoadingInitialFile(true); 
      handleFileSelect(initialFile)
        .finally(() => {
          onInitialFileProcessed();
          setIsLoadingInitialFile(false); 
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]); 

  useEffect(() => {
    if (initialNote) {
        setPdfName(initialNote.name);
        setPdfText(initialNote.pdfText);
        setSummary(initialNote.summary);
        if (initialNote.podcastScript && autoAudioInitiatedForScriptContentRef.current !== initialNote.podcastScript) {
            setPodcastScript(initialNote.podcastScript);
        }
        setPdfFile(null); 
        setRepurposingSuggestions(null);
        setRepurposingSuggestionsError(null);
        setQuizItems(null);
        setQuizError(null);
        setRevealedAnswers({});
        setFurtherReadingSuggestions(null);
        setFurtherReadingError(null);
    }
  }, [initialNote]);

  useEffect(() => { // Auto-generate script if summary is available and script isn't
    if (summary && !podcastScript && !isLoadingPodcastScript && API_KEY_CONFIGURED && !podcastScriptRateLimitInfo) {
      handleGeneratePodcastScript();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, podcastScript, isLoadingPodcastScript, API_KEY_CONFIGURED, podcastScriptRateLimitInfo]);


  useEffect(() => { // Cleanup object URLs
    return () => {
      podcastSegmentsRef.current.forEach(segment => {
        if (segment.audioUrl) URL.revokeObjectURL(segment.audioUrl);
      });
    };
  }, []);

  const resetStateForNewFile = () => {
    setPdfText(null);
    setSummary(null);
    setChatMessages([]);
    setPodcastScript(null);
    podcastSegmentsRef.current.forEach(segment => { 
        if (segment.audioUrl) URL.revokeObjectURL(segment.audioUrl);
    });
    setPodcastSegments([]); 
    setCurrentPlayingSegmentIndex(null);
    setIsGeneratingAllAudio(false);
    setPodcastAudioError(null);
    autoAudioInitiatedForScriptContentRef.current = null;
    setError(null);
    setPodcastScriptRateLimitInfo(null);

    setPodcastDurations({});
    setIsLoadingDurations(false);
    setOverallPodcastDuration(0);
    setCurrentOverallPlaybackTime(0);
    setIsPodcastPlaying(false);
    
    setRepurposingSuggestions(null);
    setIsLoadingRepurposingSuggestions(false);
    setRepurposingSuggestionsError(null);

    setQuizItems(null);
    setIsLoadingQuiz(false);
    setQuizError(null);
    setRevealedAnswers({});

    setFurtherReadingSuggestions(null);
    setIsLoadingFurtherReading(false);
    setFurtherReadingError(null);
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!API_KEY_CONFIGURED) {
      setError("API Key is not configured.");
      return;
    }
    resetStateForNewFile(); 
    setPdfFile(file);
    const newPdfName = file.name;
    setPdfName(newPdfName); 
    setIsLoadingPdf(true); 
    setError(null);
    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      setIsLoadingPdf(false); 
      setIsLoadingSummary(true); 
      const summaryResult = await summarizeText(text);
      if (summaryResult.startsWith("Error: API Key not configured")) {
         setError(summaryResult); setSummary(null);
      } else { setSummary(summaryResult); }
      setIsLoadingSummary(false); 
      onNoteProcessed({
        pdfName: newPdfName, pdfText: text,
        summary: summaryResult.startsWith("Error:") ? null : summaryResult,
        podcastScript: null
      });
    } catch (e: any) {
      console.error("Error processing PDF:", e);
      setError(`Failed to process PDF: ${e.message || 'Unknown error'}`);
      setPdfName(null); 
      setIsLoadingPdf(false); 
      setIsLoadingSummary(false);
      throw e; 
    }
  }, [onNoteProcessed]); 

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || !pdfText || isLoadingChat || !API_KEY_CONFIGURED) return;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: userInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput(''); setIsLoadingChat(true); setError(null);
    try {
      const aiResponseText = await getChatResponse([...chatMessages, newUserMessage], userInput, pdfText);
      if (aiResponseText.startsWith("Error: API Key not configured")) setError(aiResponseText);
      const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponseText, timestamp: Date.now() };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (e: any) {
      setError(`Chat error: ${e.message || 'Failed to get response'}`);
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: `Sorry, I encountered an error: ${e.message || 'Failed to get response'}`, timestamp: Date.now() };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally { setIsLoadingChat(false); }
  }, [userInput, pdfText, chatMessages, isLoadingChat]);

  const handleGeneratePodcastScript = useCallback(async () => {
    if (!summary || isLoadingPodcastScript || !API_KEY_CONFIGURED || !pdfName || !pdfText || podcastScriptRateLimitInfo) {
        if (!summary) console.warn("handleGeneratePodcastScript: No summary available.");
        else if(!API_KEY_CONFIGURED) setError("API Key not configured.");
        else if(podcastScriptRateLimitInfo) console.warn("handleGeneratePodcastScript: Rate limit cooldown active.");
        else console.warn("handleGeneratePodcastScript: PDF name or text is missing.");
        return;
    }
    setIsLoadingPodcastScript(true); setError(null); setPodcastScriptRateLimitInfo(null);
    podcastSegmentsRef.current.forEach(s => { if (s.audioUrl) URL.revokeObjectURL(s.audioUrl); });
    setPodcastSegments([]); setCurrentPlayingSegmentIndex(null); setPodcastAudioError(null);
    setPodcastDurations({}); setOverallPodcastDuration(0); setCurrentOverallPlaybackTime(0); setIsPodcastPlaying(false);

    try {
      const script = await generatePodcastScript(summary); 
      if (script.startsWith("RATE_LIMIT_ERROR::")) {
        const parts = script.split("::");
        const retrySeconds = parseInt(parts[1]?.replace("Retry after ", "").replace("s", ""), 10);
        const message = parts[2] || "Rate limit exceeded. Please try again later.";
        setPodcastScriptRateLimitInfo({ message, retryAfterSeconds: isNaN(retrySeconds) ? 60 : retrySeconds });
        setPodcastScript(`Error: ${message}`);
        if (!isNaN(retrySeconds) && retrySeconds > 0) {
          setTimeout(() => {
            setPodcastScriptRateLimitInfo(null);
          }, retrySeconds * 1000);
        }
      } else if (script.startsWith("Error: API Key not configured")) { 
        setError(script); setPodcastScript(null); 
      } else if (script.startsWith("Error:")) {
        setError(script); setPodcastScript(script);
      } else { 
        setPodcastScript(script); 
      }
      onNoteProcessed({ pdfName, pdfText, summary, podcastScript: script.startsWith("Error:") || script.startsWith("RATE_LIMIT_ERROR::") ? null : script });
    } catch (e: any) {
      setError(`Podcast script generation error: ${e.message || 'Failed to generate'}`);
      setPodcastScript(`Error: Failed to generate podcast script. ${e.message || ''}`);
    } finally { setIsLoadingPodcastScript(false); }
  }, [summary, isLoadingPodcastScript, pdfName, pdfText, onNoteProcessed, podcastScriptRateLimitInfo]);

  const handleGenerateRepurposingSuggestions = useCallback(async () => {
    if (!summary || isLoadingRepurposingSuggestions || !API_KEY_CONFIGURED) {
      if (!summary) setRepurposingSuggestionsError("No summary available to generate ideas from.");
      else if (!API_KEY_CONFIGURED) setRepurposingSuggestionsError("API Key not configured.");
      return;
    }
    setIsLoadingRepurposingSuggestions(true);
    setRepurposingSuggestions(null);
    setRepurposingSuggestionsError(null);
    try {
      const textForIdeas = summary.length > 200 ? summary : (pdfText || summary); 
      const suggestions = await generateContentRepurposingSuggestions(textForIdeas);
      if (suggestions.length === 1 && suggestions[0].startsWith("Error:")) {
        setRepurposingSuggestionsError(suggestions[0]);
        setRepurposingSuggestions(null);
      } else {
        setRepurposingSuggestions(suggestions);
      }
    } catch (e: any) {
      console.error("Error generating repurposing suggestions:", e);
      setRepurposingSuggestionsError(`Failed to generate content ideas: ${e.message || 'Unknown error'}`);
      setRepurposingSuggestions(null);
    } finally {
      setIsLoadingRepurposingSuggestions(false);
    }
  }, [summary, pdfText, isLoadingRepurposingSuggestions]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!summary || isLoadingQuiz || !API_KEY_CONFIGURED) {
      if (!summary) setQuizError("No summary available to generate a quiz from.");
      else if (!API_KEY_CONFIGURED) setQuizError("API Key not configured.");
      return;
    }
    setIsLoadingQuiz(true);
    setQuizItems(null);
    setQuizError(null);
    setRevealedAnswers({});
    try {
      const textForQuiz = summary.length > 300 ? summary : (pdfText || summary); // Prefer PDF text if summary is short
      const items = await generateQuiz(textForQuiz);
       if (items.length === 1 && items[0].question.startsWith("Error:")) {
        setQuizError(items[0].question + (items[0].answer ? ` Details: ${items[0].answer}` : ''));
        setQuizItems(null);
      } else {
        setQuizItems(items);
      }
    } catch (e: any) {
      console.error("Error generating quiz:", e);
      setQuizError(`Failed to generate quiz: ${e.message || 'Unknown error'}`);
      setQuizItems(null);
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [summary, pdfText, isLoadingQuiz]);

  const toggleAnswerVisibility = (quizItemId: string) => {
    setRevealedAnswers(prev => ({ ...prev, [quizItemId]: !prev[quizItemId] }));
  };

  const handleGenerateFurtherReading = useCallback(async () => {
    if (!summary || isLoadingFurtherReading || !API_KEY_CONFIGURED) {
      if (!summary) setFurtherReadingError("No summary available to generate exploration ideas from.");
      else if (!API_KEY_CONFIGURED) setFurtherReadingError("API Key not configured.");
      return;
    }
    setIsLoadingFurtherReading(true);
    setFurtherReadingSuggestions(null);
    setFurtherReadingError(null);
    try {
      const textForIdeas = summary.length > 200 ? summary : (pdfText || summary);
      const suggestions = await generateFurtherReadingSuggestions(textForIdeas);
      if (suggestions.length === 1 && suggestions[0].startsWith("Error:")) {
        setFurtherReadingError(suggestions[0]);
        setFurtherReadingSuggestions(null);
      } else {
        setFurtherReadingSuggestions(suggestions);
      }
    } catch (e: any) {
      console.error("Error generating further reading suggestions:", e);
      setFurtherReadingError(`Failed to generate exploration ideas: ${e.message || 'Unknown error'}`);
      setFurtherReadingSuggestions(null);
    } finally {
      setIsLoadingFurtherReading(false);
    }
  }, [summary, pdfText, isLoadingFurtherReading]);


  const cleanTextForTTS = (text: string): string => {
    return text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\.\.\./g, ' ').trim();
  };

 const parsePodcastScript = (script: string): Omit<PodcastSegment, 'audioUrl' | 'isLoading' | 'error' | 'id'>[] => {
    const lines = script.split('\n');
    const segments: Omit<PodcastSegment, 'audioUrl' | 'isLoading' | 'error' | 'id'>[] = [];
    let pendingSpeakerForNextLine: PodcastSegment['speaker'] | null = null;
    const patterns = {
        host: /^\s*(\*\*|\*)?Host(\*\*|\*)?\s*:\s*(.*)/i,
        guest: /^\s*(\*\*|\*)?Guest(\*\*|\*)?\s*:\s*(.*)/i,
        standaloneHost: /^\s*(\*\*|\*)?Host(\*\*|\*)?\s*$/i,
        standaloneGuest: /^\s*(\*\*|\*)?Guest(\*\*|\*)?\s*$/i,
        ignoreLines: /^(okay, here is a podcast script|here's the script:|here is the podcast script:)/i
    };
    for (const originalLine of lines) {
        const trimmedLine = originalLine.trim();
        if (!trimmedLine || patterns.ignoreLines.test(trimmedLine)) continue;
        
        let speaker: PodcastSegment['speaker'] | null = null;
        let dialogue = trimmedLine;
        
        let match = trimmedLine.match(patterns.host);
        if (match) { speaker = 'Host'; dialogue = match[3]?.trim() || ""; pendingSpeakerForNextLine = null; }
        else {
            match = trimmedLine.match(patterns.guest);
            if (match) { speaker = 'Guest'; dialogue = match[3]?.trim() || ""; pendingSpeakerForNextLine = null; }
            else if (patterns.standaloneHost.test(trimmedLine)) { pendingSpeakerForNextLine = 'Host'; continue; }
            else if (patterns.standaloneGuest.test(trimmedLine)) { pendingSpeakerForNextLine = 'Guest'; continue; }
            else if (pendingSpeakerForNextLine) { 
                speaker = pendingSpeakerForNextLine; 
                pendingSpeakerForNextLine = null; 
            }
        }
        
        if (speaker) {
            let cleanedDialogue = cleanTextForTTS(dialogue).replace(/^\s*(Host|Guest)\s*:\s*/i, '').replace(/^\s*(Host|Guest)\s*/i, '').trim();
            if (cleanedDialogue && !/^\s*(Host|Guest)\s*$/i.test(cleanedDialogue.replace(/[*_]/g, '').trim())) {
                 segments.push({ speaker, rawText: originalLine, cleanedText: cleanedDialogue });
            }
        } else {
           console.warn("Skipping unparseable podcast line:", originalLine);
        }
    }
    return segments;
  };

  const handleGenerateAllPodcastAudio = useCallback(async () => {
    if (!podcastScript || isGeneratingAllAudio || podcastScript.startsWith("Error:") || podcastScript.startsWith("RATE_LIMIT_ERROR::")) {
        if (podcastScript?.startsWith("Error:") || podcastScript?.startsWith("RATE_LIMIT_ERROR::")) setPodcastAudioError("Cannot generate audio: Script generation failed or rate limited.");
        return;
    }
    const parsed = parsePodcastScript(podcastScript);
    if (parsed.length === 0) { setPodcastAudioError("Script is empty or unparseable. Ensure it only contains Host and Guest lines."); setPodcastSegments([]); return; }
    
    podcastSegmentsRef.current.forEach(s => { if (s.audioUrl) URL.revokeObjectURL(s.audioUrl); });
    const initialSegs: PodcastSegment[] = parsed.map((p, i) => ({ ...p, id: `seg-${Date.now()}-${i}`, audioUrl: null, isLoading: false, error: null }));
    setPodcastSegments(initialSegs); setIsGeneratingAllAudio(true); setPodcastAudioError(null); setCurrentPlayingSegmentIndex(null); 
    
    setPodcastDurations({}); setOverallPodcastDuration(0); setCurrentOverallPlaybackTime(0); setIsPodcastPlaying(false);

    let overallError = false; const updatedSegs = [...initialSegs];
    for (let i = 0; i < updatedSegs.length; i++) {
      if (!updatedSegs[i].cleanedText) { updatedSegs[i] = { ...updatedSegs[i], isLoading: false }; setPodcastSegments(p => p.map(s => s.id === updatedSegs[i].id ? updatedSegs[i] : s)); continue; }
      updatedSegs[i] = { ...updatedSegs[i], isLoading: true, error: null };
      setPodcastSegments(p => p.map(s => s.id === updatedSegs[i].id ? updatedSegs[i] : s));
      try {
        const audioUrl = await generateAudioFromGoogleTTS(updatedSegs[i].cleanedText, updatedSegs[i].speaker === 'Guest' ? GUEST_VOICE_NAME : HOST_VOICE_NAME);
        updatedSegs[i] = { ...updatedSegs[i], audioUrl, isLoading: false };
      } catch (e: any) { updatedSegs[i] = { ...updatedSegs[i], error: e.message || 'Failed', isLoading: false }; overallError = true; }
      setPodcastSegments(p => p.map(s => s.id === updatedSegs[i].id ? updatedSegs[i] : s));
    }
    setIsGeneratingAllAudio(false); if (overallError) setPodcastAudioError("One or more audio segments failed.");
  }, [podcastScript, isGeneratingAllAudio]);

  useEffect(() => { // Auto-generate audio if script is available and audio hasn't been initiated for this script content
    const canTrigger = podcastScript && !podcastScript.startsWith("Error:") && !podcastScript.startsWith("RATE_LIMIT_ERROR::") && !isLoadingPodcastScript && !isGeneratingAllAudio && API_KEY_CONFIGURED;
    if (canTrigger && autoAudioInitiatedForScriptContentRef.current !== podcastScript) {
      autoAudioInitiatedForScriptContentRef.current = podcastScript; 
      handleGenerateAllPodcastAudio();
    }
  }, [podcastScript, isLoadingPodcastScript, isGeneratingAllAudio, handleGenerateAllPodcastAudio]);

  useEffect(() => { // Calculate durations when segments with audioUrl change
    const calculateDurations = async () => {
        const newDurations: Record<string, number> = {};
        let totalDuration = 0;
        let allHaveUrlsOrErrorsOrAreEmpty = podcastSegments.every(seg => seg.audioUrl || seg.error || !seg.cleanedText);
        
        if (podcastSegments.length > 0 && allHaveUrlsOrErrorsOrAreEmpty && !isGeneratingAllAudio) {
            setIsLoadingDurations(true);
            for (const segment of podcastSegments) {
                if (segment.audioUrl && !podcastDurations[segment.id]) { // Only fetch if not already fetched
                    try {
                        const duration = await new Promise<number>((resolve, reject) => {
                            const audio = new Audio(segment.audioUrl!);
                            audio.onloadedmetadata = () => resolve(audio.duration);
                            audio.onerror = (e) => reject(new Error(`Error loading audio for duration: ${segment.id}.`));
                            setTimeout(() => reject(new Error(`Timeout loading audio metadata for ${segment.id}`)), 5000); // 5s timeout
                        });
                        newDurations[segment.id] = duration;
                        totalDuration += duration;
                    } catch (err) {
                        console.error("Error calculating duration for segment:", segment.id, err);
                        newDurations[segment.id] = 0; // Store 0 if error
                    }
                } else if (podcastDurations[segment.id]) { // Use already fetched duration
                    newDurations[segment.id] = podcastDurations[segment.id];
                    totalDuration += podcastDurations[segment.id];
                } else { // Segment has no audioUrl (e.g. empty cleanedText or error during generation) or already processed as error
                    newDurations[segment.id] = 0; 
                }
            }
            setPodcastDurations(newDurations);
            setOverallPodcastDuration(totalDuration);
            setIsLoadingDurations(false);
        }
    };
    calculateDurations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcastSegments, isGeneratingAllAudio]); 


  const playSegmentInternal = useCallback((index: number, startTime: number = 0) => {
    const segs = podcastSegmentsRef.current;
    if (index >= 0 && index < segs.length && segs[index].audioUrl && audioPlayerRef.current) {
        setCurrentPlayingSegmentIndex(index);
        audioPlayerRef.current.src = segs[index].audioUrl!;
        audioPlayerRef.current.currentTime = startTime;
        audioPlayerRef.current.play().catch(err => {
            console.error(`Error playing segment ${index} ('${segs[index]?.cleanedText?.substring(0,20)}...'):`, err.name, err.message, err);
            setPodcastSegments(p => { 
                const n = [...p]; 
                if(n[index]) n[index] = {...n[index], isLoading: false, error: `Playback error: ${err.message || err.name}` }; 
                return n; 
            });
            setIsPodcastPlaying(false); 
        });
    } else {
        // If segment can't be played (no URL, out of bounds, etc.), stop playback.
        console.warn(`playSegmentInternal: Cannot play segment ${index}. Valid URL: ${!!segs[index]?.audioUrl}. Player exists: ${!!audioPlayerRef.current}`);
        setIsPodcastPlaying(false);
        // Do not set currentPlayingSegmentIndex to null here, as it might be set by handleAudioEnded
        // to null if it's the end of the podcast. If it's an invalid segment mid-way,
        // the player will stop, and the user might need to interact again.
    }
  }, []);

  const handleTogglePlayPause = useCallback(() => {
    if (isPodcastPlaying) {
        audioPlayerRef.current?.pause();
    } else {
        if (currentPlayingSegmentIndexRef.current === null) { 
            const firstPlayableIndex = podcastSegmentsRef.current.findIndex(seg => seg.audioUrl);
            if (firstPlayableIndex !== -1) {
                playSegmentInternal(firstPlayableIndex);
            }
        } else {
            audioPlayerRef.current?.play().catch(err => {
                console.error("Resume play failed in toggle:", err.name, err.message);
                setIsPodcastPlaying(false); 
            });
        }
    }
  }, [isPodcastPlaying, playSegmentInternal]);

  const handleAudioEnded = useCallback(() => {
    const cIdx = currentPlayingSegmentIndexRef.current;
    const segs = podcastSegmentsRef.current;  
    if (cIdx !== null) {
        const nextPlayableIndex = segs.findIndex((s, i) => i > cIdx && s.audioUrl);
        if (nextPlayableIndex !== -1) {
            playSegmentInternal(nextPlayableIndex);
        } else {
            setIsPodcastPlaying(false);
            setCurrentPlayingSegmentIndex(null); 
        }
    }
  }, [playSegmentInternal]); 

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetOverallTime = parseFloat(event.target.value);
    setCurrentOverallPlaybackTime(targetOverallTime);

    let cumulativeDuration = 0;
    let segmentToPlayIndex = -1;
    let seekTimeWithinSegment = 0;

    for (let i = 0; i < podcastSegmentsRef.current.length; i++) {
        const segment = podcastSegmentsRef.current[i];
        const segmentDuration = podcastDurations[segment.id] || 0;
        if (targetOverallTime < cumulativeDuration + segmentDuration || (i === podcastSegmentsRef.current.length - 1 && targetOverallTime >= cumulativeDuration) ) { // Also handle seeking to the very end of the last segment
            segmentToPlayIndex = i;
            seekTimeWithinSegment = Math.max(0, Math.min(targetOverallTime - cumulativeDuration, segmentDuration > 0 ? segmentDuration - 0.01 : 0)); // Ensure seek time is valid
            break;
        }
        cumulativeDuration += segmentDuration;
    }
    
    if (segmentToPlayIndex !== -1 && podcastSegmentsRef.current[segmentToPlayIndex]?.audioUrl) {
        playSegmentInternal(segmentToPlayIndex, seekTimeWithinSegment);
        if (!isPodcastPlaying) setIsPodcastPlaying(true); // Optimistically set, play event will confirm
    } else if (segmentToPlayIndex === -1 && podcastSegmentsRef.current.length > 0) { 
        // This case means seeking beyond the very end.
        const lastSegIdx = podcastSegmentsRef.current.length - 1;
        if (podcastSegmentsRef.current[lastSegIdx]?.audioUrl) {
           // Set time to end of last segment, effectively stopping
           const lastSegDuration = podcastDurations[podcastSegmentsRef.current[lastSegIdx].id] || 0;
           playSegmentInternal(lastSegIdx, lastSegDuration > 0 ? lastSegDuration - 0.01 : 0); // Go to near end
           audioPlayerRef.current?.pause(); // Explicitly pause
        }
        setIsPodcastPlaying(false); 
    }
  };
  
  useEffect(() => {
    const player = audioPlayerRef.current;
    const updatePlaybackTime = () => {
        if (player && currentPlayingSegmentIndexRef.current !== null && !player.seeking) {
            let timeBeforeCurrentSegment = 0;
            for (let i = 0; i < currentPlayingSegmentIndexRef.current; i++) {
                 // Ensure segment ID exists in podcastDurations before accessing
                const segmentId = podcastSegmentsRef.current[i]?.id;
                if (segmentId) {
                    timeBeforeCurrentSegment += podcastDurations[segmentId] || 0;
                }
            }
            setCurrentOverallPlaybackTime(timeBeforeCurrentSegment + player.currentTime);
        }
    };

    if (player) { 
        player.addEventListener('ended', handleAudioEnded); 
        player.addEventListener('timeupdate', updatePlaybackTime);
        player.addEventListener('play', () => setIsPodcastPlaying(true));
        player.addEventListener('pause', () => setIsPodcastPlaying(false));
        return () => {
            player.removeEventListener('ended', handleAudioEnded);
            player.removeEventListener('timeupdate', updatePlaybackTime);
            player.removeEventListener('play', () => setIsPodcastPlaying(true));
            player.removeEventListener('pause', () => setIsPodcastPlaying(false));
        };
    }
  }, [handleAudioEnded, podcastDurations]); // podcastDurations is crucial here for dynamic seekbar updates

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  let dynamicLoaderText: string | null = null;
  if (isLoadingInitialFile) { 
    dynamicLoaderText = isLoadingSummary ? "Generating summary..." : "Preparing document...";
  } else if (isLoadingPdf) { 
    dynamicLoaderText = "Processing PDF...";
  } else if (isLoadingSummary && pdfText && !summary) { 
    dynamicLoaderText = "Generating summary...";
  }

  const showAppLevelLoader =
    dynamicLoaderText !== null || 
    (!API_KEY_CONFIGURED && !error && !pdfName && !initialNote && !pdfFile); 

  if (showAppLevelLoader) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-200">
        {!API_KEY_CONFIGURED && !error && !initialNote && !pdfFile && !dynamicLoaderText && (
          <div className="mb-4 w-full max-w-md"><Alert message="API Key not configured. Features will be limited." type="error" /></div>
        )}
        {dynamicLoaderText && <Spinner text={dynamicLoaderText} size="lg" color="text-slate-200" />}
      </div>
    );
  }

  const mainPanelContentLoading = (isLoadingPdf || isLoadingSummary) && !dynamicLoaderText; 
  const userBubbleBg = 'bg-slate-900';
  const userBubbleColorHex = '#0f172a';
  const aiBubbleBg = 'bg-slate-700';
  const aiBubbleColorHex = '#334155';

  const showCustomPlayer = podcastScript && !podcastScript.startsWith("Error:") && !podcastScript.startsWith("RATE_LIMIT_ERROR::") && !isGeneratingAllAudio && overallPodcastDuration > 0 && !isLoadingDurations;

  const cleanedPdfName = cleanDisplayName(pdfName);
  const cleanedPdfNameForTitle = cleanDisplayName(pdfName, "Untitled Document");
  const cleanedPdfNameForDetails = cleanDisplayName(pdfName, "Document Details");


  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between p-3 border-b border-slate-700 shadow-md flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3">
          <button onClick={() => setIsMobileSourcesPanelOpen(true)} className="md:hidden p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-700">
            {HAMBURGER_ICON}
          </button>
          {React.cloneElement(APP_LOGO_ICON, {className: "w-6 h-6 md:w-7 md:h-7 text-primary-500"})}
          <button onClick={onBackToDashboard} className="text-sm hover:text-primary-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-slate-500 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-md font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-xs" title={cleanedPdfNameForTitle}>{cleanedPdfNameForTitle}</h1>
        </div>
      </header>

      {error && !showAppLevelLoader && <div className="p-2"><Alert message={error} type="error" onClose={() => setError(null)} /></div>}
      
      <div className="flex flex-1 overflow-hidden relative"> 
        {(isMobileSourcesPanelOpen) && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileSourcesPanelOpen(false)}></div>
        )}
        <aside 
          className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto w-64 md:w-72 bg-slate-800 p-4 border-r border-slate-700 flex flex-col space-y-4 overflow-y-auto transition-transform duration-300 ease-in-out transform ${isMobileSourcesPanelOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-100">Sources</h2>
            <button onClick={() => setIsMobileSourcesPanelOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-700">
              {CLOSE_ICON_PANEL}
            </button>
            <button className="hidden md:inline-block text-slate-400 hover:text-slate-100 p-1"><PanelIcon /></button>
          </div>
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center text-sm bg-slate-700 hover:bg-slate-600 py-2 px-3 rounded-md">
              {React.cloneElement(PLUS_ICON, {className: "w-4 h-4 mr-1.5"})} Add
            </button>
            <button className="flex-1 flex items-center justify-center text-sm bg-slate-700 hover:bg-slate-600 py-2 px-3 rounded-md"><DiscoverIcon /> Discover</button>
          </div>
          <div>
            <label className="flex items-center text-sm text-slate-300 space-x-2 py-1">
              <input type="checkbox" className="rounded bg-slate-600 border-slate-500 focus:ring-primary-500 text-primary-500" defaultChecked />
              <span>Select all sources</span>
            </label>
          </div>
          {pdfName && (
            <div className="bg-slate-700 p-3 rounded-md">
              <label className="flex items-center text-sm space-x-2">
                <input type="checkbox" className="rounded bg-slate-600 border-slate-500 focus:ring-primary-500 text-primary-500" defaultChecked />
                <div className="w-5 h-5 text-slate-400"></div>
                <span className="text-slate-200 truncate" title={cleanedPdfName}>{cleanedPdfName}</span>
              </label>
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col bg-slate-850 overflow-y-auto" style={{backgroundColor: '#111827'}}> 
            {mainPanelContentLoading ? (
                <div className="flex-1 flex items-center justify-center"><Spinner text={isLoadingPdf ? "Loading PDF..." : "Generating summary..."} size="lg" color="text-slate-200"/></div>
            ) : summary ? (
                <div className="p-4 md:p-6 flex-shrink-0"> 
                    <h1 className="text-xl md:text-2xl font-bold text-slate-100 mb-1">{cleanedPdfNameForDetails}</h1>
                    <p className="text-xs text-slate-400 mb-4">1 source</p>
                    <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-wrap mb-6" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}></div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        
                        <button 
                            onClick={() => { 
                                if (typeof window !== 'undefined' && window.innerWidth < 768) { setIsMobileStudioPanelOpen(true); }
                                if(!podcastScript && !podcastScriptRateLimitInfo) handleGeneratePodcastScript(); 
                            }}
                            className="text-xs bg-slate-700 hover:bg-slate-600 py-1.5 px-3 rounded-md flex items-center">
                            <PODCAST_ICON/> Audio Overview
                        </button>
                        <button
                            onClick={handleGenerateRepurposingSuggestions}
                            disabled={!summary || isLoadingRepurposingSuggestions || !API_KEY_CONFIGURED}
                            className="text-xs bg-slate-700 hover:bg-slate-600 py-1.5 px-3 rounded-md flex items-center disabled:opacity-50"
                            aria-live="polite"
                        >
                            {React.cloneElement(LIGHTBULB_ICON, {className: "w-4 h-4 mr-1.5"})} Content Ideas
                        </button>
                         <button
                            onClick={handleGenerateQuiz}
                            disabled={!summary || isLoadingQuiz || !API_KEY_CONFIGURED}
                            className="text-xs bg-slate-700 hover:bg-slate-600 py-1.5 px-3 rounded-md flex items-center disabled:opacity-50"
                            aria-live="polite"
                        >
                            {React.cloneElement(QUIZ_ICON, {className: "w-4 h-4 mr-1.5"})} Generate Quiz
                        </button>
                        <button
                            onClick={handleGenerateFurtherReading}
                            disabled={!summary || isLoadingFurtherReading || !API_KEY_CONFIGURED}
                            className="text-xs bg-slate-700 hover:bg-slate-600 py-1.5 px-3 rounded-md flex items-center disabled:opacity-50"
                            aria-live="polite"
                        >
                            {React.cloneElement(COMPASS_ICON, {className: "w-4 h-4 mr-1.5"})} Explore Further
                        </button>
                    </div>

                    {isLoadingRepurposingSuggestions && <div className="my-4"><Spinner text="Generating content ideas..." color="text-slate-200" /></div>}
                    {repurposingSuggestionsError && <div className="my-4"><Alert type="error" message={repurposingSuggestionsError} onClose={() => setRepurposingSuggestionsError(null)} /></div>}
                    {repurposingSuggestions && repurposingSuggestions.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-2">Content Repurposing Ideas:</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm">
                          {repurposingSuggestions.map((idea, index) => (
                            <li key={index}>{idea}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quiz Display Area */}
                    {isLoadingQuiz && <div className="my-4"><Spinner text="Generating quiz..." color="text-slate-200" /></div>}
                    {quizError && <div className="my-4"><Alert type="error" message={quizError} onClose={() => setQuizError(null)} /></div>}
                    {quizItems && quizItems.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-3">Test Your Knowledge:</h3>
                        <div className="space-y-4">
                          {quizItems.map((item) => (
                            <div key={item.id} className="bg-slate-700/50 p-3 rounded-md">
                              <p className="text-slate-200 font-medium text-sm mb-1.5">{item.question}</p>
                              <button
                                onClick={() => toggleAnswerVisibility(item.id)}
                                className="text-xs text-primary-400 hover:text-primary-300 hover:underline focus:outline-none"
                                aria-expanded={!!revealedAnswers[item.id]}
                                aria-controls={`answer-${item.id}`}
                              >
                                {revealedAnswers[item.id] ? 'Hide Answer' : 'Show Answer'}
                              </button>
                              {revealedAnswers[item.id] && (
                                <p id={`answer-${item.id}`} className="text-slate-300 text-sm mt-1.5 p-2 bg-slate-600/50 rounded">
                                  {item.answer}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Further Reading Suggestions Display Area */}
                    {isLoadingFurtherReading && <div className="my-4"><Spinner text="Generating exploration ideas..." color="text-slate-200" /></div>}
                    {furtherReadingError && <div className="my-4"><Alert type="error" message={furtherReadingError} onClose={() => setFurtherReadingError(null)} /></div>}
                    {furtherReadingSuggestions && furtherReadingSuggestions.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-2">Explore Further Suggestions:</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm">
                          {furtherReadingSuggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                </div>
            ) : (
                 <div className="flex-1 flex items-center justify-center text-slate-400 p-4 text-center">
                    {API_KEY_CONFIGURED ? (pdfText ? "Summary not available." : "No PDF loaded. Use 'Add' in Sources or go to Dashboard to create a new note.") : "API Key not configured. Summary generation disabled."}
                </div>
            )}

            <div className="flex flex-col border-t border-slate-700 p-3 md:p-4 pb-2"> 
                <div ref={chatContainerRef} className="space-y-4 mb-3 pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50 max-h-96 overflow-y-auto"> 
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative max-w-[80%] sm:max-w-md lg:max-w-lg xl:max-w-xl shadow rounded-lg ${msg.role === 'user' ? userBubbleBg : aiBubbleBg} ${msg.role === 'user' ? 'text-slate-100' : 'text-slate-200'}`}>
                        <div 
                          className="absolute w-0 h-0"
                          style={
                            msg.role === 'user' ? { bottom: '-7px', right: '10px', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${userBubbleColorHex}` } 
                            : { bottom: '-7px', left: '10px', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${aiBubbleColorHex}` }
                          }
                        ></div>
                        <div className="px-3 py-2 sm:px-4"><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                      </div>
                    </div>
                ))}
                {isLoadingChat && (
                    <div className="flex justify-start">
                        <div className={`relative max-w-md lg:max-w-lg xl:max-w-xl shadow rounded-lg ${aiBubbleBg} text-slate-200`}>
                           <div className="absolute w-0 h-0" style={{ bottom: '-7px', left: '10px', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${aiBubbleColorHex}` }}></div>
                            <div className="px-4 py-3 inline-flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                                <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
                <div className="mt-auto">
                    <div className="flex items-center space-x-2 bg-slate-700 p-1 rounded-lg mb-2">
                        <input
                            type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoadingChat && handleSendMessage()}
                            placeholder="Start typing..."
                            className="flex-grow p-2 bg-transparent border-none rounded-md focus:ring-0 text-sm text-slate-200 placeholder-slate-400"
                            disabled={isLoadingChat || !pdfText || !API_KEY_CONFIGURED}
                        />
                        <span className="text-xs text-slate-400 pr-1 hidden sm:inline">1 source</span>
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoadingChat || !pdfText || !userInput.trim() || !API_KEY_CONFIGURED}
                            className="p-2 sm:p-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </main>

        {(isMobileStudioPanelOpen) && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileStudioPanelOpen(false)}></div>
        )}
        <aside 
            className={`fixed md:static inset-y-0 right-0 z-40 md:z-auto w-72 sm:w-80 md:w-96 bg-slate-800 p-3 md:p-4 border-l border-slate-700 flex flex-col space-y-3 md:space-y-4 overflow-y-auto transition-transform duration-300 ease-in-out transform ${isMobileStudioPanelOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}
        >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-100">Studio</h2>
              <button onClick={() => setIsMobileStudioPanelOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-700">
                {CLOSE_ICON_PANEL}
              </button>
            </div>
            
            <div className="border border-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-slate-200">Audio Overview</h3>
                    <InfoIcon />
                </div>
                {isLoadingPodcastScript && !podcastScriptRateLimitInfo && <Spinner text="Generating script..." color="text-slate-200" />}
                {podcastScriptRateLimitInfo && <Alert message={`${podcastScriptRateLimitInfo.message}${podcastScriptRateLimitInfo.retryAfterSeconds ? ` Please wait approx. ${podcastScriptRateLimitInfo.retryAfterSeconds}s.` : ''}`} type="error" onClose={() => setPodcastScriptRateLimitInfo(null)}/>}

                {showCustomPlayer ? (
                    <div className="bg-slate-700 p-3 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-slate-200 mb-2">Podcast audio</h4>
                        <div className="flex items-center space-x-3">
                            <button onClick={handleTogglePlayPause} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                {isPodcastPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <div className="flex-grow flex items-center">
                                <input type="range" min="0" max={overallPodcastDuration} value={currentOverallPlaybackTime} onChange={handleSeek} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer thumb:bg-blue-500 [&::-webkit-slider-thumb]:bg-blue-400 [&::-moz-range-thumb]:bg-blue-400"/>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-1.5 flex justify-between">
                            <span>{formatTime(currentOverallPlaybackTime)} / {formatTime(overallPodcastDuration)}</span>
                            <span>• English</span>
                        </div>
                    </div>
                ) : isLoadingDurations ? (
                    <Spinner text="Calculating audio durations..." color="text-slate-200" />
                ) : (podcastScript && !podcastScript.startsWith("Error:") && !podcastScript.startsWith("RATE_LIMIT_ERROR::") && !isGeneratingAllAudio && !isLoadingPodcastScript && (
                        <button onClick={handleGenerateAllPodcastAudio} disabled={isGeneratingAllAudio || isLoadingDurations}
                            className="w-full text-sm bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md flex items-center justify-center disabled:opacity-60">
                            <AUDIO_WAVE_ICON/> Generate All Audio
                        </button>
                    )
                )}

            </div>

            <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-md text-sm">
                Interactive mode <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-600 rounded-full">BETA</span>
            </button>

            {podcastScript && !podcastScript.startsWith("Error:") && !podcastScript.startsWith("RATE_LIMIT_ERROR::") && (
              <div className="flex-1 flex flex-col min-h-0"> 
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-slate-200">Transcript</h3>
                    {React.cloneElement(ELLIPSIS_VERTICAL_ICON, {className: "w-5 h-5 text-slate-400 hover:text-slate-100 cursor-pointer"})}
                </div>
                
                {isGeneratingAllAudio && <Spinner text="Processing audio segments..." color="text-slate-200" />}
                {podcastAudioError && <Alert message={podcastAudioError} type="error" onClose={() => setPodcastAudioError(null)} />}
                
                <audio ref={audioPlayerRef} className="w-full mt-1 mb-2 invisible h-8" aria-label="Podcast audio player"></audio>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-25rem)] md:max-h-[calc(100vh-20rem)] pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
                  {podcastSegments.map((segment, index) => (
                    <div key={segment.id} className={`p-2.5 rounded-md border ${currentPlayingSegmentIndex === index && isPodcastPlaying ? 'ring-1 ring-primary-500 border-primary-500' : 'border-slate-700'} ${segment.speaker === 'Host' ? 'bg-slate-700/70' : 'bg-slate-700/40'}`}>
                      <p className="font-semibold text-xs text-slate-300">{segment.speaker}:</p>
                      <p className="text-slate-200 my-0.5 whitespace-pre-wrap text-sm">{segment.cleanedText || <span className="italic text-slate-500">Cue</span>}</p>
                      {segment.isLoading && <div className="flex items-center text-xs text-yellow-500"><Spinner size="sm" color="text-yellow-500" /> <span className="ml-1">Generating...</span></div>}
                      {segment.error && <Alert message={`Segment error: ${segment.error}`} type="error" />}
                      {segment.audioUrl && !segment.isLoading && !segment.error && (
                        <button onClick={() => {setCurrentPlayingSegmentIndex(index); playSegmentInternal(index); setIsPodcastPlaying(true); }} className="text-xs text-primary-400 hover:underline disabled:opacity-60" disabled={isPodcastPlaying && currentPlayingSegmentIndex !== index}>
                          Play this segment
                        </button>
                      )}
                      <details className="text-xs text-slate-500 mt-0.5 cursor-pointer">
                        <summary className="hover:text-slate-300 text-xs">Show raw script line</summary>
                        <p className="mt-1 whitespace-pre-wrap bg-slate-600/50 p-1 rounded text-slate-400">{segment.rawText}</p>
                      </details>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center flex-shrink-0">Audio generated using Google Cloud Text-to-Speech.</p>
              </div>
            )}
             {podcastScript?.startsWith("Error:") && <Alert message={podcastScript} type="error" />}
             {podcastScript?.startsWith("RATE_LIMIT_ERROR::") && podcastScriptRateLimitInfo && <Alert message={podcastScriptRateLimitInfo.message} type="error" />}
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
