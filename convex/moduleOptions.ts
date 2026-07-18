import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

type OptionTable =
  | "consumablePlanningOptions"
  | "ppePlanningOptions"
  | "consumableStockOptions";

async function listOptions(ctx: QueryCtx, table: OptionTable) {
  const options = await ctx.db.query(table).order("asc").collect();
  return options.map(({ name }) => name);
}

async function addOption(ctx: MutationCtx, table: OptionTable, name: string) {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new Error("Option name is required.");
  }

  const existingOption = await ctx.db
    .query(table)
    .withIndex("by_name", (q) => q.eq("name", normalizedName))
    .unique();

  if (existingOption) {
    return existingOption._id;
  }

  return ctx.db.insert(table, {
    name: normalizedName,
    createdAt: Date.now(),
  });
}

async function removeOption(ctx: MutationCtx, table: OptionTable, name: string) {
  const normalizedName = name.trim();
  if (!normalizedName) {
    return null;
  }

  const existingOption = await ctx.db
    .query(table)
    .withIndex("by_name", (q) => q.eq("name", normalizedName))
    .unique();

  if (!existingOption) {
    return null;
  }

  await ctx.db.delete(existingOption._id);
  return existingOption._id;
}

export const listConsumablePlanning = query({
  args: {},
  handler: async (ctx) => listOptions(ctx, "consumablePlanningOptions"),
});

export const addConsumablePlanning = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => addOption(ctx, "consumablePlanningOptions", name),
});

export const removeConsumablePlanning = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => removeOption(ctx, "consumablePlanningOptions", name),
});

export const listPpePlanning = query({
  args: {},
  handler: async (ctx) => listOptions(ctx, "ppePlanningOptions"),
});

export const addPpePlanning = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => addOption(ctx, "ppePlanningOptions", name),
});

export const removePpePlanning = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => removeOption(ctx, "ppePlanningOptions", name),
});

export const listConsumableStock = query({
  args: {},
  handler: async (ctx) => listOptions(ctx, "consumableStockOptions"),
});

export const addConsumableStock = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => addOption(ctx, "consumableStockOptions", name),
});

export const removeConsumableStock = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => removeOption(ctx, "consumableStockOptions", name),
});

export const listPlanningItems = query({
  args: {
    module: v.union(
      v.literal("consumablePlanning"),
      v.literal("ppePlanning"),
      v.literal("consumableStock"),
      v.literal("ppeStock"),
    ),
    projectName: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { module, projectName, projectId }) => {
    if (projectId) {
      const items = await ctx.db
        .query("planningItems")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();

      return items.filter((item) => item.module === module);
    }

    const normalizedProjectName = projectName?.trim() ?? "";
    if (!normalizedProjectName) {
      return [];
    }

    return ctx.db
      .query("planningItems")
      .withIndex("by_module_project", (q) =>
        q.eq("module", module).eq("projectName", normalizedProjectName),
      )
      .order("asc")
      .collect();
  },
});

export const addPlanningItem = mutation({
  args: {
    module: v.union(
      v.literal("consumablePlanning"),
      v.literal("ppePlanning"),
      v.literal("consumableStock"),
      v.literal("ppeStock"),
    ),
    projectName: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    departmentId: v.optional(v.id("departments")),
    itemCode: v.string(),
    description: v.string(),
    minimumStockLevel: v.number(),
    currentLevel: v.number(),
    requestedQuantity: v.number(),
    priceExclVat: v.optional(v.number()),
    supplier: v.string(),
    imageData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const projectName = args.projectName?.trim() ?? "";
    const itemCode = args.itemCode.trim();
    const linkedProjectId: Id<"projects"> | undefined = args.projectId;
    let linkedDepartmentId: Id<"departments"> | undefined = args.departmentId;

    if (linkedProjectId) {
      const project = await ctx.db.get(linkedProjectId);
      if (!project || project.archived) {
        throw new Error("An active project is required.");
      }
      linkedDepartmentId = project.departmentId;
    }

    if (!linkedProjectId && !projectName) {
      throw new Error("Project name is required.");
    }

    if (!itemCode) {
      throw new Error("Item code is required.");
    }

    const existingItem = linkedProjectId
      ? (await ctx.db
          .query("planningItems")
          .withIndex("by_project", (q) => q.eq("projectId", linkedProjectId))
          .collect())
          .find((item) => item.module === args.module && item.itemCode === itemCode)
      : await ctx.db
          .query("planningItems")
          .withIndex("by_module_project_item_code", (q) =>
            q.eq("module", args.module).eq("projectName", projectName).eq("itemCode", itemCode),
          )
          .unique();

    if (existingItem) {
      await ctx.db.patch(existingItem._id, {
        description: args.description.trim(),
        minimumStockLevel: args.minimumStockLevel,
        currentLevel: args.currentLevel,
        requestedQuantity: args.requestedQuantity,
        priceExclVat: args.priceExclVat,
        supplier: args.supplier.trim(),
        imageData: args.imageData,
        projectId: linkedProjectId,
        departmentId: linkedDepartmentId,
      });
      return existingItem._id;
    }

    return ctx.db.insert("planningItems", {
      module: args.module,
      projectName,
      projectId: linkedProjectId,
      departmentId: linkedDepartmentId,
      itemCode,
      description: args.description.trim(),
      minimumStockLevel: args.minimumStockLevel,
      currentLevel: args.currentLevel,
      requestedQuantity: args.requestedQuantity,
      priceExclVat: args.priceExclVat,
      supplier: args.supplier.trim(),
      imageData: args.imageData,
      createdAt: Date.now(),
    });
  },
});

export const removePlanningItem = mutation({
  args: { id: v.id("planningItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

export const listPpeClothingItems = query({
  args: {
    projectId: v.optional(v.id("projects")),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, { projectId, departmentId }) => {
    if (projectId) {
      return ctx.db
        .query("ppeClothingItems")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .order("asc")
        .collect();
    }

    if (departmentId) {
      return ctx.db
        .query("ppeClothingItems")
        .withIndex("by_department", (q) => q.eq("departmentId", departmentId))
        .order("asc")
        .collect();
    }

    return ctx.db.query("ppeClothingItems").order("asc").collect();
  },
});

export const addPpeClothingItem = mutation({
  args: {
    projectId: v.id("projects"),
    ppeClothingType: v.string(),
    size: v.string(),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const ppeClothingType = args.ppeClothingType.trim();
    if (!ppeClothingType) {
      throw new Error("PPE Clothing Type is required.");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.archived || !project.departmentId) {
      throw new Error("An active project with a department is required.");
    }

    return ctx.db.insert("ppeClothingItems", {
      projectId: args.projectId,
      departmentId: project.departmentId,
      ppeClothingType,
      size: args.size.trim(),
      quantity: args.quantity,
      price: args.price,
      createdAt: Date.now(),
    });
  },
});

export const removePpeClothingItem = mutation({
  args: { id: v.id("ppeClothingItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});
