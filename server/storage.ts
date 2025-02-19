import { Publication, InsertPublication, Teaching, InsertTeaching, Talk, InsertTalk, Admin, InsertAdmin } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private publications: Map<number, Publication>;
  private teaching: Map<number, Teaching>;
  private talks: Map<number, Talk>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.admins = new Map();
    this.publications = new Map();
    this.teaching = new Map();
    this.talks = new Map();
    this.currentIds = { admins: 1, publications: 1, teaching: 1, talks: 1 };
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    ) || null;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = this.currentIds.admins++;
    const newAdmin = { ...admin, id };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }

  async getPublications(): Promise<Publication[]> {
    return Array.from(this.publications.values());
  }

  async addPublication(pub: InsertPublication): Promise<Publication> {
    const id = this.currentIds.publications++;
    const publication = { ...pub, id, link: pub.link || null, abstract: pub.abstract || null };
    this.publications.set(id, publication);
    return publication;
  }

  async getTeachingMaterials(): Promise<Teaching[]> {
    return Array.from(this.teaching.values());
  }

  async addTeachingMaterial(material: InsertTeaching): Promise<Teaching> {
    const id = this.currentIds.teaching++;
    const teachingMaterial = { ...material, id, description: material.description || null };
    this.teaching.set(id, teachingMaterial);
    return teachingMaterial;
  }

  async getTalks(): Promise<Talk[]> {
    return Array.from(this.talks.values());
  }

  async addTalk(talk: InsertTalk): Promise<Talk> {
    const id = this.currentIds.talks++;
    const newTalk = { ...talk, id, description: talk.description || null };
    this.talks.set(id, newTalk);
    return newTalk;
  }
}

export const storage = new MemStorage();