import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPublicationSchema, insertTeachingSchema, insertTalkSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/publications", async (_req, res) => {
    const publications = await storage.getPublications();
    res.json(publications);
  });

  app.post("/api/publications", async (req, res) => {
    const result = insertPublicationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid publication data" });
    }
    const publication = await storage.addPublication(result.data);
    res.json(publication);
  });

  app.get("/api/teaching", async (_req, res) => {
    const materials = await storage.getTeachingMaterials();
    res.json(materials);
  });

  app.post("/api/teaching", async (req, res) => {
    const result = insertTeachingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid teaching material data" });
    }
    const material = await storage.addTeachingMaterial(result.data);
    res.json(material);
  });

  app.get("/api/talks", async (_req, res) => {
    const talks = await storage.getTalks();
    res.json(talks);
  });

  app.post("/api/talks", async (req, res) => {
    const result = insertTalkSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid talk data" });
    }
    const talk = await storage.addTalk(result.data);
    res.json(talk);
  });

  return createServer(app);
}
