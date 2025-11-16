import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel?: number;
}

export function AudioVisualizer({ isRecording, audioLevel = 0 }: AudioVisualizerProps) {
  const bars = [0, 1, 2, 3, 4, 5, 6];
  
  return (
    <div className="flex items-center justify-center gap-1 h-12" data-testid="audio-visualizer">
      {bars.map((i) => {
        const baseHeight = 12;
        const maxHeight = 48;
        const randomFactor = Math.sin(Date.now() / 200 + i * 0.5) * 0.5 + 0.5;
        const height = isRecording 
          ? baseHeight + (maxHeight - baseHeight) * audioLevel * randomFactor
          : baseHeight;
        
        return (
          <div
            key={i}
            className="w-1 bg-primary rounded-full transition-all duration-150"
            style={{ 
              height: `${height}px`,
              opacity: isRecording ? 0.8 : 0.3
            }}
          />
        );
      })}
    </div>
  );
}
