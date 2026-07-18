"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ConsumableOption = {
  id: string;
  name: string;
  sku: string;
};

type Props = {
  consumables: ConsumableOption[];
};

export function StockMovementForm({ consumables }: Props) {
  const router = useRouter();
  const firstId = useMemo(() => consumables[0]?.id ?? "", [consumables]);

  const [consumableId, setConsumableId] = useState(firstId);
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consumableId) {
      setError("Select a consumable first.");
      return;
    }

    setSaving(true);
    setError(null);

    const response = await fetch(`/api/consumables/${consumableId}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        quantity,
        note
      })
    });

    if (!response.ok) {
      const json = (await response.json()) as { error?: string };
      setError(json.error ?? "Failed to register movement.");
      setSaving(false);
      return;
    }

    setQuantity(1);
    setNote("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: "0.7rem" }}>
      <h3 style={{ margin: 0 }}>Record Movement</h3>
      <div className="field">
        <label htmlFor="consumableId">Consumable</label>
        <select
          id="consumableId"
          className="select"
          value={consumableId}
          onChange={(event) => setConsumableId(event.target.value)}
          disabled={consumables.length === 0}
        >
          {consumables.map((consumable) => (
            <option key={consumable.id} value={consumable.id}>
              {consumable.name} ({consumable.sku})
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="type">Movement Type</label>
        <select
          id="type"
          className="select"
          value={type}
          onChange={(event) =>
            setType(event.target.value as "IN" | "OUT" | "ADJUSTMENT")
          }
        >
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
          <option value="ADJUSTMENT">ADJUSTMENT (set exact stock)</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="movementQuantity">
          Quantity {type === "ADJUSTMENT" ? "(new stock value)" : ""}
        </label>
        <input
          id="movementQuantity"
          className="input"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="note">Note</label>
        <textarea
          id="note"
          className="textarea"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button className="btn" type="submit" disabled={saving || consumables.length === 0}>
        {saving ? "Saving..." : "Register"}
      </button>
    </form>
  );
}
