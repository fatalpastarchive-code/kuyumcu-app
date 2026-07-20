import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Kullanıcı rolleri
export const UserRole = {
  OWNER: "owner",
  MANAGER: "manager", 
  STAFF: "staff",
} as const;

// İşlem tipleri
export const TransactionType = {
  DEBT: "debt",
  PAYMENT: "payment",
} as const;

// Metal tipleri
export const MetalType = {
  TL: "TL",
  GRAM_22K: "gram_22k",
  GRAM_24K: "gram_24k",
  QUARTER: "quarter",
} as const;

export default defineSchema({
  // Dükkanlar tablosu
  shops: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    smsTemplate: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  // Kullanıcılar tablosu
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.string(), // "owner", "staff", "pending"
    shopId: v.optional(v.id("shops")),
    status: v.optional(v.string()), // "active", "pending"
    createdAt: v.number(),
  }).index("by_clerk", ["clerkId"]),


  // Müşteriler tablosu
  customers: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    phone: v.string(),
    profileImage: v.optional(v.string()), // Profil fotoğrafı URL'si
    createdAt: v.number(),
  }).index("by_shop", ["shopId"])
   .index("by_phone", ["shopId", "phone"]),

  // İşlemler tablosu
  transactions: defineTable({
    shopId: v.id("shops"),
    customerId: v.id("customers"),
    type: v.string(), // "debt", "payment"
    metalType: v.string(), // "TL", "gram_22k", "gram_24k", "quarter", "USD", "EUR"
    amount: v.number(),
    tlEquivalent: v.optional(v.number()),
    note: v.optional(v.string()),
    dueDate: v.optional(v.number()), // Vade tarihi (timestamp)
    createdBy: v.id("users"),
    isNotified: v.boolean(), // Bildirim gönderildi mi?
    isCompleted: v.optional(v.boolean()), // Borç kapatıldı/tahsil edildi mi?
    createdAt: v.number(),
  }).index("by_shop", ["shopId"])
   .index("by_customer", ["customerId"])
   .index("by_due_date", ["dueDate"])
   .index("by_shop_due_date", ["shopId", "dueDate"]),

  // Ödemeler tablosu (kuyum'dan transfer edildi)
  payments: defineTable({
    transactionId: v.id("transactions"),
    amount: v.number(),
    paidAt: v.number(),
    note: v.optional(v.string()),
  }),

  // Bildirim ayarları tablosu (kuyum'dan transfer edildi)
  notificationSettings: defineTable({
    reminderDaysBefore: v.number(),
    overdueRepeatIntervalDays: v.number(),
  }),

  // Birimler tablosu (kuyum'dan transfer edildi)
  units: defineTable({
    code: v.string(),
    label: v.string(),
    icon: v.string(),
  }),

  // Ayarlar tablosu (kuyum'dan transfer edildi)
  settings: defineTable({
    pin: v.string(),
    displayName: v.string(),
    currencyCardPreferences: v.array(v.string()),
  }),
});
