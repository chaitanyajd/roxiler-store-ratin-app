import { users, stores, ratings, type User, type InsertUser, type Store, type InsertStore, type Rating, type InsertRating, type StoreWithRating, type UserWithStore, type RatingWithDetails } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(filters?: { name?: string; email?: string; role?: string; address?: string }): Promise<UserWithStore[]>;
  
  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  getStoreByEmail(email: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
  getStores(filters?: { name?: string; address?: string }): Promise<StoreWithRating[]>;
  getStoresByOwner(ownerId: number): Promise<Store[]>;
  
  // Rating operations
  getRating(userId: number, storeId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(userId: number, storeId: number, newRating: number): Promise<Rating | undefined>;
  deleteRating(id: number): Promise<boolean>;
  getRatings(): Promise<RatingWithDetails[]>;
  getRatingsByStore(storeId: number): Promise<RatingWithDetails[]>;
  
  // Statistics
  getTotalUsers(): Promise<number>;
  getTotalStores(): Promise<number>;
  getTotalRatings(): Promise<number>;
  getStoreAverageRating(storeId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getUsers(filters?: { name?: string; email?: string; role?: string; address?: string }): Promise<UserWithStore[]> {
    let query = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      address: users.address,
      role: users.role,
      createdAt: users.createdAt,
      store: {
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        ownerId: stores.ownerId,
        createdAt: stores.createdAt,
      }
    }).from(users).leftJoin(stores, eq(users.id, stores.ownerId));

    if (filters) {
      const conditions = [];
      if (filters.name) conditions.push(ilike(users.name, `%${filters.name}%`));
      if (filters.email) conditions.push(ilike(users.email, `%${filters.email}%`));
      if (filters.role) conditions.push(eq(users.role, filters.role));
      if (filters.address) conditions.push(ilike(users.address, `%${filters.address}%`));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const result = await query.orderBy(asc(users.name));
    return result.map(row => ({
      ...row,
      store: row.store.id ? row.store : undefined
    }));
  }

  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async getStoreByEmail(email: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.email, email));
    return store || undefined;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values(insertStore).returning();
    return store;
  }

  async updateStore(id: number, updateData: Partial<InsertStore>): Promise<Store | undefined> {
    const [store] = await db.update(stores).set(updateData).where(eq(stores.id, id)).returning();
    return store || undefined;
  }

  async deleteStore(id: number): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id));
    return result.rowCount > 0;
  }

  async getStores(filters?: { name?: string; address?: string }): Promise<StoreWithRating[]> {
    let query = db.select({
      id: stores.id,
      name: stores.name,
      email: stores.email,
      address: stores.address,
      ownerId: stores.ownerId,
      createdAt: stores.createdAt,
      averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`.as('averageRating'),
      totalRatings: sql<number>`COUNT(${ratings.id})`.as('totalRatings'),
    }).from(stores).leftJoin(ratings, eq(stores.id, ratings.storeId));

    if (filters) {
      const conditions = [];
      if (filters.name) conditions.push(ilike(stores.name, `%${filters.name}%`));
      if (filters.address) conditions.push(ilike(stores.address, `%${filters.address}%`));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const result = await query.groupBy(stores.id).orderBy(asc(stores.name));
    return result.map(row => ({
      ...row,
      averageRating: Number(row.averageRating) || 0,
      totalRatings: Number(row.totalRatings) || 0,
    }));
  }

  async getStoresByOwner(ownerId: number): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.ownerId, ownerId));
  }

  // Rating operations
  async getRating(userId: number, storeId: number): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(
      and(eq(ratings.userId, userId), eq(ratings.storeId, storeId))
    );
    return rating || undefined;
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(insertRating).returning();
    return rating;
  }

  async updateRating(userId: number, storeId: number, newRating: number): Promise<Rating | undefined> {
    const [rating] = await db.update(ratings)
      .set({ rating: newRating, updatedAt: new Date() })
      .where(and(eq(ratings.userId, userId), eq(ratings.storeId, storeId)))
      .returning();
    return rating || undefined;
  }

  async deleteRating(id: number): Promise<boolean> {
    const result = await db.delete(ratings).where(eq(ratings.id, id));
    return result.rowCount > 0;
  }

  async getRatings(): Promise<RatingWithDetails[]> {
    const result = await db.select({
      id: ratings.id,
      userId: ratings.userId,
      storeId: ratings.storeId,
      rating: ratings.rating,
      createdAt: ratings.createdAt,
      updatedAt: ratings.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
      },
      store: {
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        ownerId: stores.ownerId,
        createdAt: stores.createdAt,
      }
    }).from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .innerJoin(stores, eq(ratings.storeId, stores.id))
      .orderBy(desc(ratings.createdAt));

    return result;
  }

  async getRatingsByStore(storeId: number): Promise<RatingWithDetails[]> {
    const result = await db.select({
      id: ratings.id,
      userId: ratings.userId,
      storeId: ratings.storeId,
      rating: ratings.rating,
      createdAt: ratings.createdAt,
      updatedAt: ratings.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        address: users.address,
        role: users.role,
        createdAt: users.createdAt,
      },
      store: {
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        ownerId: stores.ownerId,
        createdAt: stores.createdAt,
      }
    }).from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .innerJoin(stores, eq(ratings.storeId, stores.id))
      .where(eq(ratings.storeId, storeId))
      .orderBy(desc(ratings.createdAt));

    return result;
  }

  // Statistics
  async getTotalUsers(): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    return Number(result[0].count) || 0;
  }

  async getTotalStores(): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(stores);
    return Number(result[0].count) || 0;
  }

  async getTotalRatings(): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(ratings);
    return Number(result[0].count) || 0;
  }

  async getStoreAverageRating(storeId: number): Promise<number> {
    const result = await db.select({ 
      avg: sql<number>`AVG(${ratings.rating})` 
    }).from(ratings).where(eq(ratings.storeId, storeId));
    return Number(result[0].avg) || 0;
  }
}

export const storage = new DatabaseStorage();
