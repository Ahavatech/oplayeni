import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProfileSchema, insertCourseSchema, insertMaterialSchema, insertPublicationSchema, insertConferenceSchema } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).send("Forbidden");
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Profile Routes
  app.get("/api/profile", async (req, res) => {
    const profile = await storage.getProfile();
    res.json(profile);
  });

  app.put("/api/profile", requireAdmin, async (req, res) => {
    const parsed = insertProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const profile = await storage.updateProfile(parsed.data);
    res.json(profile);
  });

  // Course Routes
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(req.params.id);
    if (!course) return res.status(404).send("Course not found");
    res.json(course);
  });

  app.post("/api/courses", requireAdmin, async (req, res) => {
    const parsed = insertCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const course = await storage.createCourse(parsed.data);
    res.status(201).json(course);
  });

  app.put("/api/courses/:id", requireAdmin, async (req, res) => {
    const course = await storage.updateCourse(req.params.id, req.body);
    res.json(course);
  });

  app.delete("/api/courses/:id", requireAdmin, async (req, res) => {
    await storage.deleteCourse(req.params.id);
    res.sendStatus(204);
  });

  // Course Materials Routes
  app.get("/api/courses/:courseId/materials", async (req, res) => {
    const materials = await storage.getMaterials(req.params.courseId);
    res.json(materials);
  });

  app.post("/api/courses/:courseId/materials", requireAdmin, async (req, res) => {
    const parsed = insertMaterialSchema.safeParse({
      ...req.body,
      courseId: req.params.courseId,
    });
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const material = await storage.createMaterial(parsed.data);
    res.status(201).json(material);
  });

  app.delete("/api/materials/:id", requireAdmin, async (req, res) => {
    await storage.deleteMaterial(req.params.id);
    res.sendStatus(204);
  });

  // Publications Routes
  app.get("/api/publications", async (req, res) => {
    const publications = await storage.getPublications();
    res.json(publications);
  });

  app.post("/api/publications", requireAdmin, async (req, res) => {
    const parsed = insertPublicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const publication = await storage.createPublication(parsed.data);
    res.status(201).json(publication);
  });

  app.delete("/api/publications/:id", requireAdmin, async (req, res) => {
    await storage.deletePublication(req.params.id);
    res.sendStatus(204);
  });

  // Conferences Routes
  app.get("/api/conferences", async (req, res) => {
    const conferences = await storage.getConferences();
    res.json(conferences);
  });

  app.post("/api/conferences", requireAdmin, async (req, res) => {
    const parsed = insertConferenceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const conference = await storage.createConference(parsed.data);
    res.status(201).json(conference);
  });

  app.delete("/api/conferences/:id", requireAdmin, async (req, res) => {
    await storage.deleteConference(req.params.id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}