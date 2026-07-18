import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface PpeClothingFormValues {
  ppeClothingType: string;
  size: string;
  quantity: number;
  price: number;
}

export function usePpeClothingItems(projectId?: Id<"projects"> | null) {
  const items = useQuery(
    api.moduleOptions.listPpeClothingItems,
    projectId ? { projectId } : "skip",
  );
  const addItemMutation = useMutation(api.moduleOptions.addPpeClothingItem);
  const removeItemMutation = useMutation(api.moduleOptions.removePpeClothingItem);

  return {
    items: items ?? [],
    isLoading: projectId ? items === undefined : false,
    addItem: (values: PpeClothingFormValues) => {
      if (!projectId) {
        throw new Error("Project is required.");
      }
      return addItemMutation({ projectId, ...values });
    },
    removeItem: (id: Id<"ppeClothingItems">) => removeItemMutation({ id }),
  };
}
