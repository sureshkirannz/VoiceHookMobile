import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PermissionPromptProps {
  open: boolean;
  onRequestPermission: () => void;
  error?: string;
}

export function PermissionPrompt({ open, onRequestPermission, error }: PermissionPromptProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-permission">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Microphone Access Needed</DialogTitle>
          <DialogDescription className="text-center">
            This app needs access to your microphone to transcribe audio in real-time.
            Your audio is processed locally and only transcriptions are sent to the webhook.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={onRequestPermission} 
            size="lg" 
            className="w-full"
            data-testid="button-allow-microphone"
          >
            <Mic className="mr-2 h-4 w-4" />
            Allow Microphone Access
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Compatible with Chrome, Edge, and Safari browsers
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
