import { useState, useRef, useCallback } from 'react';

export const useScreenCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 1,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      // Create video element to capture frames
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      videoRef.current = video;
      
      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      canvasRef.current = canvas;
      
      await video.play();
      setIsCapturing(true);
      
      // Capture frame every 2 seconds
      intervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 1280, 720);
            const frame = canvasRef.current.toDataURL('image/jpeg', 0.7);
            console.log("🖼️ Frame captured, length:", frame.length);
            setCurrentFrame(frame);
          }
        }
      }, 2000);
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
      
    } catch (error) {
      console.error('Error starting screen capture:', error);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCapturing(false);
    setCurrentFrame(null);
  }, []);

  return {
    isCapturing,
    currentFrame,
    startCapture,
    stopCapture
  };
};
