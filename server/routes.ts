import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRouteSchema, insertCO2SavingsSchema, insertDemandPredictionSchema, insertRoutePredictionSchema, insertDashboardStatsSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for logistics dashboard
  const apiRouter = app.route("/api");
  
  // Routes for routes data
  app.get("/api/routes", async (req: Request, res: Response) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      
      const route = await storage.getRoute(id);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      res.json(route);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch route" });
    }
  });

  app.post("/api/routes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validatedData);
      res.status(201).json(route);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create route" });
    }
  });

  app.patch("/api/routes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      
      const existingRoute = await storage.getRoute(id);
      if (!existingRoute) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      const validatedData = insertRouteSchema.partial().parse(req.body);
      const updatedRoute = await storage.updateRoute(id, validatedData);
      res.json(updatedRoute);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update route" });
    }
  });

  app.delete("/api/routes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      
      const success = await storage.deleteRoute(id);
      if (!success) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete route" });
    }
  });

  // Routes for CO2 savings data
  app.get("/api/co2-savings", async (req: Request, res: Response) => {
    try {
      const savings = await storage.getCO2Savings();
      res.json(savings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CO2 savings" });
    }
  });

  app.post("/api/co2-savings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCO2SavingsSchema.parse(req.body);
      const saving = await storage.createCO2Saving(validatedData);
      res.status(201).json(saving);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create CO2 saving" });
    }
  });

  // Routes for demand predictions
  app.get("/api/demand-predictions", async (req: Request, res: Response) => {
    try {
      const predictions = await storage.getDemandPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch demand predictions" });
    }
  });

  app.post("/api/demand-predictions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDemandPredictionSchema.parse(req.body);
      const prediction = await storage.createDemandPrediction(validatedData);
      res.status(201).json(prediction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create demand prediction" });
    }
  });

  // Routes for route predictions
  app.get("/api/route-predictions", async (req: Request, res: Response) => {
    try {
      const predictions = await storage.getRoutePredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch route predictions" });
    }
  });

  app.post("/api/route-predictions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoutePredictionSchema.parse(req.body);
      const prediction = await storage.createRoutePrediction(validatedData);
      res.status(201).json(prediction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create route prediction" });
    }
  });

  // Routes for dashboard stats
  app.get("/api/dashboard-stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      if (!stats) {
        return res.status(404).json({ message: "Dashboard stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.post("/api/dashboard-stats", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDashboardStatsSchema.parse(req.body);
      const stats = await storage.createOrUpdateDashboardStats(validatedData);
      res.status(201).json(stats);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create/update dashboard stats" });
    }
  });

  // Route optimization endpoint
  app.post("/api/optimize-route", async (req: Request, res: Response) => {
    try {
      const { routeId, optimizationLevel = 85, co2Priority = "High" } = req.body;
      
      if (!routeId) {
        return res.status(400).json({ message: "Route ID is required" });
      }
      
      const id = parseInt(routeId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      
      const route = await storage.getRoute(id);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      // Simple simulation of route optimization
      const optimizationFactor = optimizationLevel / 100;
      const co2Factor = co2Priority === "High" ? 1.2 : co2Priority === "Medium" ? 1.0 : 0.8;
      
      const optimizedDistance = route.distance * (1 - (optimizationFactor * 0.2));
      const optimizedEfficiency = Math.min(98, route.efficiency + (optimizationFactor * 10));
      const optimizedCO2Saved = route.co2Saved * (1 + (optimizationFactor * co2Factor * 0.3));
      
      const updatedRoute = await storage.updateRoute(id, {
        distance: optimizedDistance,
        efficiency: optimizedEfficiency,
        co2Saved: optimizedCO2Saved,
        optimized: true
      });
      
      res.json({ 
        success: true, 
        route: updatedRoute,
        optimizationDetails: {
          distanceReduction: route.distance - optimizedDistance,
          efficiencyImprovement: optimizedEfficiency - route.efficiency,
          additionalCO2Saved: optimizedCO2Saved - route.co2Saved
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to optimize route" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
