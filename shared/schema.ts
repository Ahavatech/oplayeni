import { z } from "zod";

// Zod Schemas for validation
export const userSchema = z.object({
  _id: z.string(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().default(false),
});

export const profileSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  photoUrl: z.string().url("Must be a valid URL"),
  contactInfo: z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    office: z.string().optional(),
  }),
});

export const courseSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Course code is required"),
  description: z.string().min(1, "Description is required"),
  semester: z.string().min(1, "Semester is required"),
  session: z.string().min(1, "Session is required"),
});

export const courseMaterialSchema = z.object({
  _id: z.string(),
  courseId: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["notes", "tutorial", "assignment"]),
  fileUrl: z.string().url("Must be a valid URL"),
  uploadedAt: z.date().default(() => new Date()),
  submissionDate: z.date().optional(),
});

export const publicationSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "Authors are required"),
  journal: z.string().min(1, "Journal is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  doi: z.string().optional(),
  abstract: z.string().optional(),
});

export const conferenceSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, "Title is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["talk", "conference", "workshop"]),
});

// Types for TypeScript
export type User = z.infer<typeof userSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Course = z.infer<typeof courseSchema>;
export type CourseMaterial = z.infer<typeof courseMaterialSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type Conference = z.infer<typeof conferenceSchema>;

// Types for inserting new documents
export type InsertUser = Omit<User, "isAdmin" | "_id">;
export type InsertProfile = Omit<Profile, "_id">;
export type InsertCourse = Omit<Course, "_id">;
export type InsertMaterial = Omit<CourseMaterial, "uploadedAt" | "_id">;
export type InsertPublication = Omit<Publication, "_id">;
export type InsertConference = Omit<Conference, "_id">;

// Export schemas for validation
export const insertUserSchema = userSchema.omit({ isAdmin: true, _id: true });
export const insertProfileSchema = profileSchema.omit({ _id: true });
export const insertCourseSchema = courseSchema.omit({ _id: true });
export const insertMaterialSchema = courseMaterialSchema.omit({ uploadedAt: true, _id: true });
export const insertPublicationSchema = publicationSchema.omit({ _id: true });
export const insertConferenceSchema = conferenceSchema.omit({ _id: true });