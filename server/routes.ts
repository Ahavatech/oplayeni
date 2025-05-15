import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProfileSchema, insertCourseSchema, insertMaterialSchema, insertPublicationSchema, insertConferenceSchema, insertUpcomingTalkSchema } from "@shared/schema";
//import { upload } from "./utils/upload";
import fs from "fs/promises";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { uploadMedia } from "./utils/uploadController";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs"
import { comparePasswords, hashPassword } from "./utils";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save temporary files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage: multerStorage, 
  limits: { fileSize: 50 * 1024 * 1024 } // Increased to 50MB
});


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
    try {
    const profile = await storage.getProfile();
      if (!profile) {
        // Create a default profile if none exists
        const defaultProfile = await storage.updateProfile({
          name: "Admin User",
          title: "Professor",
          bio: "Welcome to my academic profile.",
          photoUrl: "",
          contactInfo: {
            email: "admin@example.com",
            phone: "",
            office: ""
          }
        });
        return res.json(defaultProfile);
      }
    res.json(profile);
    } catch (error) {
      console.error("[Profile] Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put(
    "/api/profile/upload-photo",
    requireAdmin,
    upload.single("photo"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("[Profile Upload] File received:", req.file);

        // Determine Cloudinary resource type based on file extension
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const resourceType: "image" | "raw" =
          [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileExtension) ? "image" : "raw";

        // Cloudinary upload options
        const uploadOptions: UploadApiOptions = {
          folder: "profile-photos",
          resource_type: resourceType,
          public_id: `profile_${Date.now()}`,
          use_filename: true,
          unique_filename: true,
        };

        // Read file and upload to Cloudinary
        const fileContent = await fs.readFile(req.file.path);
        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
              console.error("[Profile Upload] Cloudinary upload failed:", error);
              reject(error || new Error("Upload failed"));
            } else {
              console.log("[Profile Upload] Success:", result.secure_url);
              resolve(result);
            }
          });
          uploadStream.end(fileContent);
        });

        // Remove temporary file
        await fs.unlink(req.file.path).catch((err) =>
          console.warn("[Profile Upload] Failed to delete temp file:", err)
        );

        // Fetch existing profile
        const existingProfile = await storage.getProfile();
        if (!existingProfile) {
          return res.status(500).json({ error: "Profile not found" });
        }

        // Update profile with new photo URL
        await storage.updateProfile({
          ...existingProfile,
          photoUrl: uploadResult.secure_url,
        });

        console.log("[Profile Upload] Profile updated with image:", uploadResult.secure_url);

        // ✅ Return the image URL correctly
        res.status(200).json({ imageUrl: uploadResult.secure_url });
      } catch (error: any) {
        console.error("[Profile Upload] Error:", error);
        res.status(500).json({ error: "Failed to process upload", details: error.message });
      }
    }
  );

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

  app.get("/api/materials/:id/download", async (req, res) => {
    try {
      const material = await storage.getMaterial(req.params.id);
      if (!material) {
        return res.status(404).json({ error: "Material not found" });
      }
  
      const fileUrl = material.fileUrl;
      const fileExtension = fileUrl.split(".").pop()?.toLowerCase() || "";
      const fileName = `${material.title.replace(/[^a-zA-Z0-9]/g, "_")}.${fileExtension}`;
  
      console.log(`[Download] Fetching file from Cloudinary: ${fileUrl}`);
  
      try {
        // Fetch the file from Cloudinary
        const response = await axios.get(fileUrl, { responseType: "stream" });
  
        // Set headers for download
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", response.headers["content-type"]);
  
        // Stream file to the client
        response.data.pipe(res);
      } catch (error: any) {
        console.error("[Download] Cloudinary fetch error:", error.message);
        res.status(500).json({ error: "Failed to download file" });
      }
    } catch (error: any) {
      console.error("[Download] Error downloading material:", error);
      res.status(500).json({ error: "Failed to download material" });
    }
  });

  function getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }

  

  app.post("/api/courses/:courseId/materials/upload", requireAdmin, upload.single("file"), async (req, res) => {
    try {
        console.log('[Upload] Request received:', {
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            } : null,
            body: req.body,
            courseId: req.params.courseId
        });

    if (!req.file) {
            console.log('[Upload] No file in request');
      return res.status(400).json({ error: "No file uploaded" });
    }

        const file = req.file;
        const { type, title } = req.body;

        // Get file extension
        const fileExtension = path.extname(file.originalname).toLowerCase();

        // Determine Cloudinary resource type
        let resourceType: "image" | "video" | "raw" = "raw"; // Default

        if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"].includes(fileExtension)) {
            resourceType = "image";
        } else if ([".mp4", ".avi", ".mov", ".mkv", ".webm"].includes(fileExtension)) {
            resourceType = "video";
        } else if (fileExtension === ".pdf") {
            resourceType = "image"; // Cloudinary processes PDFs as "raw" but still displays them
        }

        // Cloudinary Upload Options
        const uploadOptions: UploadApiOptions = {
            folder: "course-materials",
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            use_filename: true,
            unique_filename: true
        };

        console.log("[Upload] Cloudinary options:", uploadOptions);

        // Read file from disk
        const fileContent = await fs.readFile(file.path);

        // Upload to Cloudinary
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error || !result) {
                        console.error("[Upload] Cloudinary upload error:", error);
                        reject(error || new Error("Upload failed"));
                    } else {
                        console.log("[Upload] Cloudinary upload success:", result.secure_url);
                        resolve(result);
                    }
                }
            );

            uploadStream.end(fileContent);
        });

        // Clean up temporary file
        await fs.unlink(file.path).catch(err => {
            console.warn("[Upload] Failed to delete temporary file:", err);
        });

        console.log("[Upload] Creating material in database");

        // Store in database
    const material = await storage.createMaterial({
      courseId: req.params.courseId,
            title: title || file.originalname,
            type,
            fileUrl: uploadResult.secure_url,
            submissionDate: type === "assignment" && req.body.submissionDate
                ? new Date(req.body.submissionDate)
                : undefined
        });

        console.log("[Upload] Material created successfully:", material);
    res.status(201).json(material);
    } catch (error: any) {
        console.error("[Upload] Error uploading material:", error);
        res.status(500).json({
            error: "Failed to upload material",
            details: error.message
        });
    }
});


  app.delete("/api/materials/:id", requireAdmin, async (req, res) => {
    await storage.deleteMaterial(req.params.id);
    res.sendStatus(204);
  });

  // Publications Routes
  app.get("/api/publications", async (req, res) => {
    try {
    const publications = await storage.getPublications();
    res.json(publications);
    } catch (error) {
      console.error("[Publications] Error fetching publications:", error);
      res.status(500).json({ error: "Failed to fetch publications" });
    }
  });

  app.post("/api/publications", requireAdmin, upload.single("pdf"), async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ error: "Publication data is missing" });
      }
  
      // Parse publication data
      const publicationData = JSON.parse(req.body.data);
      console.log("[Server] Parsed Publication Data:", publicationData);
  
      // Validate using Zod
      const parsed = insertPublicationSchema.safeParse(publicationData);
    if (!parsed.success) {
        console.error("[Validation Error]", parsed.error);
      return res.status(400).json(parsed.error);
    }
  
      let pdfUrl: string | undefined = undefined;
  
      if (req.file) {
        const file = req.file;
        
        // Correctly specify resource_type as 'raw' (for non-image files like PDFs)
        const uploadOptions = {
          folder: "publications",
          resource_type: "image" as "image",  // explicitly setting the resource type
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
          use_filename: true
        };
  
        console.log("[Upload] Cloudinary options:", uploadOptions);
  
        // Read file content
        const fileContent = await fs.readFile(file.path);
  
        // Upload to Cloudinary
        pdfUrl = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
              console.error("[Upload] Cloudinary upload error:", error);
              reject(new Error("Upload failed"));
            } else {
              console.log("[Upload] Cloudinary upload success:", result.secure_url);
              resolve(result.secure_url);
            }
          });
  
          uploadStream.end(fileContent);
        });
  
        // Clean up temporary file
        await fs.unlink(file.path).catch(err => {
          console.warn("[Upload] Failed to delete temporary file:", err);
        });
      }
  
      console.log("[Upload] Creating material in database");
  
      const publication = await storage.createPublication({
        ...parsed.data,
        pdfUrl
      });
  
    res.status(201).json(publication);
    } catch (error) {
      console.error("[Publications] Error creating publication:", error);
      res.status(500).json({ error: "Failed to create publication" });
    }
  });

  // Add PUT route for updating publications
  app.put("/api/publications/:id", requireAdmin, upload.single("pdf"), async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ error: "Publication data is missing" });
      }

      // Parse publication data
      const publicationData = JSON.parse(req.body.data);
      console.log("[Server] Parsed Publication Update Data:", publicationData);

      // Validate using Zod
      const parsed = insertPublicationSchema.safeParse(publicationData);
      if (!parsed.success) {
        console.error("[Validation Error]", parsed.error);
        return res.status(400).json(parsed.error);
      }

      let pdfUrl: string | undefined = undefined;

      if (req.file) {
        const file = req.file;
        
        const uploadOptions = {
          folder: "publications",
          resource_type: "image" as "image",
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
          use_filename: true
        };

        console.log("[Upload] Cloudinary options:", uploadOptions);

        const fileContent = await fs.readFile(file.path);

        pdfUrl = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
              console.error("[Upload] Cloudinary upload error:", error);
              reject(new Error("Upload failed"));
            } else {
              console.log("[Upload] Cloudinary upload success:", result.secure_url);
              resolve(result.secure_url);
            }
          });

          uploadStream.end(fileContent);
        });

        await fs.unlink(file.path).catch(err => {
          console.warn("[Upload] Failed to delete temporary file:", err);
        });
      }

      const publication = await storage.updatePublication(req.params.id, {
        ...parsed.data,
        pdfUrl: pdfUrl || parsed.data.pdfUrl // Keep existing PDF URL if no new file uploaded
      });

      res.json(publication);
    } catch (error) {
      console.error("[Publications] Error updating publication:", error);
      res.status(500).json({ error: "Failed to update publication" });
    }
  });

  // Add DELETE route for publications
  app.delete("/api/publications/:id", requireAdmin, async (req, res) => {
    try {
    await storage.deletePublication(req.params.id);
    res.sendStatus(204);
    } catch (error) {
      console.error("[Publications] Error deleting publication:", error);
      res.status(500).json({ error: "Failed to delete publication" });
    }
  });

  app.get("/api/publications/:id/download", async (req, res) => {
    try {
      const publication = await storage.getPublication(req.params.id);
      if (!publication) {
        return res.status(404).json({ error: "Publication not found" });
      }

      if (!publication.pdfUrl) {
        return res.status(404).json({ error: "No PDF available for this publication" });
      }

      console.log(`[Download] Fetching file from Cloudinary: ${publication.pdfUrl}`);

      try {
        // Fetch the file from Cloudinary
        const response = await axios.get(publication.pdfUrl, { responseType: "stream" });

        // Set headers for download
        res.setHeader("Content-Disposition", `attachment; filename="${publication.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`);
        res.setHeader("Content-Type", "application/pdf");

        // Stream file to the client
        response.data.pipe(res);
      } catch (error: any) {
        console.error("[Download] Cloudinary fetch error:", error.message);
        res.status(500).json({ error: "Failed to download file" });
      }
    } catch (error: any) {
      console.error("[Download] Error downloading publication:", error);
      res.status(500).json({ error: "Failed to download publication" });
    }
  });

  // Events Routes
  app.get("/api/events", async (req, res) => {
    try {
      const talks = await storage.getUpcomingTalks();
      res.json(talks);
    } catch (error) {
      console.error("[Events] Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", requireAdmin, upload.single("flyer"), async (req, res) => {
    try {
      const talkData = JSON.parse(req.body.data);
      console.log("[Events] Creating event with data:", talkData);
      const parsed = insertUpcomingTalkSchema.safeParse(talkData);
      
      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }

      let flyerUrl = undefined;
      if (req.file) {
        console.log("[Events] Uploading flyer:", req.file.originalname);
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'events',
            resource_type: 'image',
            public_id: `event_${Date.now()}`,
            use_filename: true
          });
          flyerUrl = result.secure_url;
          console.log("[Events] Flyer uploaded successfully:", flyerUrl);
          await fs.unlink(req.file.path);
        } catch (uploadError) {
          console.error("[Events] Error uploading flyer:", uploadError);
          return res.status(500).json({ error: "Failed to upload flyer" });
        }
      }
      // Add this with your other event routes
app.delete("/api/events/:id", requireAdmin, async (req, res) => {
  try {
    console.log("[Events] Attempting to delete event:", req.params.id);
    await storage.deleteUpcomingTalk(req.params.id);
    console.log("[Events] Successfully deleted event:", req.params.id);
    res.sendStatus(204);
  } catch (error) {
    console.error("[Events] Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

      // Set status based on date
      const eventDate = new Date(parsed.data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);

      let status = parsed.data.status;
      if (eventDate < today) {
        status = 'completed';
      } else if (eventDate.getTime() === today.getTime()) {
        status = 'upcoming'; // Events happening today are still upcoming
      }

      const talk = await storage.createUpcomingTalk({
        ...parsed.data,
        flyerUrl,
        status
      });

      res.status(201).json(talk);
    } catch (error) {
      console.error("[Events] Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
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

  // Update admin credentials
  app.put("/api/admin/credentials", requireAdmin, async (req, res) => {
    try {
      if (!req.body) {
        console.log("[Admin Credentials] No request body");
        return res.status(400).json({ error: "No request body provided" });
      }

      const { currentPassword, newUsername, newPassword } = req.body;
      
      if (!currentPassword) {
        console.log("[Admin Credentials] Current password not provided");
        return res.status(400).json({ error: "Current password is required" });
      }

      console.log("[Admin Credentials] Update request received:", {
        hasCurrentPassword: true,
        hasNewUsername: !!newUsername,
        hasNewPassword: !!newPassword
      });

      // Get admin from storage
      const admin = await storage.getAdmin();
      if (!admin) {
        console.log("[Admin Credentials] Admin not found");
        return res.status(404).json({ error: "Admin not found" });
      }
      
      console.log("[Admin Credentials] Admin found, verifying password");
      
      try {
        // Verify current password using comparePasswords from utils
        const isPasswordValid = await comparePasswords(currentPassword, admin.password);
        if (!isPasswordValid) {
          console.log("[Admin Credentials] Invalid current password");
          return res.status(401).json({ error: "Current password is incorrect" });
        }
      } catch (error) {
        console.error("[Admin Credentials] Password verification error:", error);
        return res.status(500).json({ error: "Error verifying password" });
      }
      
      console.log("[Admin Credentials] Password verified, preparing updates");
      
      // Update credentials
      const updates: Partial<typeof admin> = {};
      
      if (newUsername) {
        console.log("[Admin Credentials] Checking if new username is available:", newUsername);
        // Check if username is already taken
        const existingAdmin = await storage.getAdminByUsername(newUsername);
        if (existingAdmin && existingAdmin._id !== admin._id) {
          console.log("[Admin Credentials] Username is already taken");
          return res.status(400).json({ error: "Username is already taken" });
        }
        updates.username = newUsername;
      }
      
      if (newPassword) {
        console.log("[Admin Credentials] Hashing new password");
        try {
          // Use hashPassword from utils instead of bcrypt
          updates.password = await hashPassword(newPassword);
        } catch (error) {
          console.error("[Admin Credentials] Error hashing new password:", error);
          return res.status(500).json({ error: "Error processing new password" });
        }
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log("[Admin Credentials] Applying updates to database");
        try {
          await storage.updateAdmin(admin._id, updates);
          console.log("[Admin Credentials] Updates applied successfully");
        } catch (dbError) {
          console.error("[Admin Credentials] Database update error:", dbError);
          return res.status(500).json({ error: "Failed to save updates to database" });
        }
      } else {
        console.log("[Admin Credentials] No changes to apply");
        return res.status(400).json({ error: "No changes requested" });
      }
      
      res.status(200).json({ message: "Credentials updated successfully" });
    } catch (error) {
      console.error("[Admin Credentials] Unexpected error:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
