import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAINotesGeneratorProps {
  onBulletsGenerated: (bullets: string[]) => void;
  onError?: (error: string) => void;
}

export const useAINotesGenerator = ({ onBulletsGenerated, onError }: UseAINotesGeneratorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastProcessedFrame = useRef<string | null>(null);
  const processingRef = useRef(false);
  const consecutiveErrors = useRef(0);

  const analyzeContent = useCallback(async (screenshot: string | null, transcript: string | null) => {
    // Avoid duplicate processing
    if (processingRef.current) {
      console.log("Already processing, skipping...");
      return;
    }
    
    // Skip if too many consecutive errors
    if (consecutiveErrors.current >= 3) {
      console.log("Too many errors, waiting...");
      consecutiveErrors.current = 0; // Reset after a cooldown period
      return;
    }
    
    if (!screenshot && !transcript) {
      console.log("No content to analyze");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      console.log("🚀 Sending to AI for analysis...", { 
        hasScreenshot: !!screenshot, 
        screenshotLength: screenshot?.length,
        hasTranscript: !!transcript 
      });
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-screen', {
        body: { screenshot, transcript }
      });
      
      console.log("📥 AI Response:", { data, error: fnError });

      if (fnError) {
        console.error("Function error:", fnError);
        setError(fnError.message);
        consecutiveErrors.current++;
        onError?.(fnError.message);
        return;
      }

      if (data?.error) {
        console.error("AI error:", data.error);
        setError(data.error);
        consecutiveErrors.current++;
        // Don't show error to user for temporary issues
        if (!data.error.includes('temporarily unavailable')) {
          onError?.(data.error);
        }
        return;
      }

      // Reset error count on success
      consecutiveErrors.current = 0;

      if (data?.bullets && data.bullets.length > 0) {
        console.log("✅ Generated bullets:", data.bullets);
        onBulletsGenerated(data.bullets);
        lastProcessedFrame.current = screenshot;
      }
    } catch (err) {
      console.error("Error analyzing content:", err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to analyze content';
      setError(errorMsg);
      consecutiveErrors.current++;
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [onBulletsGenerated, onError]);

  return {
    analyzeContent,
    isProcessing,
    error
  };
};
