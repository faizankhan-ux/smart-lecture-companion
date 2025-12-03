import { FileText, Mic, MicOff, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BulletPoint } from '@/types/lecture';
import { cn } from '@/lib/utils';

interface LiveNotesPanelProps {
  bullets: BulletPoint[];
  isListening: boolean;
  interimTranscript: string;
  onToggleListening: () => void;
  onClearBullets?: () => void;
  isAIProcessing?: boolean;
}

export const LiveNotesPanel = ({
  bullets,
  isListening,
  interimTranscript,
  onToggleListening,
  onClearBullets,
  isAIProcessing = false
}: LiveNotesPanelProps) => {
  return (
    <div className="glass-panel p-4 h-full flex flex-col m-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Live Notes</h3>
          <span className="text-xs text-muted-foreground">({bullets.length} bullets)</span>
          {isAIProcessing && (
            <div className="flex items-center gap-1 text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">AI analyzing...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isListening && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full voice-wave"
                    style={{
                      height: `${8 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-primary font-medium">Listening</span>
            </div>
          )}
          
          <Button
            variant={isListening ? 'recording' : 'outline'}
            size="icon"
            onClick={onToggleListening}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 min-h-[300px]">
        {bullets.length === 0 && !interimTranscript ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Mic className="w-10 h-10 text-muted-foreground opacity-50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Click the mic button to start capturing lecture notes
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Notes will appear as bullet points
            </p>
          </div>
        ) : (
          <>
            {bullets.map((bullet, index) => (
              <div
                key={bullet.id}
                className={cn(
                  "bullet-item text-foreground/90 fade-in bg-secondary/30 rounded-lg pr-3",
                  index === bullets.length - 1 && "border-l-2 border-primary"
                )}
              >
                {bullet.text}
              </div>
            ))}
            
            {interimTranscript && (
              <div className="bullet-item text-muted-foreground italic bg-primary/10 rounded-lg pr-3">
                {interimTranscript}...
              </div>
            )}
          </>
        )}
      </div>
      
      {bullets.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Auto-formatted as bullet points
          </span>
          {onClearBullets && (
            <Button variant="ghost" size="sm" onClick={onClearBullets}>
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
