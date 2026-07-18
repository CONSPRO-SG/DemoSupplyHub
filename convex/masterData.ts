import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const planningTypeValidator = v.union(v.literal("consumable"), v.literal("ppe"));
const ppeCategoryValidator = v.union(v.literal("clothing"), v.literal("general"));

function getDepartmentIds(project: {
  departmentId?: Id<"departments">;
  departmentIds?: Id<"departments">[];
}) {
  return project.departmentIds?.length ? project.departmentIds : project.departmentId ? [project.departmentId] : [];
}

function calculateInventoryValues(values: {
  itemCode: string;
  itemName?: string;
  quantity?: number;
  unit?: string;
  minimumStockLevel: number;
  currentLevel: number;
  requestedQuantity: number;
  stockOnHand?: number;
  requiredQuantity?: number;
}) {
  const stockOnHand = values.stockOnHand ?? values.currentLevel;
  const requiredQuantity = values.requiredQuantity ?? Math.max(values.minimumStockLevel, values.requestedQuantity);

  return {
    itemName: (values.itemName ?? values.itemCode).trim(),
    quantity: values.quantity ?? values.requestedQuantity,
    unit: values.unit?.trim() ?? "",
    stockOnHand,
    requiredQuantity,
    shortageSurplus: stockOnHand - requiredQuantity,
  };
}

export const listDepartments = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { includeArchived }) => {
    const departments = await ctx.db.query("departments").order("asc").collect();
    return includeArchived ? departments : departments.filter((department) => !department.archived);
  },
});

