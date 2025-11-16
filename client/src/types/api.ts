import type { Transcription } from "@shared/schema";

// API response types where Date objects are serialized as strings
export interface TranscriptionResponse {
  id: string;
  text: string;
  timestamp: string; // ISO string from JSON serialization
  webhookStatus: "pending" | "sent" | "failed";
}

// Helper to convert API response to Transcription with Date object
export function parseTranscriptionResponse(response: TranscriptionResponse): Transcription {
  return {
    id: response.id,
    text: response.text,
    timestamp: new Date(response.timestamp),
    webhookStatus: response.webhookStatus,
  };
}
