import { Publication, InsertPublication, Teaching, InsertTeaching, Talk, InsertTalk, Admin, InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { publications, teaching, talks, admins } from "@shared/schema";

export interface IStorage {
  // Admin
  getAdminByUsername(username: string): Promise<Admin | null>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Publications
  getPublications(): Promise<Publication[]>;
  addPublication(pub: InsertPublication): Promise<Publication>;

  // Teaching
  getTeachingMaterials(): Promise<Teaching[]>;
  addTeachingMaterial(material: InsertTeaching): Promise<Teaching>;

  // Talks
  getTalks(): Promise<Talk[]>;
  addTalk(talk: InsertTalk): Promise<Talk>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByUsername(username: string): Promise<Admin | null> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || null;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async getPublications(): Promise<Publication[]> {
    return await db.select().from(publications);
  }

  async addPublication(pub: InsertPublication): Promise<Publication> {
    const [publication] = await db.insert(publications).values(pub).returning();
    return publication;
  }

  async getTeachingMaterials(): Promise<Teaching[]> {
    return await db.select().from(teaching);
  }

  async addTeachingMaterial(material: InsertTeaching): Promise<Teaching> {
    const [teachingMaterial] = await db.insert(teaching).values(material).returning();
    return teachingMaterial;
  }

  async getTalks(): Promise<Talk[]> {
    return await db.select().from(talks);
  }

  async addTalk(talk: InsertTalk): Promise<Talk> {
    const [newTalk] = await db.insert(talks).values(talk).returning();
    return newTalk;
  }
}

export const storage = new DatabaseStorage();