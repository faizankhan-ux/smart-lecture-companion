import { useCallback, useState, useEffect, useRef } from 'react';
import { TopBar } from '@/components/lecture/TopBar';
import { ScreenPreview } from '@/components/lecture/ScreenPreview';
import { LiveNotesPanel } from '@/components/lecture/LiveNotesPanel';
import { HistoryPanel } from '@/components/lecture/HistoryPanel';
import { QuizPanel } from '@/components/lecture/QuizPanel';
import { VoiceChatBar } from '@/components/lecture/VoiceChatBar';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLectureStore } from '@/hooks/useLectureStore';
import { useToast } from '@/hooks/use-toast';
import { useAINotesGenerator } from '@/hooks/useAINotesGenerator';

const Index = () => {
  const { toast } = useToast();
  const [chatListening, setChatListening] = useState(false);
  const pendingTranscriptRef = useRef<string>('');
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    currentSession,
    sessions,
    liveBullets,
    quizQuestions,
    chatMessages,
    isGeneratingQuiz,
    startNewSession,
    addBullet,
    endSession,
    generateQuiz,
    clearQuiz,
    addChatMessage
  } = useLectureStore();

  const { isCapturing, currentFrame, startCapture, stopCapture } = useScreenCapture();
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  // AI Notes Generator
  const handleAIBullets = useCallback((bullets: string[]) => {
    bullets.forEach(bullet => {
      addBullet(bullet);
    });
    toast({
      title: "Notes Generated",
      description: `Added ${bullets.length} bullet points from AI analysis`,
    });
  }, [addBullet, toast]);

  const { analyzeContent, isProcessing } = useAINotesGenerator({
    onBulletsGenerated: handleAIBullets
  });

  // Collect transcript for AI analysis
  const processBulletPoint = useCallback((text: string) => {
    pendingTranscriptRef.current += ' ' + text;
  }, []);

  const {
    isListening: isNotesListening,
    interimTranscript,
    toggleListening: toggleNotesListening
  } = useVoiceRecognition(processBulletPoint);

  // Store currentFrame in a ref to avoid effect re-runs
  const currentFrameRef = useRef<string | null>(null);
  
  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  // Trigger AI analysis every 10 seconds when capturing
  useEffect(() => {
    console.log("📸 Screen capture state changed:", { isCapturing });
    
    if (isCapturing) {
      // Initial analysis after 5 seconds
      const initialTimeout = setTimeout(() => {
        const frame = currentFrameRef.current;
        console.log("⏱️ Initial timeout triggered, frame:", !!frame);
        if (frame) {
          analyzeContent(frame, pendingTranscriptRef.current || null);
          pendingTranscriptRef.current = '';
        }
      }, 5000);

      // Regular analysis every 10 seconds
      analysisIntervalRef.current = setInterval(() => {
        const frame = currentFrameRef.current;
        console.log("⏱️ Interval triggered, frame:", !!frame);
        if (frame) {
          analyzeContent(frame, pendingTranscriptRef.current || null);
          pendingTranscriptRef.current = '';
        }
      }, 10000);

      return () => {
        clearTimeout(initialTimeout);
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    } else {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    }
  }, [isCapturing, analyzeContent]);

  // Handle chat voice input
  const handleChatTranscript = useCallback((text: string) => {
    addChatMessage(text, 'user', true);
    
    // Simulate AI response (will be replaced with actual API)
    setTimeout(() => {
      const responses = [
        "That's a great question about the lecture content. Let me explain further...",
        "Based on the notes captured, I can clarify that point for you.",
        "I understand your question. The key concept here is...",
        "Let me summarize what was covered regarding your question..."
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage(response, 'assistant');
      speak(response);
    }, 1000);
    
    setChatListening(false);
  }, [addChatMessage, speak]);

  const {
    isListening: isChatListening,
    toggleListening: toggleChatListening
  } = useVoiceRecognition(handleChatTranscript);

  const handleStartSession = useCallback(() => {
    startNewSession('New Lecture');
    toast({
      title: "Session Started",
      description: "Your lecture session is now active. Start capturing notes!",
    });
  }, [startNewSession, toast]);

  const handleEndSession = useCallback(() => {
    if (isCapturing) stopCapture();
    if (isNotesListening) toggleNotesListening();
    endSession();
    toast({
      title: "Session Ended",
      description: `Captured ${liveBullets.length} bullet points. Session saved to history.`,
    });
  }, [isCapturing, isNotesListening, stopCapture, toggleNotesListening, endSession, liveBullets.length, toast]);

  const handleToggleChatVoice = useCallback(() => {
    if (isChatListening) {
      setChatListening(false);
    } else {
      setChatListening(true);
    }
    toggleChatListening();
  }, [isChatListening, toggleChatListening]);

  const handleSendTextMessage = useCallback((text: string) => {
    addChatMessage(text, 'user');
    
    // Simulate AI response
    setTimeout(() => {
      const response = "I've noted your question. Based on the lecture content, here's what I can tell you...";
      addChatMessage(response, 'assistant');
      speak(response);
    }, 1000);
  }, [addChatMessage, speak]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none opacity-50" />
      
      {/* Top Bar */}
      <TopBar
        currentSession={currentSession}
        isRecording={isNotesListening || isCapturing}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        bullets={liveBullets}
        quizQuestions={quizQuestions}
      />
      
      {/* Main Content */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 relative z-10">
        {/* Left Column - Screen + Notes */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="h-[280px]">
            <ScreenPreview
              isCapturing={isCapturing}
              currentFrame={currentFrame}
              onStart={startCapture}
              onStop={stopCapture}
            />
          </div>
          <div className="flex-1 min-h-[300px]">
            <LiveNotesPanel
              bullets={liveBullets}
              isListening={isNotesListening}
              interimTranscript={interimTranscript}
              onToggleListening={toggleNotesListening}
              isAIProcessing={isProcessing}
            />
          </div>
        </div>
        
        {/* Center Column - History */}
        <div className="col-span-12 lg:col-span-3">
          <HistoryPanel
            sessions={sessions}
            currentSession={currentSession}
          />
        </div>
        
        {/* Right Column - Quiz */}
        <div className="col-span-12 lg:col-span-4">
          <QuizPanel
            questions={quizQuestions}
            isGenerating={isGeneratingQuiz}
            onGenerate={generateQuiz}
            onClear={clearQuiz}
            hasBullets={liveBullets.length > 0 || sessions.some(s => s.bullets.length > 0)}
          />
        </div>
      </main>
      
      {/* Bottom Voice Chat Bar */}
      <div className="p-4 pt-0 relative z-10">
        <VoiceChatBar
          messages={chatMessages}
          isListening={isChatListening}
          isSpeaking={isSpeaking}
          onToggleVoice={handleToggleChatVoice}
          onStopSpeaking={stopSpeaking}
          onSendMessage={handleSendTextMessage}
        />
      </div>
    </div>
  );
};

export default Index;
