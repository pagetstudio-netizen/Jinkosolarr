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
    });
    console.log("Super admin created: +99935673 / pagetstudio");
  }

  // Check if products exist
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values([
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
        name: "Robot FANUC CR-7",
        price: 3000,
        dailyEarnings: 100,
        cycleDays: 80,
        totalReturn: 8000,
        sortOrder: 1,
      },
      {
        name: "Robot FANUC CR-15",
        price: 6000,
        dailyEarnings: 200,
        cycleDays: 80,
        totalReturn: 16000,
        sortOrder: 2,
      },
      {
        name: "Robot FANUC M-20",
        price: 15000,
        dailyEarnings: 500,
        cycleDays: 80,
        totalReturn: 40000,
        sortOrder: 3,
      },
      {
        name: "Robot FANUC M-710",
        price: 30000,
        dailyEarnings: 1000,
        cycleDays: 80,
        totalReturn: 80000,
        sortOrder: 4,
      },
      {
        name: "Robot FANUC R-2000",
        price: 50000,
        dailyEarnings: 1700,
        cycleDays: 80,
        totalReturn: 136000,
        sortOrder: 5,
      },
      {
        name: "Robot FANUC LR Mate",
        price: 100000,
        dailyEarnings: 3500,
        cycleDays: 80,
        totalReturn: 280000,
        sortOrder: 6,
      },
    ]);
    console.log("Products seeded");
  }

  // Check if tasks exist
  const existingTasks = await db.select().from(tasks);
  if (existingTasks.length === 0) {
    await db.insert(tasks).values([
      { name: "Parrain Debutant", description: "Invitez 1 personne qui investit", requiredInvites: 1, reward: 500, sortOrder: 1 },
      { name: "Parrain Actif", description: "Invitez 3 personnes qui investissent", requiredInvites: 3, reward: 1500, sortOrder: 2 },
      { name: "Leader Equipe", description: "Invitez 5 personnes qui investissent", requiredInvites: 5, reward: 3000, sortOrder: 3 },
      { name: "Manager", description: "Invitez 10 personnes qui investissent", requiredInvites: 10, reward: 7000, sortOrder: 4 },
      { name: "Directeur", description: "Invitez 20 personnes qui investissent", requiredInvites: 20, reward: 15000, sortOrder: 5 },
      { name: "Super Parrain", description: "Invitez 50 personnes qui investissent", requiredInvites: 50, reward: 40000, sortOrder: 6 },
    ]);
    console.log("Tasks seeded");
  }

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
  if (existingSettings.length === 0) {
    await db.insert(platformSettings).values([
      { key: "supportLink", value: "https://t.me/+DOnUcJs7idVmN2E0" },
      { key: "channelLink", value: "https://t.me/+DOnUcJs7idVmN2E0" },
      { key: "groupLink", value: "https://t.me/+DOnUcJs7idVmN2E0" },
      { key: "withdrawalFees", value: "15" },
      { key: "withdrawalStartHour", value: "8" },
      { key: "withdrawalEndHour", value: "17" },
      { key: "level1Commission", value: "27" },
      { key: "level2Commission", value: "2" },
      { key: "level3Commission", value: "1" },
    ]);
    console.log("Settings seeded");
  }

  console.log("Database seeding complete!");
}
