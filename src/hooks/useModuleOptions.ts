import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const moduleApis = {
  consumablePlanning: {
    list: api.moduleOptions.listConsumablePlanning,
    add: api.moduleOptions.addConsumablePlanning,
    remove: api.moduleOptions.removeConsumablePlanning,
  },
  ppePlanning: {
    list: api.moduleOptions.listPpePlanning,
    add: api.moduleOptions.addPpePlanning,
    remove: api.moduleOptions.removePpePlanning,
  },
  consumableStock: {
    list: api.moduleOptions.listConsumableStock,
    add: api.moduleOptions.addConsumableStock,
    remove: api.moduleOptions.removeConsumableStock,
  },
} as const;

export type ModuleOptionKey = keyof typeof moduleApis;

export function useModuleOptions(moduleKey: ModuleOptionKey) {
  const moduleApi = moduleApis[moduleKey];
  const options = useQuery(moduleApi.list);
  const addOption = useMutation(moduleApi.add);
  const removeOption = useMutation(moduleApi.remove);

  return {
    options: options ?? [],
    isLoading: options === undefined,
    addOption: (name: string) => addOption({ name }),
    removeOption: (name: string) => removeOption({ name }),
  };
}
