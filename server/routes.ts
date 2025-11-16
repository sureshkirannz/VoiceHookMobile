import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTranscriptionSchema } from "@shared/schema";
import { z } from "zod";

const WEBHOOK_URL = "https://n8n.smartbytesolutions.co.nz/webhook/interview-audio";

async function sendToWebhook(data: { text: string; timestamp: string }): Promise<boolean> {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Webhook error:", error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create transcription and send to webhook
  app.post("/api/transcriptions", async (req, res) => {
    try {
      const data = insertTranscriptionSchema.parse(req.body);
      
      // Store transcription
      const transcription = await storage.createTranscription(data);
      
      // Send to webhook in background (don't block the response)
      const webhookData = {
        text: transcription.text,
        timestamp: transcription.timestamp.toISOString(),
      };
      
      // Try to send to webhook
      const success = await sendToWebhook(webhookData);
      
      // Update status
      await storage.updateTranscriptionWebhookStatus(
        transcription.id,
        success ? "sent" : "failed"
      );
      
      // Return updated transcription
      const updatedTranscription = {
        ...transcription,
        webhookStatus: success ? "sent" : "failed",
      };
      
      res.json(updatedTranscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error creating transcription:", error);
        res.status(500).json({ error: "Failed to create transcription" });
      }
    }
  });

  // Get all transcriptions
  app.get("/api/transcriptions", async (req, res) => {
    try {
      const transcriptions = await storage.getTranscriptions();
      res.json(transcriptions);
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
      res.status(500).json({ error: "Failed to fetch transcriptions" });
    }
  });

  // Retry failed webhook
  app.post("/api/transcriptions/:id/retry", async (req, res) => {
    try {
      const { id } = req.params;
      const transcriptions = await storage.getTranscriptions();
      const transcription = transcriptions.find(t => t.id === id);
      
      if (!transcription) {
        res.status(404).json({ error: "Transcription not found" });
        return;
      }
      
      const webhookData = {
        text: transcription.text,
        timestamp: transcription.timestamp.toISOString(),
      };
      
      const success = await sendToWebhook(webhookData);
      
      await storage.updateTranscriptionWebhookStatus(
        id,
        success ? "sent" : "failed"
      );
      
      res.json({ success });
    } catch (error) {
      console.error("Error retrying webhook:", error);
      res.status(500).json({ error: "Failed to retry webhook" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
