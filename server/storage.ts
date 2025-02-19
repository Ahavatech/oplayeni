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

export class DatabaseStorage implements IStorage {
  async getAdminByUsername(username: string): Promise<Admin | null> {
    return await Admin.findOne({ username });
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const newAdmin = new Admin(admin);
    return await newAdmin.save();
  }

  async getPublications(): Promise<Publication[]> {
    return await Publication.find();
  }

  async addPublication(pub: InsertPublication): Promise<Publication> {
    const publication = new Publication(pub);
    return await publication.save();
  }

  async getTeachingMaterials(): Promise<Teaching[]> {
    return await Teaching.find();
  }

  async addTeachingMaterial(material: InsertTeaching): Promise<Teaching> {
    const teachingMaterial = new Teaching(material);
    return await teachingMaterial.save();
  }

  async getTalks(): Promise<Talk[]> {
    return await Talk.find();
  }

  async addTalk(talk: InsertTalk): Promise<Talk> {
    const newTalk = new Talk(talk);
    return await newTalk.save();
  }
}

export const storage = new DatabaseStorage();