import { pgTable, text, serial, integer, boolean, jsonb, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  pageType: text("page_type").notNull(), // "home", "agriculture", "fishing", "paa"
  sectionType: text("section_type").notNull(), // "hero", "info", "statistics", etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const charts = pgTable("charts", {
  id: serial("id").primaryKey(),
  pageType: text("page_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  chartType: text("chart_type").notNull(), // "bar", "line", "pie", etc.
  chartData: jsonb("chart_data").notNull(),
  active: boolean("active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  pageType: text("page_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  mediaType: text("media_type").notNull(), // "image", "video"
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  active: boolean("active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  trend: text("trend"),
  trendValue: text("trend_value"),
  isPositive: boolean("is_positive").default(true),
  order: integer("order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChartSchema = createInsertSchema(charts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
  createdAt: true,
});

export const insertStatisticSchema = createInsertSchema(statistics).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Chart = typeof charts.$inferSelect;
export type InsertChart = z.infer<typeof insertChartSchema>;

export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = z.infer<typeof insertStatisticSchema>;
