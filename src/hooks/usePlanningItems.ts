import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type PlanningModuleKey =
  | "consumablePlanning"
  | "ppePlanning"
  | "consumableStock"
  | "ppeStock";

export interface PlanningItemFormValues {
  itemCode: string;
  description: string;
  minimumStockLevel: number;
  currentLevel: number;
  requestedQuantity: number;
  priceExclVat?: number;
  supplier: string;
  imageData?: string;
}

export function usePlanningItems(
  module: PlanningModuleKey,
  projectName: string,
  projectId?: Id<"projects"> | null,
  departmentId?: Id<"departments"> | null,
) {
  const items = useQuery(
    api.moduleOptions.listPlanningItems,
    projectId ? { module, projectId } : projectName.trim() ? { module, projectName } : "skip",
  );
  const addPlanningItem = useMutation(api.moduleOptions.addPlanningItem);
  const removePlanningItem = useMutation(api.moduleOptions.removePlanningItem);

  return {
    items: items ?? [],
    isLoading: projectId || projectName.trim() ? items === undefined : false,
    addItem: (values: PlanningItemFormValues) =>
      addPlanningItem({
        module,
        projectName,
        projectId: projectId ?? undefined,
        departmentId: departmentId ?? undefined,
        ...values,
      }),
    removeItem: (id: Id<"planningItems">) => removePlanningItem({ id }),
  };
}
