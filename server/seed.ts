import { db } from "./db";
import { users, products, tasks, platformSettings } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";

export async function seed() {
  console.log("Seeding database...");

  // Create session table for connect-pg-simple (if not exists)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
  `);

  // Check if admin already exists
  const existingAdmin = await db.select().from(users).where(eq(users.phone, "99935673"));
  
  if (existingAdmin.length === 0) {
    // Create super admin
    const hashedPassword = await bcrypt.hash("pagetstudio", 10);
    await db.insert(users).values({
      fullName: "Super Admin",
      phone: "99935673",
      country: "BJ",
      password: hashedPassword,
      referralCode: "ADMIN1",
      balance: "0",
      isAdmin: true,
      isSuperAdmin: true,
      adminPin: "9993",
    });
    console.log("Super admin created: +99935673 / pagetstudio / PIN: 9993");
  }

  // Check if products exist - update all products to match VIP structure
  const existingProducts = await db.select().from(products);
  const requiredProducts = [
    {
      name: "Bonus Gratuit",
      price: 0,
      dailyEarnings: 50,
      cycleDays: 1,
      totalReturn: 50,
      isFree: true,
      sortOrder: 0,
    },
    {
      name: "VIP 1",
      price: 3500,
      dailyEarnings: 600,
      cycleDays: 110,
      totalReturn: 66000,
      sortOrder: 1,
    },
    {
      name: "VIP 2",
      price: 7000,
      dailyEarnings: 900,
      cycleDays: 110,
      totalReturn: 99000,
      sortOrder: 2,
    },
    {
      name: "VIP 3",
      price: 15000,
      dailyEarnings: 1750,
      cycleDays: 110,
      totalReturn: 192500,
      sortOrder: 3,
    },
    {
      name: "VIP 4",
      price: 20000,
      dailyEarnings: 2300,
      cycleDays: 110,
      totalReturn: 253000,
      sortOrder: 4,
    },
    {
      name: "VIP 5",
      price: 35000,
      dailyEarnings: 3700,
      cycleDays: 110,
      totalReturn: 407000,
      sortOrder: 5,
    },
    {
      name: "VIP 6",
      price: 50000,
      dailyEarnings: 6700,
      cycleDays: 110,
      totalReturn: 737000,
      sortOrder: 6,
    },
    {
      name: "VIP 7",
      price: 75000,
      dailyEarnings: 8500,
      cycleDays: 110,
      totalReturn: 935000,
      sortOrder: 7,
    },
    {
      name: "VIP 8",
      price: 100000,
      dailyEarnings: 10800,
      cycleDays: 110,
      totalReturn: 1188000,
      sortOrder: 8,
    },
    {
      name: "VIP 9",
      price: 200000,
      dailyEarnings: 15200,
      cycleDays: 110,
      totalReturn: 1672000,
      sortOrder: 9,
    },
  ];

  // Update existing products by matching price, or insert new ones
  // Hide old products that don't match any new product by setting them inactive
  const usedIds = new Set<number>();

  for (const productData of requiredProducts) {
    let existing = existingProducts.find(p => p.name === productData.name);
    if (!existing) {
      existing = existingProducts.find(p => p.price === productData.price && !usedIds.has(p.id));
    }
    if (existing) {
      usedIds.add(existing.id);
      await db.update(products).set({
        name: productData.name,
        price: productData.price,
        dailyEarnings: productData.dailyEarnings,
        cycleDays: productData.cycleDays,
        totalReturn: productData.totalReturn,
        sortOrder: productData.sortOrder,
        isFree: productData.isFree || false,
        isActive: true,
      }).where(eq(products.id, existing.id));
      console.log(`Product updated: ${productData.name}`);
    } else {
      await db.insert(products).values(productData);
      console.log(`Product added: ${productData.name}`);
    }
  }

  // Deactivate old products not in the new list
  for (const existing of existingProducts) {
    if (!usedIds.has(existing.id)) {
      await db.update(products).set({ isActive: false, sortOrder: 99 }).where(eq(products.id, existing.id));
      console.log(`Product deactivated: ${existing.name}`);
    }
  }
  console.log("Products updated to VIP structure");

  // Check if tasks exist
  const existingTasks = await db.select().from(tasks);
  const requiredTasks = [
    { name: "Parrain Bronze", description: "Inviter 3 personnes a investir", requiredInvites: 3, reward: 350, sortOrder: 1 },
    { name: "Parrain Argent", description: "Inviter 5 personnes a investir", requiredInvites: 5, reward: 750, sortOrder: 2 },
    { name: "Parrain Or", description: "Inviter 10 personnes a investir", requiredInvites: 10, reward: 2500, sortOrder: 3 },
    { name: "Parrain Platine", description: "Inviter 30 personnes a investir", requiredInvites: 30, reward: 6500, sortOrder: 4 },
    { name: "Parrain Diamant", description: "Inviter 100 personnes a investir", requiredInvites: 100, reward: 15000, sortOrder: 5 },
    { name: "Parrain Elite", description: "Inviter 300 personnes a investir", requiredInvites: 300, reward: 50000, sortOrder: 6 },
  ];

  for (const taskData of requiredTasks) {
    const existing = existingTasks.find(t => t.name === taskData.name);
    if (!existing) {
      await db.insert(tasks).values(taskData);
      console.log(`Task added: ${taskData.name}`);
    } else {
      if (existing.reward !== taskData.reward || existing.requiredInvites !== taskData.requiredInvites || existing.description !== taskData.description) {
        await db.update(tasks).set({
          reward: taskData.reward,
          requiredInvites: taskData.requiredInvites,
          description: taskData.description,
          sortOrder: taskData.sortOrder,
        }).where(eq(tasks.id, existing.id));
        console.log(`Task updated: ${taskData.name}`);
      }
    }
  }
  console.log("Tasks check complete (existing values preserved)");


  // Check if settings exist
  const existingSettings = await db.select().from(platformSettings);
  const requiredSettings = [
    { key: "supportLink", value: "https://t.me/wendysappgroup" },
    { key: "support2Link", value: "https://t.me/wendysappgroup" },
    { key: "channelLink", value: "https://t.me/wendysappgroup" },
    { key: "groupLink", value: "https://t.me/wendysappgroup" },
    { key: "minDeposit", value: "3500" },
    { key: "withdrawalFees", value: "17" },
    { key: "withdrawalStartHour", value: "8" },
    { key: "withdrawalEndHour", value: "17" },
    { key: "level1Commission", value: "27" },
    { key: "level2Commission", value: "2" },
    { key: "level3Commission", value: "1" },
    { key: "soleaspayEnabled", value: "false" },
    { key: "soleaspayCountries", value: "" },
    { key: "soleaspayChannelName", value: "Westpay" },
    { key: "ashtechpayEnabled", value: "false" },
    { key: "ashtechpayApiKey", value: "" },
    { key: "ashtechpayChannelName", value: "AshtechPay" },
  ];

  for (const settingData of requiredSettings) {
    const existing = existingSettings.find(s => s.key === settingData.key);
    if (!existing) {
      await db.insert(platformSettings).values(settingData);
      console.log(`Setting added: ${settingData.key}`);
    } else {
      console.log(`Setting preserved: ${settingData.key} = ${existing.value}`);
    }
  }
  console.log("Settings check complete (existing values preserved)");

  console.log("Database seeding complete!");
}
