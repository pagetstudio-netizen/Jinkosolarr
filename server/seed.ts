import { db } from "./db";
import { users, products, tasks, paymentChannels, platformSettings } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function seed() {
  console.log("Seeding database...");

  // Check if admin already exists
  const existingAdmin = await db.select().from(users).where(eq(users.phone, "99935673"));
  
  if (existingAdmin.length === 0) {
    // Create super admin
    const hashedPassword = await bcrypt.hash("pagetstudio", 10);
    await db.insert(users).values({
      fullName: "Super Admin",
      phone: "99935673",
      country: "TG",
      password: hashedPassword,
      referralCode: "ADMIN1",
      balance: "0",
      isAdmin: true,
      isSuperAdmin: true,
      adminPin: "9993",
    });
    console.log("Super admin created: +99935673 / pagetstudio / PIN: 9993");
  }

  // Check if products exist
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
      name: "Lubrifiant ELF Evolution",
      price: 3000,
      dailyEarnings: 400,
      cycleDays: 80,
      totalReturn: 32000,
      sortOrder: 1,
    },
    {
      name: "Huile ELF Sporti TXI",
      price: 7000,
      dailyEarnings: 850,
      cycleDays: 80,
      totalReturn: 68000,
      sortOrder: 2,
    },
    {
      name: "Carburant ELF Performance",
      price: 12000,
      dailyEarnings: 1200,
      cycleDays: 80,
      totalReturn: 96000,
      sortOrder: 3,
    },
    {
      name: "Huile ELF Tranself",
      price: 21000,
      dailyEarnings: 2100,
      cycleDays: 80,
      totalReturn: 144000,
      sortOrder: 4,
    },
    {
      name: "Lubrifiant ELF Solaris",
      price: 25000,
      dailyEarnings: 2600,
      cycleDays: 80,
      totalReturn: 172000,
      sortOrder: 5,
    },
    {
      name: "Huile ELF Competition",
      price: 35000,
      dailyEarnings: 3600,
      cycleDays: 80,
      totalReturn: 192000,
      sortOrder: 6,
    },
    {
      name: "Carburant ELF Premium",
      price: 50000,
      dailyEarnings: 5700,
      cycleDays: 80,
      totalReturn: 240000,
      sortOrder: 7,
    },
    {
      name: "Lubrifiant ELF HTX Racing",
      price: 100000,
      dailyEarnings: 11500,
      cycleDays: 80,
      totalReturn: 288000,
      sortOrder: 8,
    },
    {
      name: "Huile ELF HTX 976+",
      price: 150000,
      dailyEarnings: 19000,
      cycleDays: 80,
      totalReturn: 1520000,
      sortOrder: 9,
    },
  ];

  for (const productData of requiredProducts) {
    const existing = existingProducts.find(p => p.name === productData.name);
    if (!existing) {
      await db.insert(products).values(productData);
      console.log(`Product added: ${productData.name}`);
    } else {
      await db.update(products).set(productData).where(eq(products.id, existing.id));
    }
  }
  console.log("Products synchronized");

  // Check if tasks exist
  const existingTasks = await db.select().from(tasks);
  const requiredTasks = [
    { name: "Parrain Bronze", description: "Invitez 3 personnes a recharger leur compte", requiredInvites: 3, reward: 150, sortOrder: 1 },
    { name: "Parrain Argent", description: "Invitez 5 personnes a recharger leur compte", requiredInvites: 5, reward: 500, sortOrder: 2 },
    { name: "Parrain Or", description: "Invitez 10 personnes a recharger leur compte", requiredInvites: 10, reward: 800, sortOrder: 3 },
    { name: "Parrain Platine", description: "Invitez 25 personnes a recharger leur compte", requiredInvites: 25, reward: 2500, sortOrder: 4 },
    { name: "Parrain Diamant", description: "Invitez 50 personnes a recharger leur compte", requiredInvites: 50, reward: 4000, sortOrder: 5 },
    { name: "Parrain Elite", description: "Invitez 100 personnes a recharger leur compte", requiredInvites: 100, reward: 10000, sortOrder: 6 },
  ];

  for (const taskData of requiredTasks) {
    const existing = existingTasks.find(t => t.name === taskData.name);
    if (!existing) {
      await db.insert(tasks).values(taskData);
      console.log(`Task added: ${taskData.name}`);
    } else {
      // Update existing task to match seed data
      await db.update(tasks).set(taskData).where(eq(tasks.id, existing.id));
    }
  }
  console.log("Tasks synchronized");

  // Check if payment channels exist
  const existingChannels = await db.select().from(paymentChannels);
  if (existingChannels.length === 0) {
    await db.insert(paymentChannels).values([
      { name: "LeekPay", redirectUrl: "https://leekpay.com/pay", isApi: false },
      { name: "FedaPay", redirectUrl: "https://fedapay.com/payment", isApi: false },
    ]);
    console.log("Payment channels seeded");
  }

  // Check if settings exist
  const existingSettings = await db.select().from(platformSettings);
  const requiredSettings = [
    { key: "supportLink", value: "https://t.me/+DOnUcJs7idVmN2E0" },
    { key: "channelLink", value: "https://t.me/+DOnUcJs7idVmN2E0" },
    { key: "groupLink", value: "https://t.me/+DOnUcJs7idVmN2E0" },
    { key: "withdrawalFees", value: "15" },
    { key: "withdrawalStartHour", value: "8" },
    { key: "withdrawalEndHour", value: "17" },
    { key: "level1Commission", value: "27" },
    { key: "level2Commission", value: "2" },
    { key: "level3Commission", value: "1" },
    { key: "soleaspayEnabled", value: "true" },
    { key: "inpayEnabled", value: "true" },
  ];

  for (const settingData of requiredSettings) {
    const existing = existingSettings.find(s => s.key === settingData.key);
    if (!existing) {
      await db.insert(platformSettings).values(settingData);
      console.log(`Setting added: ${settingData.key}`);
    } else {
      await db.update(platformSettings).set({ value: settingData.value }).where(eq(platformSettings.id, existing.id));
    }
  }
  console.log("Settings synchronized");

  console.log("Database seeding complete!");
}
