import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAINotesGeneratorProps {
  onBulletsGenerated: (bullets: string[]) => void;
}

export const useAINotesGenerator = ({ onBulletsGenerated }: UseAINotesGeneratorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastProcessedFrame = useRef<string | null>(null);
  const processingRef = useRef(false);

  const analyzeContent = useCallback(async (screenshot: string | null, transcript: string | null) => {
    // Avoid duplicate processing
    if (processingRef.current) return;
    
    // Skip if same frame and no new transcript
    if (screenshot === lastProcessedFrame.current && !transcript) return;
    
    if (!screenshot && !transcript) return;

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      console.log("Sending to AI for analysis...", { hasScreenshot: !!screenshot, hasTranscript: !!transcript });
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-screen', {
        body: { screenshot, transcript }
      });

      if (fnError) {
        console.error("Function error:", fnError);
        setError(fnError.message);
        return;
      }

      if (data?.error) {
        console.error("AI error:", data.error);
        setError(data.error);
        return;
      }

      if (data?.bullets && data.bullets.length > 0) {
        console.log("Generated bullets:", data.bullets);
        onBulletsGenerated(data.bullets);
        lastProcessedFrame.current = screenshot;
      }
    } catch (err) {
      console.error("Error analyzing content:", err);
      setError(err instanceof Error ? err.message : 'Failed to analyze content');
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [onBulletsGenerated]);

  return {
    analyzeContent,
    isProcessing,
    error
  };
};
