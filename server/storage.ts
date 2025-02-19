import { Publication, InsertPublication, Teaching, InsertTeaching, Talk, InsertTalk } from "@shared/schema";

export interface IStorage {
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
  private publications: Map<number, Publication>;
  private teaching: Map<number, Teaching>;
  private talks: Map<number, Talk>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.publications = new Map();
    this.teaching = new Map();
    this.talks = new Map();
    this.currentIds = { publications: 1, teaching: 1, talks: 1 };
  }

  async getPublications(): Promise<Publication[]> {
    return Array.from(this.publications.values());
  }

  async addPublication(pub: InsertPublication): Promise<Publication> {
    const id = this.currentIds.publications++;
    const publication = { ...pub, id };
    this.publications.set(id, publication);
    return publication;
  }

  async getTeachingMaterials(): Promise<Teaching[]> {
    return Array.from(this.teaching.values());
  }

  async addTeachingMaterial(material: InsertTeaching): Promise<Teaching> {
    const id = this.currentIds.teaching++;
    const teachingMaterial = { ...material, id };
    this.teaching.set(id, teachingMaterial);
    return teachingMaterial;
  }

  async getTalks(): Promise<Talk[]> {
    return Array.from(this.talks.values());
  }

  async addTalk(talk: InsertTalk): Promise<Talk> {
    const id = this.currentIds.talks++;
    const newTalk = { ...talk, id };
    this.talks.set(id, newTalk);
    return newTalk;
  }
}

export const storage = new MemStorage();
