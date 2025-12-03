import { BookOpen, Download, Play, Square, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Session, BulletPoint, QuizQuestion } from '@/types/lecture';

interface TopBarProps {
  currentSession: Session | null;
  isRecording: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  bullets: BulletPoint[];
  quizQuestions: QuizQuestion[];
}

export const TopBar = ({
  currentSession,
  isRecording,
  onStartSession,
  onEndSession,
  bullets,
  quizQuestions
}: TopBarProps) => {
  const handleExportPDF = () => {
    // Create a simple text-based export
    let content = '# Lecture Notes Export\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    if (currentSession) {
      content += `## Session: ${currentSession.topic}\n\n`;
    }
    
    content += '## Notes\n\n';
    bullets.forEach(bullet => {
      content += `• ${bullet.text}\n`;
    });
    
    if (quizQuestions.length > 0) {
      content += '\n## Quiz Questions\n\n';
      quizQuestions.forEach((q, i) => {
        content += `${i + 1}. ${q.question}\n`;
        if (q.options) {
          q.options.forEach((opt, j) => {
            content += `   ${String.fromCharCode(65 + j)}. ${opt}\n`;
          });
        }
        content += `   Answer: ${q.answer}\n\n`;
      });
    }
    
    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecture-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="glass-panel px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Smart AI Screen Learning Assistant </h1>
            <p className="text-xs text-muted-foreground">Smart Lecture Assistant</p>
          </div>
        </div>
        
        {currentSession && (
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              {currentSession.topic}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {!currentSession ? (
          <Button variant="glow" onClick={onStartSession}>
            <Play className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        ) : (
          <Button variant="destructive" onClick={onEndSession}>
            <Square className="w-4 h-4 mr-2" />
            End Session
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={bullets.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Notes
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
