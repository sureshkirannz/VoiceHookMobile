import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Wifi, WifiOff } from "lucide-react";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TranscriptionCard } from "@/components/TranscriptionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PermissionPrompt } from "@/components/PermissionPrompt";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { Transcription } from "@shared/schema";
import type { TranscriptionResponse } from "@/types/api";
import { parseTranscriptionResponse } from "@/types/api";

type RecordingStatus = "idle" | "recording" | "transcribing";

export default function Home() {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionError, setPermissionError] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [webhookConnected, setWebhookConnected] = useState(true);
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isActivelyRecordingRef = useRef(false);

  useEffect(() => {
    // Auto-scroll to latest transcription
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const handleStartRecording = () => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setPermissionError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setShowPermissionPrompt(true);
      return;
    }

    setShowPermissionPrompt(true);
  };

  const handleRequestPermission = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream, we just needed permission
      
      setShowPermissionPrompt(false);
      setPermissionError("");
      initializeSpeechRecognition();
    } catch (error) {
      setPermissionError("Microphone access denied. Please allow microphone access in your browser settings.");
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    let accumulatedTranscript = '';
    let silenceTimeout: NodeJS.Timeout | null = null;
    const SILENCE_DELAY = 1500;
    
    const sendTranscription = async (text: string) => {
      if (!text.trim()) return;
      
      setStatus("transcribing");
      
      const tempId = crypto.randomUUID();
      const tempTranscription: Transcription = {
        id: tempId,
        text: text.trim(),
        timestamp: new Date(),
        webhookStatus: "pending",
      };
      
      setTranscriptions(prev => [...prev, tempTranscription]);
      
      try {
        const response = await apiRequest("POST", "/api/transcriptions", { text: text.trim() });
        const apiData: TranscriptionResponse = await response.json();
        const savedTranscription = parseTranscriptionResponse(apiData);
        
        setTranscriptions(prev =>
          prev.map(t => t.id === tempId ? savedTranscription : t)
        );
        
        setWebhookConnected(true);
      } catch (error) {
        console.error("API error:", error);
        
        setTranscriptions(prev =>
          prev.map(t => t.id === tempId ? { ...t, webhookStatus: "failed" as const } : t)
        );
        
        setWebhookConnected(false);
        
        toast({
          variant: "destructive",
          title: "Webhook delivery failed",
          description: "Check your connection and try again",
        });
      }
      
      setStatus("recording");
    };
    
    recognition.onstart = () => {
      isActivelyRecordingRef.current = true;
      setStatus("recording");
      toast({
        title: "Recording started",
        description: "Speak naturally, transcriptions will be sent after pauses",
      });
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        accumulatedTranscript += (accumulatedTranscript ? ' ' : '') + finalTranscript;
      }
      
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
      }
      
      if (accumulatedTranscript.trim()) {
        silenceTimeout = setTimeout(() => {
          const textToSend = accumulatedTranscript;
          accumulatedTranscript = '';
          sendTranscription(textToSend);
        }, SILENCE_DELAY);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === 'no-speech') {
        // Just continue listening - this is normal
        return;
      }
      
      if (event.error === 'aborted') {
        // Normal stop, don't restart
        return;
      }
      
      if (event.error === 'network') {
        toast({
          variant: "destructive",
          title: "Network error",
          description: "Restarting recognition...",
        });
        setTimeout(() => {
          if (recognitionRef.current) {
            recognition.start();
          }
        }, 1000);
      }
    };
    
    recognition.onend = () => {
      // Auto-restart for continuous listening if we're still supposed to be recording
      if (isActivelyRecordingRef.current && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Recognition restart attempted but not needed");
        }
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStopRecording = () => {
    isActivelyRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setStatus("idle");
    setAudioLevel(0);
    toast({
      title: "Recording stopped",
      description: "Click record to start again",
    });
  };

  // Simulate audio levels for visualization
  useEffect(() => {
    if (status === "recording") {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.7 + 0.3);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [status]);

  const isRecording = status !== "idle";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b h-16 md:h-20">
        <div className="h-full max-w-4xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">Live Transcribe</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <div className="flex items-center gap-1.5" data-testid="webhook-status">
              {webhookConnected ? (
                <Wifi className="h-4 w-4 text-green-600 dark:text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4">
        {/* Transcription Area */}
        <div className="flex-1 py-6 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollRef}>
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8" data-testid="empty-state">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Mic className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No transcriptions yet</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Press the record button to start capturing and transcribing audio in real-time
                </p>
              </div>
            ) : (
              <div>
                {transcriptions.map((t) => (
                  <TranscriptionCard
                    key={t.id}
                    text={t.text}
                    timestamp={t.timestamp}
                    webhookStatus={t.webhookStatus}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Control Area - Fixed Bottom */}
        <div className="pb-8 pt-4 flex flex-col items-center gap-6">
          <AudioVisualizer isRecording={isRecording} audioLevel={audioLevel} />
          
          <Button
            size="icon"
            variant={isRecording ? "default" : "outline"}
            className={`h-28 w-28 md:h-36 md:w-36 rounded-full transition-all ${
              isRecording ? 'ring-4 ring-primary/20 animate-pulse' : ''
            }`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            data-testid={isRecording ? "button-stop" : "button-record"}
          >
            {isRecording ? (
              <MicOff className="h-12 w-12 md:h-14 md:w-14" />
            ) : (
              <Mic className="h-12 w-12 md:h-14 md:w-14" />
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            {isRecording 
              ? "Recording... Transcriptions sent automatically on pauses"
              : "Tap to start continuous recording"
            }
          </p>
        </div>
      </main>

      {/* Permission Prompt */}
      <PermissionPrompt
        open={showPermissionPrompt}
        onRequestPermission={handleRequestPermission}
        error={permissionError}
      />
    </div>
  );
}
