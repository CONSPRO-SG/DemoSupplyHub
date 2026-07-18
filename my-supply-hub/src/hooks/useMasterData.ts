import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useDepartments(includeArchived = false) {
  const departments = useQuery(api.masterData.listDepartments, { includeArchived });

  return {
    departments: departments ?? [],
    isLoading: departments === undefined,
    createDepartment: useMutation(api.masterData.createDepartment),
    updateDepartment: useMutation(api.masterData.updateDepartment),
    archiveDepartment: useMutation(api.masterData.archiveDepartment),
    deleteDepartment: useMutation(api.masterData.deleteDepartment),
  };
}

export function useProjects(includeArchived = false) {
  const projects = useQuery(api.masterData.listProjects, { includeArchived });

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    createProject: useMutation(api.masterData.createProject),
    updateProject: useMutation(api.masterData.updateProject),
    archiveProject: useMutation(api.masterData.archiveProject),
    deleteProject: useMutation(api.masterData.deleteProject),
  };
}

export type PlanningType = "consumable" | "ppe";
export type PpeCategory = "clothing" | "general";

export interface ProjectRequirementDraft {
  ppeCategory?: PpeCategory;
  itemCode: string;
  itemName?: string;
  description: string;
  quantity?: number;
  unit?: string;
  minimumStockLevel: number;
  currentLevel: number;
  requestedQuantity: number;
  stockOnHand?: number;
  requiredQuantity?: number;
  priceExclVat?: number;
  spExclVat?: number;
  supplier: string;
  imageData?: string;
}

export function useProjectRequirementItems(
  projectId: Id<"projects"> | null,
  planningType: PlanningType,
  ppeCategory?: PpeCategory,
) {
  const items = useQuery(
    api.masterData.listProjectRequirementItems,
    projectId ? { projectId, planningType, ppeCategory } : "skip",
  );

  return {
    items: items ?? [],
    isLoading: projectId ? items === undefined : false,
    createItem: useMutation(api.masterData.createProjectRequirementItem),
    updateItem: useMutation(api.masterData.updateProjectRequirementItem),
    archiveItem: useMutation(api.masterData.archiveProjectRequirementItem),
    deleteItem: useMutation(api.masterData.deleteProjectRequirementItem),
  };
}
