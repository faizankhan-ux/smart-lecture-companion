import { Monitor, MonitorOff, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScreenPreviewProps {
  isCapturing: boolean;
  currentFrame: string | null;
  onStart: () => void;
  onStop: () => void;
}

export const ScreenPreview = ({ isCapturing, currentFrame, onStart, onStop }: ScreenPreviewProps) => {
  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Screen Capture</h3>
        </div>
        {isCapturing && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs text-destructive font-medium">LIVE</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 rounded-lg overflow-hidden bg-muted/50 relative flex items-center justify-center min-h-[200px]">
        {currentFrame ? (
          <img 
            src={currentFrame} 
            alt="Screen capture" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-6">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {isCapturing ? 'Waiting for frame...' : 'Start capture to share your screen'}
            </p>
          </div>
        )}
        
        {isCapturing && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-destructive/90 text-destructive-foreground text-xs font-medium">
            Recording
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-center">
        <Button
          variant={isCapturing ? 'recording' : 'glow'}
          size="lg"
          onClick={isCapturing ? onStop : onStart}
          className="w-full max-w-xs relative hover:scale-[1.05]"
        >
          {isCapturing ? (
            <>
              <MonitorOff className="w-4 h-4 mr-2" />
              Stop Capture
            </>
          ) : (
            <>
              <Monitor className="w-4 h-4 mr-2" />
              Start Screen Capture
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
