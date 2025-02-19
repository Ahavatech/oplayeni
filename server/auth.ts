import { Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}

export function configureAuth(app: any) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "development_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function login(username: string, password: string) {
  const admin = await storage.getAdminByUsername(username);
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return null;

  return admin;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}