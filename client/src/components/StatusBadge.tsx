import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface StatusBadgeProps {
  status: "idle" | "recording" | "transcribing";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    idle: { 
      label: "Ready", 
      color: "bg-muted text-muted-foreground",
      dotColor: "text-muted-foreground"
    },
    recording: { 
      label: "Recording", 
      color: "bg-primary text-primary-foreground",
      dotColor: "text-primary-foreground"
    },
    transcribing: { 
      label: "Transcribing", 
      color: "bg-accent text-accent-foreground",
      dotColor: "text-accent-foreground"
    },
  };

  const { label, color, dotColor } = config[status];

  return (
    <Badge className={`${color} uppercase tracking-wide text-xs font-medium gap-1.5`} data-testid={`badge-${status}`}>
      <Circle className={`h-2 w-2 fill-current ${dotColor} ${status === 'recording' ? 'animate-pulse' : ''}`} />
      {label}
    </Badge>
  );
}
