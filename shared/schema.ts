import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  journal: text("journal").notNull(),
  year: text("year").notNull(),
  link: text("link"),
  abstract: text("abstract")
});

export const teaching = pgTable("teaching", {
  id: serial("id").primaryKey(),
  course: text("course").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull()
});

export const talks = pgTable("talks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  date: timestamp("date").notNull(),
  description: text("description")
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertPublicationSchema = createInsertSchema(publications).omit({ id: true });
export const insertTeachingSchema = createInsertSchema(teaching).omit({ id: true });
export const insertTalkSchema = createInsertSchema(talks).omit({ id: true });

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Publication = typeof publications.$inferSelect;
export type InsertPublication = z.infer<typeof insertPublicationSchema>;

export type Teaching = typeof teaching.$inferSelect;
export type InsertTeaching = z.infer<typeof insertTeachingSchema>;

export type Talk = typeof talks.$inferSelect;
export type InsertTalk = z.infer<typeof insertTalkSchema>;