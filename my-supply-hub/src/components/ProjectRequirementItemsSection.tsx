import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type PlanningType, type PpeCategory, type ProjectRequirementDraft, useProjectRequirementItems } from "@/hooks/useMasterData";
import type { Id } from "../../convex/_generated/dataModel";

const emptyDraft: ProjectRequirementDraft = {
  itemCode: "",
  description: "",
  minimumStockLevel: 0,
  currentLevel: 0,
  requestedQuantity: 0,
  unit: "",
  priceExclVat: 0,
  spExclVat: 0,
  supplier: "",
  imageData: "",
};

const numberFields = [
  { key: "minimumStockLevel", label: "Minimum Stock Level" },
  { key: "currentLevel", label: "Current Level" },
  { key: "requestedQuantity", label: "Requested Quantity" },
] as const;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ProjectRequirementItemsSectionProps {
  title: string;
  planningType: PlanningType;
  ppeCategory?: PpeCategory;
  projectId: Id<"projects"> | null;
  projectName: string;
  showSellingPriceExclVat?: boolean;
}

const ProjectRequirementItemsSection = ({
  title,
  planningType,
  ppeCategory,
  projectId,
  projectName,
  showSellingPriceExclVat = false,
}: ProjectRequirementItemsSectionProps) => {
  const [newItem, setNewItem] = useState<ProjectRequirementDraft>(emptyDraft);
  const [drafts, setDrafts] = useState<Record<string, ProjectRequirementDraft>>({});
  const { items, createItem, updateItem, deleteItem } = useProjectRequirementItems(projectId, planningType, ppeCategory);
  const columns = [
    { key: "itemCode", label: "Item Code" },
    { key: "description", label: "Item Description" },
    ...numberFields,
    { key: "unit", label: "Unit" },
    { key: "priceExclVat", label: "Price Excl Vat." },
    ...(showSellingPriceExclVat ? [{ key: "spExclVat", label: "SP excl. VAT" }] : []),
    { key: "supplier", label: "Supplier" },
    { key: "imageData", label: "Image" },
  ] as const;
  const gridColumnClass = showSellingPriceExclVat
    ? "grid min-w-[1680px] grid-cols-10 gap-4"
    : "grid min-w-[1520px] grid-cols-9 gap-4";
  const emptyColSpan = showSellingPriceExclVat ? 11 : 10;

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        items.map((item) => [
          item._id,
          {
            itemCode: item.itemCode,
            ppeCategory: item.ppeCategory,
            itemName: item.itemName ?? item.itemCode,
            description: item.description,
            minimumStockLevel: item.minimumStockLevel,
            currentLevel: item.currentLevel,
            requestedQuantity: item.requestedQuantity,
            unit: item.unit ?? "",
            priceExclVat: item.priceExclVat ?? 0,
            spExclVat: item.spExclVat ?? 0,
            supplier: item.supplier,
            imageData: item.imageData ?? "",
          },
        ]),
      ),
    );
  }, [items]);

  const handleNewText =
    (field: "itemCode" | "description" | "unit" | "supplier") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewItem((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleNewNumber =
    (field: "minimumStockLevel" | "currentLevel" | "requestedQuantity" | "priceExclVat" | "spExclVat") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewItem((current) => ({ ...current, [field]: Number(event.target.value) }));
    };

  const handleNewImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setNewItem((current) => ({ ...current, imageData: "" }));
      return;
    }
    const imageData = await readFileAsDataUrl(file);
    setNewItem((current) => ({ ...current, imageData }));
  };

  const updateDraft = (id: string, patch: Partial<ProjectRequirementDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  };

  const handleDraftText =
    (id: string, field: "itemCode" | "description" | "unit" | "supplier") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateDraft(id, { [field]: event.target.value });
    };

  const handleDraftNumber =
    (id: string, field: "minimumStockLevel" | "currentLevel" | "requestedQuantity" | "priceExclVat" | "spExclVat") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateDraft(id, { [field]: Number(event.target.value) });
    };

  const handleDraftImage = (id: string) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      updateDraft(id, { imageData: "" });
      return;
    }
    const imageData = await readFileAsDataUrl(file);
    updateDraft(id, { imageData });
    await updateItem({ id: id as Id<"projectRequirementItems">, ...drafts[id], imageData });
  };

  const persistDraft = async (id: Id<"projectRequirementItems">) => {
    const draft = drafts[id];
    if (!draft) return;
    await updateItem({ id, ...draft });
  };

  const addNewItem = async () => {
    if (!projectId || !newItem.itemCode.trim()) {
      return;
    }

    await createItem({
      projectId,
      planningType,
      ppeCategory,
      ...newItem,
    });
    setNewItem(emptyDraft);
  };

  if (!projectId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>Select a project to load its required items.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>
          Required items for <span className="font-medium text-foreground">{projectName}</span> save automatically to the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 overflow-x-auto">
          <div className={gridColumnClass}>
            {columns.map((column) => (
              <div key={column.key} className="text-sm font-medium text-muted-foreground">
                {column.label}
              </div>
            ))}
          </div>
          <div className={gridColumnClass}>
            <Input placeholder="Enter item code" value={newItem.itemCode} onChange={handleNewText("itemCode")} />
            <Input placeholder="Enter item description" value={newItem.description} onChange={handleNewText("description")} />
            {numberFields.map((field) => (
              <Input
                key={field.key}
                type="number"
                min="0"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={String(newItem[field.key])}
                onChange={handleNewNumber(field.key)}
              />
            ))}
            <Input placeholder="Enter unit" value={newItem.unit} onChange={handleNewText("unit")} />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price excl vat."
              value={String(newItem.priceExclVat ?? 0)}
              onChange={handleNewNumber("priceExclVat")}
            />
            {showSellingPriceExclVat ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter SP excl. VAT"
                value={String(newItem.spExclVat ?? 0)}
                onChange={handleNewNumber("spExclVat")}
              />
            ) : null}
            <Input placeholder="Enter supplier" value={newItem.supplier} onChange={handleNewText("supplier")} />
            <div className="space-y-2">
              <Input type="file" accept="image/*" onChange={(event) => void handleNewImage(event)} />
              {newItem.imageData ? (
                <img src={newItem.imageData} alt="Preview" className="h-16 w-16 rounded-md border border-border object-cover" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => void addNewItem()}>Add Requirement Item</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Code</TableHead>
              <TableHead>Item Description</TableHead>
              <TableHead>Minimum Stock Level</TableHead>
              <TableHead>Current Level</TableHead>
              <TableHead>Requested Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Price Excl Vat.</TableHead>
              {showSellingPriceExclVat ? <TableHead>SP excl. VAT</TableHead> : null}
              <TableHead>Supplier</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={emptyColSpan} className="text-center text-muted-foreground">
                  No required items saved for this project yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const draft = drafts[item._id];
                if (!draft) return null;
                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Input
                        value={draft.itemCode}
                        onChange={handleDraftText(item._id, "itemCode")}
                        onBlur={() => void persistDraft(item._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={draft.description}
                        onChange={handleDraftText(item._id, "description")}
                        onBlur={() => void persistDraft(item._id)}
                      />
                    </TableCell>
                    {numberFields.map((field) => (
                      <TableCell key={field.key}>
                        <Input
                          type="number"
                          min="0"
                          value={String(draft[field.key])}
                          onChange={handleDraftNumber(item._id, field.key)}
                          onBlur={() => void persistDraft(item._id)}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Input
                        value={draft.unit}
                        onChange={handleDraftText(item._id, "unit")}
                        onBlur={() => void persistDraft(item._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={String(draft.priceExclVat ?? 0)}
                        onChange={handleDraftNumber(item._id, "priceExclVat")}
                        onBlur={() => void persistDraft(item._id)}
                      />
                    </TableCell>
                    {showSellingPriceExclVat ? (
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={String(draft.spExclVat ?? 0)}
                          onChange={handleDraftNumber(item._id, "spExclVat")}
                          onBlur={() => void persistDraft(item._id)}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <Input
                        value={draft.supplier}
                        onChange={handleDraftText(item._id, "supplier")}
                        onBlur={() => void persistDraft(item._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={(event) => void handleDraftImage(item._id)(event)} />
                        {draft.imageData ? (
                          <img src={draft.imageData} alt={draft.itemCode} className="h-12 w-12 rounded-md border border-border object-cover" />
                        ) : (
                          <span className="text-sm text-muted-foreground">No image</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => void deleteItem({ id: item._id })} aria-label={`Delete ${draft.itemCode}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectRequirementItemsSection;
