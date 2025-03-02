import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { hashPassword, comparePasswords } from "./utils";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  // Configure session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[Auth] Attempting login for user: ${username}`);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log(`[Auth] User not found: ${username}`);
          return done(null, false);
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          console.log(`[Auth] Invalid password for user: ${username}`);
          return done(null, false);
        }

        console.log(`[Auth] Successful login for user: ${username}`);
        return done(null, user);
      } catch (err) {
        console.error("[Auth] Error in LocalStrategy:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log(`[Auth] Serializing user: ${user._id}`);
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log(`[Auth] Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        console.log(`[Auth] User not found during deserialization: ${id}`);
        return done(null, false);
      }
      console.log(`[Auth] Successfully deserialized user: ${id}`);
      done(null, user);
    } catch (err) {
      console.error("[Auth] Error in deserializeUser:", err);
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log(`[Auth] Registration attempt for user: ${req.body.username}`);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log(`[Auth] Registration failed - username exists: ${req.body.username}`);
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      console.log(`[Auth] User registered successfully: ${user._id}`);
      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Login error after registration:", err);
          return next(err);
        }
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("[Auth] Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log(`[Auth] Login attempt for user: ${req.body.username}`);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("[Auth] Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log(`[Auth] Login failed for user: ${req.body.username}`);
        return res.status(401).send(info?.message || "Invalid credentials");
      }
      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Session creation error:", err);
          return next(err);
        }
        console.log(`[Auth] Login successful for user: ${user._id}`);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const userId = req.user?._id;
    console.log(`[Auth] Logout request for user: ${userId}`);
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Logout error:", err);
        return next(err);
      }
      console.log(`[Auth] Logout successful for user: ${userId}`);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log(`[Auth] User data request - Authenticated: ${req.isAuthenticated()}`);
    if (!req.isAuthenticated()) {
      console.log("[Auth] Unauthorized user data request");
      return res.sendStatus(401);
    }
    console.log(`[Auth] Returning user data for: ${req.user._id}`);
    res.json(req.user);
  });
}