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
    }
  }
  console.log("Products check complete (existing values preserved)");

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
      console.log(`Setting preserved: ${settingData.key} = ${existing.value}`);
    }
  }
  console.log("Settings check complete (existing values preserved)");

  console.log("Database seeding complete!");
}
