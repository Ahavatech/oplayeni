import mongoose from 'mongoose';
import { z } from 'zod';

// Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

// Publication Schema
const PublicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: { type: String, required: true },
  journal: { type: String, required: true },
  year: { type: String, required: true },
  link: String,
  abstract: String
});

// Teaching Schema
const TeachingSchema = new mongoose.Schema({
  course: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true }
});

// Talk Schema
const TalkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  description: String
});

// Models
export const Admin = mongoose.model('Admin', AdminSchema);
export const Publication = mongoose.model('Publication', PublicationSchema);
export const Teaching = mongoose.model('Teaching', TeachingSchema);
export const Talk = mongoose.model('Talk', TalkSchema);

// Zod Schemas for validation
export const insertAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const insertPublicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "Authors are required"),
  journal: z.string().min(1, "Journal is required"),
  year: z.string().min(1, "Year is required"),
  link: z.string().optional(),
  abstract: z.string().optional()
});

export const insertTeachingSchema = z.object({
  course: z.string().min(1, "Course is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileUrl: z.string().min(1, "File URL is required")
});

export const insertTalkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z.date(),
  description: z.string().optional()
});

// Types
export type Admin = mongoose.InferSchemaType<typeof AdminSchema>;
export type Publication = mongoose.InferSchemaType<typeof PublicationSchema>;
export type Teaching = mongoose.InferSchemaType<typeof TeachingSchema>;
export type Talk = mongoose.InferSchemaType<typeof TalkSchema>;

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertPublication = z.infer<typeof insertPublicationSchema>;
export type InsertTeaching = z.infer<typeof insertTeachingSchema>;
export type InsertTalk = z.infer<typeof insertTalkSchema>;