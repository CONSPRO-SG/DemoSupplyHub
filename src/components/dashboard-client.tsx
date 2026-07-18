"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

type Consumable = {
  _id: string;
  name: string;
  sku: string;
  unit: string;
  minLevel: number;
  quantity: number;
  location?: string;
};

type MovementType = "IN" | "OUT" | "ADJUSTMENT";

const initialConsumableForm = {
  name: "",
  sku: "",
  unit: "",
  minLevel: 0,
  quantity: 0,
  location: ""
};

export function DashboardClient() {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [consumableForm, setConsumableForm] = useState(initialConsumableForm);
  const [creatingConsumable, setCreatingConsumable] = useState(false);

  const [movementConsumableId, setMovementConsumableId] = useState("");
  const [movementType, setMovementType] = useState<MovementType>("IN");
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [movementNote, setMovementNote] = useState("");
  const [creatingMovement, setCreatingMovement] = useState(false);

  const lowStockCount = useMemo(
    () => consumables.filter((item) => item.quantity <= item.minLevel).length,
    [consumables]
  );
  const totalStock = useMemo(
    () => consumables.reduce((sum, item) => sum + item.quantity, 0),
    [consumables]
  );

  const loadConsumables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/consumables");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Unable to load consumables.");
      }
      setConsumables(json as Consumable[]);
      if ((json as Consumable[]).length > 0 && !movementConsumableId) {
        setMovementConsumableId((json as Consumable[])[0]._id);
      }
    } catch (loadError) {
      setError(String(loadError));
    } finally {
      setLoading(false);
    }
  }, [movementConsumableId]);

  useEffect(() => {
    void loadConsumables();
  }, [loadConsumables]);

  async function handleCreateConsumable(event: FormEvent) {
    event.preventDefault();
    setCreatingConsumable(true);
    setError(null);

    try {
      const response = await fetch("/api/consumables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consumableForm)
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Unable to create consumable.");
      }
      setConsumableForm(initialConsumableForm);
      await loadConsumables();
    } catch (createError) {
      setError(String(createError));
    } finally {
      setCreatingConsumable(false);
    }
  }

  async function handleCreateMovement(event: FormEvent) {
    event.preventDefault();
    if (!movementConsumableId) {
      setError("Select a consumable first.");
      return;
    }
    setCreatingMovement(true);
    setError(null);

    try {
      const response = await fetch(`/api/consumables/${movementConsumableId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: movementType,
          quantity: movementQuantity,
          note: movementNote
        })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Unable to record movement.");
      }
      setMovementQuantity(1);
      setMovementNote("");
      await loadConsumables();
    } catch (movementError) {
      setError(String(movementError));
    } finally {
      setCreatingMovement(false);
    }
  }

  return (
    <main className="container grid" style={{ gap: "1rem" }}>
      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <h2 style={{ margin: 0 }}>Dashboard (Convex Backend)</h2>
          <SignOutButton />
        </div>
      </section>

      <section className="grid grid-2">
        <article className="metric">
          <strong>Total Consumables:</strong> {consumables.length}
        </article>
        <article className="metric">
          <strong>Low Stock Alerts:</strong> {lowStockCount}
        </article>
        <article className="metric">
          <strong>Total Quantity (all units):</strong> {totalStock}
        </article>
      </section>

      {error && <section className="panel error">{error}</section>}

      <section className="grid grid-2">
        <article className="panel">
          <form onSubmit={handleCreateConsumable} className="grid" style={{ gap: "0.7rem" }}>
            <h3 style={{ margin: 0 }}>Add Consumable</h3>
            <div className="field">
              <label htmlFor="name">Description</label>
              <input
                id="name"
                className="input"
                value={consumableForm.name}
                onChange={(event) =>
                  setConsumableForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="sku">SKU</label>
              <input
                id="sku"
                className="input"
                value={consumableForm.sku}
                onChange={(event) =>
                  setConsumableForm((prev) => ({ ...prev, sku: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="unit">Unit</label>
              <input
                id="unit"
                className="input"
                value={consumableForm.unit}
                onChange={(event) =>
                  setConsumableForm((prev) => ({ ...prev, unit: event.target.value }))
                }
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
                value={consumableForm.minLevel}
                onChange={(event) =>
                  setConsumableForm((prev) => ({
                    ...prev,
                    minLevel: Number(event.target.value)
                  }))
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
                value={consumableForm.quantity}
                onChange={(event) =>
                  setConsumableForm((prev) => ({
                    ...prev,
                    quantity: Number(event.target.value)
                  }))
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                className="input"
                value={consumableForm.location}
                onChange={(event) =>
                  setConsumableForm((prev) => ({ ...prev, location: event.target.value }))
                }
              />
            </div>
            <button className="btn" type="submit" disabled={creatingConsumable}>
              {creatingConsumable ? "Saving..." : "Create"}
            </button>
          </form>
        </article>

        <article className="panel">
          <form onSubmit={handleCreateMovement} className="grid" style={{ gap: "0.7rem" }}>
            <h3 style={{ margin: 0 }}>Record Movement</h3>
            <div className="field">
              <label htmlFor="consumableId">Consumable</label>
              <select
                id="consumableId"
                className="select"
                value={movementConsumableId}
                onChange={(event) => setMovementConsumableId(event.target.value)}
                disabled={consumables.length === 0}
              >
                {consumables.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="type">Movement Type</label>
              <select
                id="type"
                className="select"
                value={movementType}
                onChange={(event) => setMovementType(event.target.value as MovementType)}
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
                <option value="ADJUSTMENT">ADJUSTMENT (set exact stock)</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="movementQuantity">
                Quantity {movementType === "ADJUSTMENT" ? "(new stock value)" : ""}
              </label>
              <input
                id="movementQuantity"
                className="input"
                type="number"
                min={1}
                value={movementQuantity}
                onChange={(event) => setMovementQuantity(Number(event.target.value))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="note">Note</label>
              <textarea
                id="note"
                className="textarea"
                rows={3}
                value={movementNote}
                onChange={(event) => setMovementNote(event.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={creatingMovement || !movementConsumableId}>
              {creatingMovement ? "Saving..." : "Register"}
            </button>
          </form>
        </article>
      </section>

      <section className="panel">
        <h3 style={{ marginTop: 0 }}>Current Stock</h3>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Location</th>
                  <th>Qty</th>
                  <th>Min Level</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {consumables.map((item) => {
                  const isLow = item.quantity <= item.minLevel;
                  return (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.sku}</td>
                      <td>{item.location ?? "-"}</td>
                      <td>{item.quantity}</td>
                      <td>{item.minLevel}</td>
                      <td>{item.unit}</td>
                      <td>
                        <span className={`tag ${isLow ? "tag-low" : "tag-ok"}`}>
                          {isLow ? "LOW" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
