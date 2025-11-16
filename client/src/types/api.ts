// API response types where Date objects are serialized as strings
export interface TranscriptionResponse {
  id: string;
  text: string;
  timestamp: string; // ISO string from JSON serialization
  webhookStatus: "pending" | "sent" | "failed";
}
