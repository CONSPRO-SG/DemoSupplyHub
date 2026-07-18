"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  sku: "",
  unit: "",
  minLevel: 0,
  quantity: 0,
  location: ""
};

export function AddConsumableForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/consumables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setError("Failed to create consumable.");
      setSaving(false);
      return;
    }

    setForm(initialState);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: "0.7rem" }}>
      <h3 style={{ margin: 0 }}>Add Consumable</h3>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          className="input"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="sku">SKU</label>
        <input
          id="sku"
          className="input"
          value={form.sku}
          onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="unit">Unit (L, pcs, kg)</label>
        <input
          id="unit"
          className="input"
          value={form.unit}
          onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="minLevel">Min Level</label>
        <input
          id="minLevel"
          className="input"
          type="number"
          min={0}
          value={form.minLevel}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, minLevel: Number(event.target.value) }))
          }
          required
        />
      </div>
      <div className="field">
        <label htmlFor="quantity">Initial Quantity</label>
        <input
          id="quantity"
          className="input"
          type="number"
          min={0}
          value={form.quantity}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
          }
          required
        />
      </div>
      <div className="field">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          className="input"
          value={form.location}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, location: event.target.value }))
          }
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Create"}
      </button>
    </form>
  );
}
