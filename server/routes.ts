import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProfileSchema, insertCourseSchema, insertMaterialSchema, insertPublicationSchema, insertConferenceSchema } from "@shared/schema";
//import { upload } from "./utils/upload";
import fs from "fs/promises";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { uploadMedia } from "./utils/uploadController";
import multer from "multer";

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

  app.post("/api/profile/upload-photo", requireAdmin, upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      console.log('Upload successful:', req.file);
      res.json({ url: req.file.path });
    } catch (error) {
      console.error('Error in upload route:', error);
      res.status(500).json({ error: 'Failed to process upload' });
    }
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

  app.get("/api/materials/:id/download", async (req, res) => {
    try {
      const material = await storage.getMaterial(req.params.id);
      if (!material) {
        return res.status(404).json({ error: "Material not found" });
      }

      // Extract file extension from the URL
      const fileUrl = material.fileUrl;
      const fileExtension = fileUrl.split('.').pop()?.toLowerCase() || '';
      const fileName = `${material.title.replace(/[^a-zA-Z0-9]/g, '_')}${fileExtension ? '.' + fileExtension : ''}`;

      // Check if it's an image or a raw file
      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
      
      try {
        if (isImage) {
          // For images, stream directly from Cloudinary
          const response = await axios({
            method: 'get',
            url: material.fileUrl,
            responseType: 'stream'
          });
          
          res.setHeader('Content-Type', `image/${fileExtension}`);
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          response.data.pipe(res);
        } else {
          // For raw files (PDFs, docs, etc.), use Cloudinary's download URL
          const publicId = material.fileUrl.split('/').slice(-1)[0].split('.')[0];
          const url = cloudinary.url(publicId, {
            resource_type: 'raw',
            flags: 'attachment'
          });
          
          // Redirect to the download URL
          res.redirect(url);
        }
      } catch (error: any) {
        console.error("[Download] Cloudinary error:", error.message);
        res.status(500).json({ error: "Failed to download file" });
      }
    } catch (error) {
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

      // Configure Cloudinary upload based on file type
      const isImage = file.mimetype.startsWith('image/');
      const uploadOptions: UploadApiOptions = {
        folder: 'course-materials',
        resource_type: isImage ? 'image' : 'raw',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        use_filename: true,
        unique_filename: true
      };

      console.log('[Upload] Cloudinary options:', uploadOptions);

      // Upload to Cloudinary
      try {
        // Read file from disk
        const fileContent = await fs.readFile(file.path);
        
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
              if (error || !result) {
                console.error('[Upload] Cloudinary upload error:', error);
                reject(error || new Error('Upload failed'));
              } else {
                console.log('[Upload] Cloudinary upload success:', result.secure_url);
                resolve(result);
              }
            }
          );

          // Write the file content to the upload stream
          uploadStream.end(fileContent);
        });

        // Clean up: Delete the temporary file
        await fs.unlink(file.path).catch(err => {
          console.warn('[Upload] Failed to delete temporary file:', err);
        });

        console.log('[Upload] Creating material in database');
        
        // Create material in database
        const material = await storage.createMaterial({
          courseId: req.params.courseId,
          title: title || file.originalname,
          type,
          fileUrl: uploadResult.secure_url,
          submissionDate: type === 'assignment' && req.body.submissionDate 
            ? new Date(req.body.submissionDate) 
            : undefined
        });

        console.log('[Upload] Material created successfully:', material);
        res.status(201).json(material);
      } catch (uploadError) {
        // Clean up: Delete the temporary file on error
        await fs.unlink(file.path).catch(err => {
          console.warn('[Upload] Failed to delete temporary file:', err);
        });
        console.error('[Upload] Error during upload process:', uploadError);
        throw uploadError;
      }
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