import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TranscriptionCardProps {
  text: string;
  timestamp: Date;
  webhookStatus: "pending" | "sent" | "failed";
}

export function TranscriptionCard({ text, timestamp, webhookStatus }: TranscriptionCardProps) {
  const statusConfig = {
    pending: { icon: Clock, color: "text-muted-foreground", label: "Sending..." },
    sent: { icon: CheckCircle2, color: "text-green-600 dark:text-green-500", label: "Delivered" },
    failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
  };

  const config = statusConfig[webhookStatus];
  const Icon = config.icon;

  return (
    <Card className="p-4 mb-3" data-testid={`transcription-card-${timestamp.getTime()}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className={`text-xs ${config.color}`} data-testid="text-webhook-status">
            {config.label}
          </span>
        </div>
      </div>
      <p className="text-base leading-relaxed" data-testid="text-transcription">
        {text}
      </p>
    </Card>
  );
}