export const createDepartment = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error("Department name is required.");
    }

    return ctx.db.insert("departments", {
      name: normalizedName,
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateDepartment = mutation({
  args: {
    id: v.id("departments"),
    name: v.string(),
  },
  handler: async (ctx, { id, name }) => {
    await ctx.db.patch(id, {
      name: name.trim(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const archiveDepartment = mutation({
  args: {
    id: v.id("departments"),
    archived: v.boolean(),
  },
  handler: async (ctx, { id, archived }) => {
    await ctx.db.patch(id, {
      archived,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteDepartment = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, { id }) => {
    const linkedProject = await ctx.db
      .query("projects")
      .withIndex("by_department", (q) => q.eq("departmentId", id))
      .first();

    if (linkedProject) {
      throw new Error("Department cannot be deleted while projects are assigned to it.");
    }

    await ctx.db.delete(id);
    return id;
  },
});

export const listProjects = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { includeArchived }) => {
    const departments = await ctx.db.query("departments").collect();
    const departmentLookup = new Map(departments.map((department) => [department._id, department]));

    const projects = await ctx.db.query("projects").order("asc").collect();

    return projects
      .filter((project) => includeArchived || !project.archived)
      .map((project) => ({
      ...project,
      departmentIds: getDepartmentIds(project),
      department: project.departmentId ? departmentLookup.get(project.departmentId) ?? null : null,
      }));
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    departmentId: v.id("departments"),
  },
  handler: async (ctx, { name, departmentId }) => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error("Project name is required.");
    }

    const department = await ctx.db.get(departmentId);
    if (!department || department.archived) {
      throw new Error("An active department is required before saving a project.");
    }

    return ctx.db.insert("projects", {
      name: normalizedName,
      departmentId,
      departmentIds: [departmentId],
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
    departmentId: v.id("departments"),
  },
  handler: async (ctx, { id, name, departmentId }) => {
    const department = await ctx.db.get(departmentId);
    if (!department || department.archived) {
      throw new Error("An active department is required before saving a project.");
    }

    await ctx.db.patch(id, {
      name: name.trim(),
      departmentId,
      departmentIds: [departmentId],
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const archiveProject = mutation({
  args: {
    id: v.id("projects"),
    archived: v.boolean(),
  },
  handler: async (ctx, { id, archived }) => {
    await ctx.db.patch(id, {
      archived,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const requirements = await ctx.db
      .query("projectRequirementItems")
      .withIndex("by_project_planning_type", (q) => q.eq("projectId", id))
      .collect();
    const planningItems = await ctx.db
      .query("planningItems")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();

    for (const requirement of requirements) {
      await ctx.db.delete(requirement._id);
    }
    for (const planningItem of planningItems) {
      await ctx.db.delete(planningItem._id);
    }

    await ctx.db.delete(id);
    return id;
  },
});

export const listProjectRequirementItems = query({
  args: {
    projectId: v.id("projects"),
    planningType: planningTypeValidator,
    ppeCategory: v.optional(ppeCategoryValidator),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, planningType, ppeCategory, includeArchived }) => {
    const items = await ctx.db
      .query("projectRequirementItems")
      .withIndex("by_project_planning_type", (q) =>
        q.eq("projectId", projectId).eq("planningType", planningType),
      )
      .collect();

    return items.filter((item) => {
      const isActive = includeArchived || !item.archived;
      const matchesPpeCategory =
        planningType !== "ppe" || !ppeCategory || item.ppeCategory === ppeCategory;
      return isActive && matchesPpeCategory;
    });
  },
});

export const listDashboardFilterOptions = query({
  args: {},
  handler: async (ctx) => {
    const [departments, projects, requirements] = await Promise.all([
      ctx.db.query("departments").order("asc").collect(),
      ctx.db.query("projects").order("asc").collect(),
      ctx.db.query("projectRequirementItems").order("asc").collect(),
    ]);

    const activeDepartments = departments.filter((department) => !department.archived);
    const activeProjects = projects.filter((project) => !project.archived);
    const activeProjectIds = new Set(activeProjects.map((project) => project._id));
    const activeRequirements = requirements.filter((item) => !item.archived && activeProjectIds.has(item.projectId));

    return {
      projects: activeProjects.map((project) => ({
        id: project._id,
        name: project.name,
        departmentIds: getDepartmentIds(project),
      })),
      departments: activeDepartments.map((department) => ({
        id: department._id,
        name: department.name,
      })),
      inventory: activeRequirements.map((item) => ({
        id: item._id,
        itemName: calculateInventoryValues(item).itemName,
      })),
    };
  },
});

export const createProjectRequirementItem = mutation({
  args: {
    projectId: v.id("projects"),
    planningType: planningTypeValidator,
    ppeCategory: v.optional(ppeCategoryValidator),
    itemCode: v.string(),
    itemName: v.optional(v.string()),
    description: v.string(),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    minimumStockLevel: v.number(),
    currentLevel: v.number(),
    requestedQuantity: v.number(),
    stockOnHand: v.optional(v.number()),
    requiredQuantity: v.optional(v.number()),
    priceExclVat: v.optional(v.number()),
    spExclVat: v.optional(v.number()),
    supplier: v.string(),
    imageData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const itemCode = args.itemCode.trim();
    if (!itemCode) {
      throw new Error("Item code is required.");
    }
    if (args.planningType === "ppe" && !args.ppeCategory) {
      throw new Error("PPE category is required.");
    }

    return ctx.db.insert("projectRequirementItems", {
      ...args,
      ppeCategory: args.planningType === "ppe" ? args.ppeCategory : undefined,
      ...calculateInventoryValues({ ...args, itemCode }),
      itemCode,
      description: args.description.trim(),
      supplier: args.supplier.trim(),
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateProjectRequirementItem = mutation({
  args: {
    id: v.id("projectRequirementItems"),
    ppeCategory: v.optional(ppeCategoryValidator),
    itemCode: v.string(),
    itemName: v.optional(v.string()),
    description: v.string(),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    minimumStockLevel: v.number(),
    currentLevel: v.number(),
    requestedQuantity: v.number(),
    stockOnHand: v.optional(v.number()),
    requiredQuantity: v.optional(v.number()),
    priceExclVat: v.optional(v.number()),
    spExclVat: v.optional(v.number()),
    supplier: v.string(),
    imageData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const itemCode = rest.itemCode.trim();
    const existing = await ctx.db.get(id);
    await ctx.db.patch(id, {
      ...rest,
      ppeCategory: existing?.planningType === "ppe" ? rest.ppeCategory ?? existing.ppeCategory : undefined,
      ...calculateInventoryValues({ ...rest, itemCode }),
      itemCode,
      description: rest.description.trim(),
      supplier: rest.supplier.trim(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const archiveProjectRequirementItem = mutation({
  args: {
    id: v.id("projectRequirementItems"),
    archived: v.boolean(),
  },
  handler: async (ctx, { id, archived }) => {
    await ctx.db.patch(id, {
      archived,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteProjectRequirementItem = mutation({
  args: { id: v.id("projectRequirementItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

export const listDashboardSnapshot = query({
  args: {
    projectId: v.optional(v.id("projects")),
    departmentId: v.optional(v.id("departments")),
    inventoryId: v.optional(v.id("projectRequirementItems")),
    includeAll: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, departmentId, inventoryId, includeAll }) => {
    if (!projectId && !departmentId && !inventoryId && !includeAll) {
      return {
        projects: [],
        departments: [],
        inventory: [],
        inventoryOptions: [],
      };
    }

    const [departments, projects] = await Promise.all([
      ctx.db.query("departments").order("asc").collect(),
      ctx.db.query("projects").order("asc").collect(),
    ]);

    const activeDepartments = departments.filter((department) => !department.archived);
    const departmentLookup = new Map(activeDepartments.map((department) => [department._id, department]));
    const activeProjects = projects.filter((project) => !project.archived);
    const selectedRequirement = inventoryId ? await ctx.db.get(inventoryId) : null;
    const selectedInventoryProjectId = selectedRequirement && !selectedRequirement.archived
      ? selectedRequirement.projectId
      : undefined;

    const selectedProjects = activeProjects.filter((project) => {
      const departmentIds = getDepartmentIds(project);
      const matchesProject = includeAll
        ? true
        : projectId
        ? project._id === projectId
        : selectedInventoryProjectId
          ? project._id === selectedInventoryProjectId
          : true;
      const matchesDepartment = departmentId ? departmentIds.includes(departmentId) : true;
      return matchesProject && matchesDepartment;
    });

    const [requirementGroups, clothingGroups] = await Promise.all([
      Promise.all(
      selectedProjects.map((project) =>
        ctx.db
          .query("projectRequirementItems")
          .withIndex("by_project_planning_type", (q) => q.eq("projectId", project._id))
          .collect(),
      ),
      ),
      Promise.all(
        selectedProjects.map((project) =>
          ctx.db
            .query("ppeClothingItems")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect(),
        ),
      ),
    ]);

    const requirements = [
      ...requirementGroups.flat(),
      ...(selectedRequirement ? [selectedRequirement] : []),
    ];
    const activeRequirements = requirements.filter((item) => !item.archived);

    const linkedInventory = activeRequirements.map((item) => {
      const project = activeProjects.find((candidate) => candidate._id === item.projectId) ?? null;
      const departmentIds = project ? getDepartmentIds(project) : [];
      const calculated = calculateInventoryValues(item);

      return {
        id: item._id,
        projectId: item.projectId,
        projectName: project?.name ?? "Unlinked project",
        departmentIds,
        departmentNames: departmentIds
          .map((departmentId) => departmentLookup.get(departmentId)?.name)
          .filter((name): name is string => Boolean(name)),
        planningType: item.planningType,
        ppeCategory: item.ppeCategory,
        itemName: calculated.itemName,
        description: item.description,
        quantity: calculated.quantity,
        unit: calculated.unit,
        stockOnHand: calculated.stockOnHand,
        requiredQuantity: calculated.requiredQuantity,
        shortageSurplus: calculated.shortageSurplus,
      };
    }).filter((item, index, items) => {
      if (departmentId && !item.departmentIds.includes(departmentId)) {
        return false;
      }

      return items.findIndex((candidate) => candidate.id === item.id) === index;
    });

    const clothingInventory = clothingGroups.flat().map((item) => {
      const project = item.projectId
        ? activeProjects.find((candidate) => candidate._id === item.projectId) ?? null
        : null;
      const departmentIds = project ? getDepartmentIds(project) : item.departmentId ? [item.departmentId] : [];
      const quantity = item.quantity ?? item.qtyIssued ?? 0;

      return {
        id: item._id,
        projectId: item.projectId,
        projectName: project?.name ?? "Unlinked project",
        departmentIds,
        departmentNames: departmentIds
          .map((linkedDepartmentId) => departmentLookup.get(linkedDepartmentId)?.name)
          .filter((name): name is string => Boolean(name)),
        planningType: "ppe" as const,
        ppeCategory: "clothing" as const,
        itemName: item.ppeClothingType,
        description: item.size ? `Size: ${item.size}` : "",
        quantity,
        unit: "items",
        stockOnHand: quantity,
        requiredQuantity: 0,
        shortageSurplus: quantity,
      };
    }).filter((item) => {
      if (departmentId && !item.departmentIds.includes(departmentId)) {
        return false;
      }

      return Boolean(item.projectId);
    });

    const inventory = inventoryId
      ? linkedInventory.filter((item) => item.id === inventoryId)
      : [...linkedInventory, ...clothingInventory];

    return {
      projects: selectedProjects.map((project) => {
        const departmentIds = getDepartmentIds(project);
        const projectInventory = inventory.filter((item) => item.projectId === project._id);

        return {
          id: project._id,
          name: project.name,
          departmentNames: departmentIds
            .map((departmentId) => departmentLookup.get(departmentId)?.name)
            .filter((name): name is string => Boolean(name)),
          inventoryCount: projectInventory.length,
          shortageCount: projectInventory.filter((item) => item.shortageSurplus < 0).length,
        };
      }),
      departments: activeDepartments.filter((department) => {
        if (departmentId) {
          return department._id === departmentId;
        }

        return selectedProjects.some((project) => getDepartmentIds(project).includes(department._id));
      }).map((department) => {
        const departmentProjects = selectedProjects.filter((project) => getDepartmentIds(project).includes(department._id));
        const departmentInventory = inventory.filter((item) => item.departmentIds.includes(department._id));

        return {
          id: department._id,
          name: department.name,
          projectCount: departmentProjects.length,
          inventoryCount: departmentInventory.length,
          requiredQuantity: departmentInventory.reduce((total, item) => total + item.requiredQuantity, 0),
          stockOnHand: departmentInventory.reduce((total, item) => total + item.stockOnHand, 0),
        };
      }),
      inventoryOptions: linkedInventory.map((item) => ({
        id: item.id,
        itemName: item.itemName,
      })),
      inventory,
    };
  },
});
