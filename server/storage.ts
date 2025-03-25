import {
  users, type User, type InsertUser,
  routes, type Route, type InsertRoute,
  co2Savings, type CO2Saving, type InsertCO2Saving,
  demandPredictions, type DemandPrediction, type InsertDemandPrediction,
  routePredictions, type RoutePrediction, type InsertRoutePrediction,
  dashboardStats, type DashboardStats, type InsertDashboardStats
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Route methods
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;

  // CO2 Savings methods
  getCO2Savings(): Promise<CO2Saving[]>;
  createCO2Saving(saving: InsertCO2Saving): Promise<CO2Saving>;

  // Demand Prediction methods
  getDemandPredictions(): Promise<DemandPrediction[]>;
  createDemandPrediction(prediction: InsertDemandPrediction): Promise<DemandPrediction>;

  // Route Prediction methods
  getRoutePredictions(): Promise<RoutePrediction[]>;
  createRoutePrediction(prediction: InsertRoutePrediction): Promise<RoutePrediction>;

  // Dashboard Stats methods
  getDashboardStats(): Promise<DashboardStats | undefined>;
  createOrUpdateDashboardStats(stats: InsertDashboardStats): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private routes: Map<number, Route>;
  private co2Savings: Map<number, CO2Saving>;
  private demandPredictions: Map<number, DemandPrediction>;
  private routePredictions: Map<number, RoutePrediction>;
  private dashboardStats: DashboardStats | undefined;
  
  private currentUserId: number;
  private currentRouteId: number;
  private currentCO2SavingId: number;
  private currentDemandPredictionId: number;
  private currentRoutePredictionId: number;
  private currentDashboardStatsId: number;

  constructor() {
    this.users = new Map();
    this.routes = new Map();
    this.co2Savings = new Map();
    this.demandPredictions = new Map();
    this.routePredictions = new Map();
    
    this.currentUserId = 1;
    this.currentRouteId = 1;
    this.currentCO2SavingId = 1;
    this.currentDemandPredictionId = 1;
    this.currentRoutePredictionId = 1;
    this.currentDashboardStatsId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Route methods
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.currentRouteId++;
    const route: Route = { ...insertRoute, id };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: number, routeUpdate: Partial<InsertRoute>): Promise<Route | undefined> {
    const existingRoute = this.routes.get(id);
    if (!existingRoute) {
      return undefined;
    }
    
    const updatedRoute: Route = { ...existingRoute, ...routeUpdate };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: number): Promise<boolean> {
    return this.routes.delete(id);
  }

  // CO2 Savings methods
  async getCO2Savings(): Promise<CO2Saving[]> {
    return Array.from(this.co2Savings.values());
  }

  async createCO2Saving(insertSaving: InsertCO2Saving): Promise<CO2Saving> {
    const id = this.currentCO2SavingId++;
    const saving: CO2Saving = { ...insertSaving, id };
    this.co2Savings.set(id, saving);
    return saving;
  }

  // Demand Prediction methods
  async getDemandPredictions(): Promise<DemandPrediction[]> {
    return Array.from(this.demandPredictions.values());
  }

  async createDemandPrediction(insertPrediction: InsertDemandPrediction): Promise<DemandPrediction> {
    const id = this.currentDemandPredictionId++;
    const prediction: DemandPrediction = { ...insertPrediction, id };
    this.demandPredictions.set(id, prediction);
    return prediction;
  }

  // Route Prediction methods
  async getRoutePredictions(): Promise<RoutePrediction[]> {
    return Array.from(this.routePredictions.values());
  }

  async createRoutePrediction(insertPrediction: InsertRoutePrediction): Promise<RoutePrediction> {
    const id = this.currentRoutePredictionId++;
    const prediction: RoutePrediction = { ...insertPrediction, id };
    this.routePredictions.set(id, prediction);
    return prediction;
  }

  // Dashboard Stats methods
  async getDashboardStats(): Promise<DashboardStats | undefined> {
    return this.dashboardStats;
  }

  async createOrUpdateDashboardStats(insertStats: InsertDashboardStats): Promise<DashboardStats> {
    const id = this.dashboardStats ? this.dashboardStats.id : this.currentDashboardStatsId++;
    const stats: DashboardStats = { ...insertStats, id };
    this.dashboardStats = stats;
    return stats;
  }

  // Initialize with sample data for demonstration
  private initializeData() {
    // Initialize sample routes
    const sampleRoutes: InsertRoute[] = [
      {
        name: "Shanghai → Rotterdam",
        origin: "Shanghai",
        destination: "Rotterdam",
        distance: 12380,
        transportType: "Maritime",
        efficiency: 92,
        co2Saved: 4.28,
        status: "Active",
        duration: 336,
        optimized: true,
        coordinates: [
          [121.4737, 31.2304], // Shanghai
          [4.4777, 51.9244] // Rotterdam
        ]
      },
      {
        name: "New York → Los Angeles",
        origin: "New York",
        destination: "Los Angeles",
        distance: 4490,
        transportType: "Ground",
        efficiency: 86,
        co2Saved: 2.15,
        status: "Active",
        duration: 42,
        optimized: true,
        coordinates: [
          [-74.0060, 40.7128], // New York
          [-118.2437, 34.0522] // Los Angeles
        ]
      },
      {
        name: "London → Dubai",
        origin: "London",
        destination: "Dubai",
        distance: 5496,
        transportType: "Air",
        efficiency: 71,
        co2Saved: 3.82,
        status: "Delayed",
        duration: 7,
        optimized: true,
        coordinates: [
          [-0.1276, 51.5072], // London
          [55.2708, 25.2048] // Dubai
        ]
      },
      {
        name: "São Paulo → Mexico City",
        origin: "São Paulo",
        destination: "Mexico City",
        distance: 7380,
        transportType: "Ground/Air",
        efficiency: 65,
        co2Saved: 1.95,
        status: "Planning",
        duration: 18,
        optimized: false,
        coordinates: [
          [-46.6333, -23.5505], // São Paulo
          [-99.1332, 19.4326] // Mexico City
        ]
      }
    ];

    sampleRoutes.forEach(route => this.createRoute(route));

    // Initialize CO2 savings data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = new Date().getFullYear();
    
    const sampleCO2Savings: InsertCO2Saving[] = months.map((month, index) => {
      // Create realistic data for past months and targets for all months
      const isCurrentMonth = index === new Date().getMonth();
      const isFutureMonth = index > new Date().getMonth();
      
      return {
        month,
        year,
        amount: isFutureMonth ? 0 : isCurrentMonth ? 4.2 : [1.2, 1.8, 2.3, 2.9, 3.2, 3.6, 3.8, 4.0, 4.2, 0, 0, 0][index],
        target: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5][index]
      };
    });

    sampleCO2Savings.forEach(saving => this.createCO2Saving(saving));

    // Initialize demand predictions
    const sampleDemandPredictions: InsertDemandPrediction[] = [
      {
        region: "North America",
        percentageChange: 12.8,
        confidence: "High",
        predictedAt: new Date()
      },
      {
        region: "Europe",
        percentageChange: 3.2,
        confidence: "Medium",
        predictedAt: new Date()
      },
      {
        region: "Asia Pacific",
        percentageChange: 18.7,
        confidence: "High",
        predictedAt: new Date()
      },
      {
        region: "Latin America",
        percentageChange: -4.1,
        confidence: "Low",
        predictedAt: new Date()
      }
    ];

    sampleDemandPredictions.forEach(prediction => this.createDemandPrediction(prediction));

    // Initialize route predictions
    const sampleRoutePredictions: InsertRoutePrediction[] = [
      {
        route: "Shanghai → Los Angeles",
        percentageChange: 23,
        confidence: 85
      },
      {
        route: "Hamburg → New York",
        percentageChange: 15,
        confidence: 72
      },
      {
        route: "Singapore → Dubai",
        percentageChange: 8,
        confidence: 58
      }
    ];

    sampleRoutePredictions.forEach(prediction => this.createRoutePrediction(prediction));

    // Initialize dashboard stats
    const sampleDashboardStats: InsertDashboardStats = {
      co2Savings: 32.38,
      routeEfficiency: 78.5,
      costSavings: 127.8,
      activeShipments: 1264,
      updatedAt: new Date()
    };

    this.createOrUpdateDashboardStats(sampleDashboardStats);
  }
}

export const storage = new MemStorage();
