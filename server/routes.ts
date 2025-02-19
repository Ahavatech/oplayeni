import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPublicationSchema, insertTeachingSchema, insertTalkSchema, insertAdminSchema } from "@shared/schema";
import { configureAuth, requireAdmin, login, hashPassword } from "./auth";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export async function registerRoutes(app: Express) {
  configureAuth(app);

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const admin = await login(result.data.username, result.data.password);
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.adminId = admin.id;
    res.json({ message: "Logged in successfully" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Protected Admin Routes
  app.post("/api/admin/register", requireAdmin, async (req, res) => {
    const result = insertAdminSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid admin data" });
    }

    const hashedPassword = await hashPassword(result.data.password);
    const admin = await storage.createAdmin({
      ...result.data,
      password: hashedPassword,
    });

    res.json({ message: "Admin created successfully", id: admin.id });
  });

  // Public Routes
  app.get("/api/publications", async (_req, res) => {
    const publications = await storage.getPublications();
    res.json(publications);
  });

  // Protected Routes
  app.post("/api/publications", requireAdmin, async (req, res) => {
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

  app.post("/api/teaching", requireAdmin, async (req, res) => {
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

  app.post("/api/talks", requireAdmin, async (req, res) => {
    const result = insertTalkSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid talk data" });
    }
    const talk = await storage.addTalk(result.data);
    res.json(talk);
  });

  return createServer(app);
}