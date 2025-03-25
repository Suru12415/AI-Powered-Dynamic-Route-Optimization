import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (reused from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Logistics routes model
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distance: doublePrecision("distance").notNull(), // in kilometers
  transportType: text("transport_type").notNull(), // air, ground, maritime, multimodal
  efficiency: doublePrecision("efficiency").notNull(), // percentage 
  co2Saved: doublePrecision("co2_saved").notNull(), // metric tons
  status: text("status").notNull(), // active, delayed, planning, completed
  duration: doublePrecision("duration").notNull(), // in hours
  optimized: boolean("optimized").notNull().default(false),
  coordinates: jsonb("coordinates").notNull(), // array of [lat, lng] coordinates
});

// CO2 Savings over time
export const co2Savings = pgTable("co2_savings", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(), // Jan, Feb, etc.
  year: integer("year").notNull(),
  amount: doublePrecision("amount").notNull(), // metric tons saved
  target: doublePrecision("target").notNull(), // target for the month
});

// AI predictions for demand by region
export const demandPredictions = pgTable("demand_predictions", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(), // North America, Europe, etc.
  percentageChange: doublePrecision("percentage_change").notNull(),
  confidence: text("confidence").notNull(), // High, Medium, Low
  predictedAt: timestamp("predicted_at").notNull()
});

// Route predictions
export const routePredictions = pgTable("route_predictions", {
  id: serial("id").primaryKey(),
  route: text("route").notNull(), // e.g. "Shanghai → Los Angeles"
  percentageChange: doublePrecision("percentage_change").notNull(),
  confidence: doublePrecision("confidence").notNull(), // percentage
});

// Dashboard stats
export const dashboardStats = pgTable("dashboard_stats", {
  id: serial("id").primaryKey(),
  co2Savings: doublePrecision("co2_savings").notNull(), // metric tons
  routeEfficiency: doublePrecision("route_efficiency").notNull(), // percentage
  costSavings: doublePrecision("cost_savings").notNull(), // USD in thousands
  activeShipments: integer("active_shipments").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export const insertCO2SavingsSchema = createInsertSchema(co2Savings).omit({
  id: true,
});

export const insertDemandPredictionSchema = createInsertSchema(demandPredictions).omit({
  id: true,
});

export const insertRoutePredictionSchema = createInsertSchema(routePredictions).omit({
  id: true,
});

export const insertDashboardStatsSchema = createInsertSchema(dashboardStats).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

export type InsertCO2Saving = z.infer<typeof insertCO2SavingsSchema>;
export type CO2Saving = typeof co2Savings.$inferSelect;

export type InsertDemandPrediction = z.infer<typeof insertDemandPredictionSchema>;
export type DemandPrediction = typeof demandPredictions.$inferSelect;

export type InsertRoutePrediction = z.infer<typeof insertRoutePredictionSchema>;
export type RoutePrediction = typeof routePredictions.$inferSelect;

export type InsertDashboardStats = z.infer<typeof insertDashboardStatsSchema>;
export type DashboardStats = typeof dashboardStats.$inferSelect;
