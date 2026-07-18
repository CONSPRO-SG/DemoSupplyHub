import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  departments: defineTable({
    name: v.string(),
    archived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_name", ["name"]),
  projects: defineTable({
    name: v.string(),
    departmentId: v.optional(v.id("departments")),
    departmentIds: v.optional(v.array(v.id("departments"))),
    archived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_department", ["departmentId"]),
  projectRequirementItems: defineTable({
    projectId: v.id("projects"),
    planningType: v.union(v.literal("consumable"), v.literal("ppe")),
    ppeCategory: v.optional(v.union(v.literal("clothing"), v.literal("general"))),
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
    shortageSurplus: v.optional(v.number()),
    priceExclVat: v.optional(v.number()),
    spExclVat: v.optional(v.number()),
    supplier: v.string(),
    imageData: v.optional(v.string()),
    archived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_planning_type", ["projectId", "planningType"])
    .index("by_project_planning_type_ppe_category", ["projectId", "planningType", "ppeCategory"])
    .index("by_project_planning_type_item_code", ["projectId", "planningType", "itemCode"]),
  consumablePlanningOptions: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),
  ppePlanningOptions: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),
  consumableStockOptions: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),
  planningItems: defineTable({
    module: v.union(
      v.literal("consumablePlanning"),
      v.literal("ppePlanning"),
      v.literal("consumableStock"),
      v.literal("ppeStock"),
    ),
    projectName: v.string(),
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
    createdAt: v.number(),
  })
    .index("by_module_project", ["module", "projectName"])
    .index("by_project", ["projectId"])
    .index("by_department", ["departmentId"])
    .index("by_module_project_item_code", ["module", "projectName", "itemCode"]),
  ppeClothingItems: defineTable({
    projectId: v.optional(v.id("projects")),
    departmentId: v.optional(v.id("departments")),
    employeeNameSurname: v.optional(v.string()),
    employeeIdNumber: v.optional(v.string()),
    ppeClothingType: v.string(),
    size: v.string(),
    quantity: v.optional(v.number()),
    price: v.optional(v.number()),
    qtyIssued: v.optional(v.number()),
    dateIssued: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_employee_id", ["employeeIdNumber"])
    .index("by_project", ["projectId"])
    .index("by_department", ["departmentId"]),
});
