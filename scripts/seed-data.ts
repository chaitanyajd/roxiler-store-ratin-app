import { db } from "../server/db";
import { users, stores, ratings } from "../shared/schema";
import { hashPassword } from "../server/auth";

async function seedData() {
  try {
    console.log("Seeding database with test data...");

    // Create admin user
    const adminPassword = await hashPassword("Admin123!");
    const [admin] = await db.insert(users).values({
      name: "System Administrator Account",
      email: "admin@storerating.com",
      password: adminPassword,
      address: "123 Admin Street, Admin City, AC 12345",
      role: "admin"
    }).returning();

    // Create normal user
    const userPassword = await hashPassword("User123!");
    const [normalUser] = await db.insert(users).values({
      name: "John Doe Regular User Account",
      email: "user@storerating.com", 
      password: userPassword,
      address: "456 User Avenue, User City, UC 67890",
      role: "user"
    }).returning();

    // Create store owner
    const storePassword = await hashPassword("Store123!");
    const [storeOwner] = await db.insert(users).values({
      name: "Jane Smith Store Owner Account",
      email: "store@storerating.com",
      password: storePassword,
      address: "789 Store Boulevard, Store City, SC 11111",
      role: "store"
    }).returning();

    // Create stores
    const [store1] = await db.insert(stores).values({
      name: "Amazing Electronics Store",
      email: "contact@amazingelectronics.com",
      address: "100 Tech Street, Electronics District, ED 22222",
      ownerId: storeOwner.id
    }).returning();

    const [store2] = await db.insert(stores).values({
      name: "Fresh Grocery Market",
      email: "info@freshgrocery.com",
      address: "200 Fresh Lane, Grocery Town, GT 33333",
      ownerId: null
    }).returning();

    const [store3] = await db.insert(stores).values({
      name: "Fashion Boutique Central",
      email: "hello@fashionboutique.com",
      address: "300 Style Avenue, Fashion City, FC 44444",
      ownerId: null
    }).returning();

    // Create sample ratings
    await db.insert(ratings).values([
      {
        userId: normalUser.id,
        storeId: store1.id,
        rating: 5
      },
      {
        userId: normalUser.id,
        storeId: store2.id,
        rating: 4
      },
      {
        userId: normalUser.id,
        storeId: store3.id,
        rating: 3
      }
    ]);

    console.log("✓ Database seeded successfully!");
    console.log("\nTest Accounts Created:");
    console.log("========================");
    console.log("Admin Account:");
    console.log("  Email: admin@storerating.com");
    console.log("  Password: Admin123!");
    console.log("");
    console.log("Normal User Account:");
    console.log("  Email: user@storerating.com");
    console.log("  Password: User123!");
    console.log("");
    console.log("Store Owner Account:");
    console.log("  Email: store@storerating.com");
    console.log("  Password: Store123!");
    console.log("");
    console.log("3 stores and 3 ratings have been created for testing.");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedData().then(() => process.exit(0));