import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, requireRole, hashPassword, comparePassword, generateToken, type AuthRequest } from "./auth";
import { insertUserSchema, insertStoreSchema, insertRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validationSchema = insertUserSchema.extend({
        name: z.string().min(20).max(60),
        email: z.string().email(),
        password: z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, 'Password must contain at least one uppercase letter and one special character'),
        address: z.string().max(400),
        role: z.enum(['user']).default('user')
      });

      const userData = validationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = generateToken(user);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
    res.json({ user: { ...req.user, password: undefined } });
  });

  app.put('/api/auth/password', authenticate, async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedNewPassword });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User routes
  app.get('/api/users', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const { name, email, role, address, sortBy, sortOrder } = req.query;
      const filters = {
        name: name as string,
        email: email as string,
        role: role as string,
        address: address as string
      };
      
      const users = await storage.getUsers(filters, sortBy as string, sortOrder as string);
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const validationSchema = insertUserSchema.extend({
        name: z.string().min(20).max(60),
        email: z.string().email(),
        password: z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, 'Password must contain at least one uppercase letter and one special character'),
        address: z.string().max(400),
        role: z.enum(['admin', 'user', 'store'])
      });

      const userData = validationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      res.json({ ...user, password: undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only update their own profile, admins can update anyone
      if (req.user?.role !== 'admin' && req.user?.id !== userId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const { password, ...otherData } = req.body;
      let updateData = otherData;

      if (password) {
        const validationSchema = z.object({
          password: z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, 'Password must contain at least one uppercase letter and one special character')
        });
        validationSchema.parse({ password });
        updateData.password = await hashPassword(password);
      }

      const user = await storage.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Store routes
  app.get('/api/stores', authenticate, async (req: AuthRequest, res) => {
    try {
      const { name, address } = req.query;
      const filters = {
        name: name as string,
        address: address as string
      };
      
      const stores = await storage.getStores(filters);
      
      // If user is a regular user, add their rating for each store
      if (req.user?.role === 'user') {
        const storesWithUserRating = await Promise.all(
          stores.map(async (store) => {
            const userRating = await storage.getRating(req.user!.id, store.id);
            return {
              ...store,
              userRating: userRating?.rating
            };
          })
        );
        return res.json(storesWithUserRating);
      }

      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stores' });
    }
  });

  app.post('/api/stores', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const validationSchema = insertStoreSchema.extend({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        address: z.string().max(400),
        ownerId: z.number().optional()
      });

      const storeData = validationSchema.parse(req.body);
      
      // Check if store already exists
      const existingStore = await storage.getStoreByEmail(storeData.email);
      if (existingStore) {
        return res.status(409).json({ message: 'Store already exists' });
      }

      const store = await storage.createStore(storeData);
      res.json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create store' });
    }
  });

  app.put('/api/stores/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const store = await storage.updateStore(storeId, req.body);
      
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      res.json(store);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update store' });
    }
  });

  app.delete('/api/stores/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const deleted = await storage.deleteStore(storeId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Store not found' });
      }

      res.json({ message: 'Store deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete store' });
    }
  });

  // Rating routes
  app.get('/api/ratings', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const ratings = await storage.getRatings();
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ratings' });
    }
  });

  app.get('/api/stores/:storeId/ratings', authenticate, async (req: AuthRequest, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      // Store owners can only see their own store ratings
      if (req.user?.role === 'store') {
        const store = await storage.getStore(storeId);
        if (!store || store.ownerId !== req.user.id) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      const ratings = await storage.getRatingsByStore(storeId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch store ratings' });
    }
  });

  app.post('/api/ratings', authenticate, requireRole('user'), async (req: AuthRequest, res) => {
    try {
      const validationSchema = insertRatingSchema.extend({
        storeId: z.number(),
        rating: z.number().min(1).max(5)
      });

      const ratingData = validationSchema.parse(req.body);
      
      // Check if user already rated this store
      const existingRating = await storage.getRating(req.user!.id, ratingData.storeId);
      if (existingRating) {
        return res.status(409).json({ message: 'You have already rated this store' });
      }

      const rating = await storage.createRating({
        ...ratingData,
        userId: req.user!.id
      });

      res.json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create rating' });
    }
  });

  app.put('/api/ratings/:storeId', authenticate, requireRole('user'), async (req: AuthRequest, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      const updatedRating = await storage.updateRating(req.user!.id, storeId, rating);
      if (!updatedRating) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      res.json(updatedRating);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update rating' });
    }
  });

  app.delete('/api/ratings/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const ratingId = parseInt(req.params.id);
      const deleted = await storage.deleteRating(ratingId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete rating' });
    }
  });

  // Statistics routes
  app.get('/api/stats', authenticate, requireRole('admin'), async (req, res) => {
    try {
      const [totalUsers, totalStores, totalRatings] = await Promise.all([
        storage.getTotalUsers(),
        storage.getTotalStores(),
        storage.getTotalRatings()
      ]);

      res.json({
        totalUsers,
        totalStores,
        totalRatings
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Store owner dashboard
  app.get('/api/store-dashboard', authenticate, requireRole('store'), async (req: AuthRequest, res) => {
    try {
      const userStores = await storage.getStoresByOwner(req.user!.id);
      
      if (userStores.length === 0) {
        return res.status(404).json({ message: 'No store found for this user' });
      }

      const store = userStores[0]; // Assuming one store per owner
      const ratings = await storage.getRatingsByStore(store.id);
      const averageRating = await storage.getStoreAverageRating(store.id);

      res.json({
        store,
        ratings,
        averageRating,
        totalRatings: ratings.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch store dashboard' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
