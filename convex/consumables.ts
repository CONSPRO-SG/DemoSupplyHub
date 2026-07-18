import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const items = await ctx.db.query("consumables").collect();
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }
});

export const create = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    unit: v.string(),
    minLevel: v.number(),
    quantity: v.number(),
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("consumables")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();

    if (existing) {
      throw new Error("SKU already exists.");
    }

    const now = Date.now();
    const consumableId = await ctx.db.insert("consumables", {
      name: args.name,
      sku: args.sku,
      unit: args.unit,
      minLevel: args.minLevel,
      quantity: args.quantity,
      location: args.location || undefined,
      createdAt: now,
      updatedAt: now
    });

    await ctx.db.insert("stockMovements", {
      consumableId,
      type: "IN",
      quantity: args.quantity,
      note: "Initial stock",
      createdAt: now
    });

    return await ctx.db.get(consumableId);
  }
});

export const recordMovement = mutation({
  args: {
    consumableId: v.id("consumables"),
    type: v.union(v.literal("IN"), v.literal("OUT"), v.literal("ADJUSTMENT")),
    quantity: v.number(),
    note: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const consumable = await ctx.db.get(args.consumableId);
    if (!consumable) {
      throw new Error("Consumable not found.");
    }

    let nextQuantity = consumable.quantity;
    if (args.type === "IN") {
      nextQuantity += args.quantity;
    } else if (args.type === "OUT") {
      nextQuantity -= args.quantity;
    } else {
      nextQuantity = args.quantity;
    }

    if (nextQuantity < 0) {
      throw new Error("Insufficient stock for this movement.");
    }

    await ctx.db.patch(args.consumableId, {
      quantity: nextQuantity,
      updatedAt: Date.now()
    });

    const movementId = await ctx.db.insert("stockMovements", {
      consumableId: args.consumableId,
      type: args.type,
      quantity: args.quantity,
      note: args.note || undefined,
      createdAt: Date.now()
    });

    return {
      consumable: await ctx.db.get(args.consumableId),
      movement: await ctx.db.get(movementId)
    };
  }
});
