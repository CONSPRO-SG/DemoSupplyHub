import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  consumables: defineTable({
    name: v.string(),
    sku: v.string(),
    unit: v.string(),
    minLevel: v.number(),
    quantity: v.number(),
    location: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_sku", ["sku"]),
  stockMovements: defineTable({
    consumableId: v.id("consumables"),
    type: v.union(v.literal("IN"), v.literal("OUT"), v.literal("ADJUSTMENT")),
    quantity: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_consumable", ["consumableId"])
});
