import { 
  type User, type InsertUser, type Course, type CourseMaterial,
  type Publication, type Conference, type Profile, type InsertProfile,
  type InsertCourse, type InsertMaterial, type InsertPublication,
  type InsertConference, type UpcomingTalk, type InsertUpcomingTalk,
  type Admin
} from "@shared/schema";
import { UserModel, ProfileModel, CourseModel, CourseMaterialModel, PublicationModel, ConferenceModel, UpcomingTalkModel } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import MongoStore from "connect-mongo";

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
  getPublication(id: string): Promise<Publication | null>;
  createPublication(pub: InsertPublication): Promise<Publication>;
  updatePublication(id: string, pub: InsertPublication): Promise<Publication>;
  deletePublication(id: string): Promise<void>;

  // Conferences
  getConferences(): Promise<Conference[]>;
  createConference(conf: InsertConference): Promise<Conference>;
  deleteConference(id: string): Promise<void>;

  // Upcoming Talks
  getUpcomingTalks(): Promise<UpcomingTalk[]>;
  getUpcomingTalk(id: string): Promise<UpcomingTalk | undefined>;
  createUpcomingTalk(talk: InsertUpcomingTalk): Promise<UpcomingTalk>;
  updateUpcomingTalk(id: string, talk: Partial<InsertUpcomingTalk>): Promise<UpcomingTalk>;
  deleteUpcomingTalk(id: string): Promise<void>;

  // Session Store
  sessionStore: session.Store;

  getMaterial(id: string): Promise<CourseMaterial | null>;

  // Admin methods
  getAdmin(): Promise<Admin | null>;
  getAdminByUsername(username: string): Promise<Admin | null>;
  updateAdmin(id: string, updates: Partial<Admin>): Promise<void>;
}

export interface Admin {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });

    // Initialize default profile if none exists
    this.initializeDefaultProfile();
  }

  private async initializeDefaultProfile() {
    const profile = await ProfileModel.findOne();
    if (!profile) {
      await ProfileModel.create({
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
      console.log("[Storage] Created default profile");
    }
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
    const publications = await PublicationModel.find().sort({ year: -1, createdAt: -1 });
    return publications.map(p => p.toObject());
  }

  async getPublication(id: string): Promise<Publication | null> {
    const publication = await PublicationModel.findById(id);
    return publication ? publication.toObject() : null;
  }

  async createPublication(pub: InsertPublication): Promise<Publication> {
    const publication = await PublicationModel.create({
      ...pub,
      authors: pub.authors.map(author => ({
        ...author,
        isMainAuthor: author.isMainAuthor || false
      }))
    });
    return publication.toObject();
  }

  async updatePublication(id: string, pub: InsertPublication): Promise<Publication> {
    const publication = await PublicationModel.findByIdAndUpdate(
      id,
      {
        ...pub,
        authors: pub.authors.map(author => ({
          ...author,
          isMainAuthor: author.isMainAuthor || false
        })),
        updatedAt: new Date()
      },
      { new: true }
    );
    if (!publication) {
      throw new Error("Publication not found");
    }
    return publication.toObject();
  }

  async deletePublication(id: string): Promise<void> {
    console.log("[Storage] Attempting to delete publication:", id);
    try {
      const result = await PublicationModel.findByIdAndDelete(id);
      if (!result) {
        console.log("[Storage] Publication not found:", id);
        throw new Error("Publication not found");
      }
      console.log("[Storage] Successfully deleted publication:", id);
    } catch (error) {
      console.error("[Storage] Error deleting publication:", error);
      throw error;
    }
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

  async getUpcomingTalks(): Promise<UpcomingTalk[]> {
    const talks = await UpcomingTalkModel.find().sort({ date: 1, time: 1 });
    return talks.map(t => t.toObject());
  }

  async getUpcomingTalk(id: string): Promise<UpcomingTalk | undefined> {
    const talk = await UpcomingTalkModel.findById(id);
    return talk?.toObject();
  }

  async createUpcomingTalk(talk: InsertUpcomingTalk): Promise<UpcomingTalk> {
    const newTalk = await UpcomingTalkModel.create(talk);
    return newTalk.toObject();
  }

  async updateUpcomingTalk(id: string, talk: Partial<InsertUpcomingTalk>): Promise<UpcomingTalk> {
    const updated = await UpcomingTalkModel.findByIdAndUpdate(id, talk, { new: true });
    if (!updated) throw new Error("Talk not found");
    return updated.toObject();
  }

  async deleteUpcomingTalk(id: string): Promise<void> {
    await UpcomingTalkModel.findByIdAndDelete(id);
  }

  async getMaterial(id: string): Promise<CourseMaterial | null> {
    return await CourseMaterialModel.findById(id);
  }

  async getAdmin(): Promise<Admin | null> {
    const admin = await UserModel.findOne({ isAdmin: true });
    return admin?.toObject() || null;
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    const admin = await UserModel.findOne({ username, isAdmin: true });
    return admin?.toObject() || null;
  }

  async updateAdmin(id: string, updates: Partial<Admin>): Promise<void> {
    await UserModel.findByIdAndUpdate(id, updates, { new: true });
  }
}

export const storage = new DatabaseStorage();