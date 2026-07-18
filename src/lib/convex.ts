import { ConvexHttpClient } from "convex/browser";

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");
  }
  return url;
}

export function getConvexClient() {
  return new ConvexHttpClient(getConvexUrl());
}

type MovementType = "IN" | "OUT" | "ADJUSTMENT";

export type ConsumablePayload = {
  name: string;
  sku: string;
  unit: string;
  minLevel: number;
  quantity: number;
  location?: string;
};

export type MovementPayload = {
  consumableId: string;
  type: MovementType;
  quantity: number;
  note?: string;
};

function authedClient(token?: string) {
  const client = getConvexClient();
  if (token) {
    client.setAuth(token);
  }
  return client;
}

export async function convexListConsumables(token?: string) {
  const convex = authedClient(token);
  return convex.query("consumables:list" as never, {});
}

export async function convexCreateConsumable(payload: ConsumablePayload, token?: string) {
  const convex = authedClient(token);
  return convex.mutation("consumables:create" as never, payload);
}

export async function convexRecordMovement(payload: MovementPayload, token?: string) {
  const convex = authedClient(token);
  return convex.mutation("consumables:recordMovement" as never, payload);
}
