import { type Transcription, type InsertTranscription } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  getTranscriptions(): Promise<Transcription[]>;
  updateTranscriptionWebhookStatus(id: string, status: "pending" | "sent" | "failed"): Promise<void>;
}

export class MemStorage implements IStorage {
  private transcriptions: Map<string, Transcription>;

  constructor() {
    this.transcriptions = new Map();
  }

  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    const id = randomUUID();
    const transcription: Transcription = {
      ...insertTranscription,
      id,
      timestamp: new Date(),
      webhookStatus: "pending",
    };
    this.transcriptions.set(id, transcription);
    return transcription;
  }

  async getTranscriptions(): Promise<Transcription[]> {
    return Array.from(this.transcriptions.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async updateTranscriptionWebhookStatus(
    id: string,
    status: "pending" | "sent" | "failed"
  ): Promise<void> {
    const transcription = this.transcriptions.get(id);
    if (transcription) {
      transcription.webhookStatus = status;
      this.transcriptions.set(id, transcription);
    }
  }
}

export const storage = new MemStorage();
