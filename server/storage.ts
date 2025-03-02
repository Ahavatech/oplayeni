import { 
  type User, type InsertUser, type Course, type CourseMaterial,
  type Publication, type Conference, type Profile, type InsertProfile,
  type InsertCourse, type InsertMaterial, type InsertPublication,
  type InsertConference
} from "@shared/schema";
import { UserModel, ProfileModel, CourseModel, CourseMaterialModel, PublicationModel, ConferenceModel } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profile
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: InsertProfile): Promise<Profile>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Course Materials
  getMaterials(courseId: string): Promise<CourseMaterial[]>;
  createMaterial(material: InsertMaterial): Promise<CourseMaterial>;
  deleteMaterial(id: string): Promise<void>;

  // Publications
  getPublications(): Promise<Publication[]>;
  createPublication(pub: InsertPublication): Promise<Publication>;
  deletePublication(id: string): Promise<void>;

  // Conferences
  getConferences(): Promise<Conference[]>;
  createConference(conf: InsertConference): Promise<Conference>;
  deleteConference(id: string): Promise<void>;

  // Session Store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user?.toObject() || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user?.toObject() || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create({
      ...insertUser,
      isAdmin: false
    });
    return user.toObject();
  }

  async getProfile(): Promise<Profile | undefined> {
    const profile = await ProfileModel.findOne();
    return profile?.toObject() || undefined;
  }

  async updateProfile(profile: InsertProfile): Promise<Profile> {
    const updated = await ProfileModel.findOneAndUpdate(
      {}, // empty filter to update first document
      profile,
      { upsert: true, new: true }
    );
    return updated.toObject();
  }

  async getCourses(): Promise<Course[]> {
    const courses = await CourseModel.find();
    return courses.map(c => c.toObject());
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const course = await CourseModel.findById(id);
    return course?.toObject() || undefined;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const newCourse = await CourseModel.create(course);
    return newCourse.toObject();
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const updated = await CourseModel.findByIdAndUpdate(id, course, { new: true });
    if (!updated) throw new Error("Course not found");
    return updated.toObject();
  }

  async deleteCourse(id: string): Promise<void> {
    await CourseModel.findByIdAndDelete(id);
  }

  async getMaterials(courseId: string): Promise<CourseMaterial[]> {
    const materials = await CourseMaterialModel.find({ courseId });
    return materials.map(m => m.toObject());
  }

  async createMaterial(material: InsertMaterial): Promise<CourseMaterial> {
    const newMaterial = await CourseMaterialModel.create({
      ...material,
      uploadedAt: new Date()
    });
    return newMaterial.toObject();
  }

  async deleteMaterial(id: string): Promise<void> {
    await CourseMaterialModel.findByIdAndDelete(id);
  }

  async getPublications(): Promise<Publication[]> {
    const publications = await PublicationModel.find();
    return publications.map(p => p.toObject());
  }

  async createPublication(pub: InsertPublication): Promise<Publication> {
    const publication = await PublicationModel.create(pub);
    return publication.toObject();
  }

  async deletePublication(id: string): Promise<void> {
    await PublicationModel.findByIdAndDelete(id);
  }

  async getConferences(): Promise<Conference[]> {
    const conferences = await ConferenceModel.find();
    return conferences.map(c => c.toObject());
  }

  async createConference(conf: InsertConference): Promise<Conference> {
    const conference = await ConferenceModel.create(conf);
    return conference.toObject();
  }

  async deleteConference(id: string): Promise<void> {
    await ConferenceModel.findByIdAndDelete(id);
  }
}

export const storage = new DatabaseStorage();