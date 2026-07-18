import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import { type PlanningItemFormValues, type PlanningModuleKey, usePlanningItems } from "@/hooks/usePlanningItems";
import type { Id } from "../../convex/_generated/dataModel";

const emptyFormValues: PlanningItemFormValues = {
  itemCode: "",
  description: "",
  minimumStockLevel: 0,
  currentLevel: 0,
  requestedQuantity: 0,
  priceExclVat: 0,
  supplier: "",
  imageData: "",
};

interface PlanningItemsSectionProps {
  module: PlanningModuleKey;
  projectName: string;
  projectId?: Id<"projects"> | null;
  departmentId?: Id<"departments"> | null;
  selectionLabel?: string;
  sectionTitle?: string;
  hideDescription?: boolean;
}

const numberFields = [
  { key: "minimumStockLevel", label: "Minimum Stock Level" },
  { key: "currentLevel", label: "Current Level" },
  { key: "requestedQuantity", label: "Requested Quantity" },
  { key: "priceExclVat", label: "Price Excl Vat." },
] as const;

const itemFieldColumns = [
  { key: "itemCode", label: "Item Code" },
  { key: "description", label: "Description" },
  ...numberFields,
  { key: "supplier", label: "Supplier" },
  { key: "imageData", label: "Image" },
] as const;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const PlanningItemsSection = ({
  module,
  projectName,
  projectId = null,
  departmentId = null,
  selectionLabel = "project",
  sectionTitle = "Project Items",
  hideDescription = false,
}: PlanningItemsSectionProps) => {
  const [formValues, setFormValues] = useState<PlanningItemFormValues>(emptyFormValues);
  const { items, addItem, removeItem } = usePlanningItems(module, projectName, projectId, departmentId);

  const handleTextChange =
    (field: "itemCode" | "description" | "supplier") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleNumberChange =
    (field: "minimumStockLevel" | "currentLevel" | "requestedQuantity" | "priceExclVat") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]: Number(event.target.value),
      }));
    };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormValues((current) => ({
        ...current,
        imageData: "",
      }));
      return;
    }

    const imageData = await readFileAsDataUrl(file);
    setFormValues((current) => ({
      ...current,
      imageData,
    }));
  };

  const handleSubmit = async () => {
    if ((!projectId && !projectName.trim()) || !formValues.itemCode.trim()) {
      return;
    }

    await addItem(formValues);
    setFormValues(emptyFormValues);
  };

  if (!projectId && !projectName.trim()) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{sectionTitle}</CardTitle>
        {hideDescription ? null : (
          <CardDescription>
            Add and maintain item rows for this {selectionLabel}:{" "}
            <span className="font-medium text-foreground">{projectName}</span>.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 overflow-x-auto">
          <div className="grid min-w-[1440px] grid-cols-8 gap-4">
            {itemFieldColumns.map((field) => (
              <div key={field.key} className="text-sm font-medium text-muted-foreground">
                {field.label}
              </div>
            ))}
          </div>
          <div className="grid min-w-[1440px] grid-cols-8 gap-4">
            <Input
              placeholder="Enter item code"
              value={formValues.itemCode}
              onChange={handleTextChange("itemCode")}
            />
            <Input
              placeholder="Enter description"
              value={formValues.description}
              onChange={handleTextChange("description")}
            />
            {numberFields.map((field) => (
              <Input
                key={field.key}
                type="number"
                min="0"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={String(formValues[field.key])}
                onChange={handleNumberChange(field.key)}
              />
            ))}
            <Input
              placeholder="Enter supplier"
              value={formValues.supplier}
              onChange={handleTextChange("supplier")}
            />
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => void handleImageChange(event)}
              />
              {formValues.imageData ? (
                <img
                  src={formValues.imageData}
                  alt="Preview"
                  className="h-16 w-16 rounded-md border border-border object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => void handleSubmit()}>Add Item</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Minimum Stock Level</TableHead>
              <TableHead>Current Level</TableHead>
              <TableHead>Requested Quantity</TableHead>
              <TableHead>Price Excl Vat.</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No items saved for this {selectionLabel} yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell>{item.minimumStockLevel}</TableCell>
                  <TableCell>{item.currentLevel}</TableCell>
                  <TableCell>{item.requestedQuantity}</TableCell>
                  <TableCell>{typeof item.priceExclVat === "number" ? item.priceExclVat.toFixed(2) : "0.00"}</TableCell>
                  <TableCell>{item.supplier || "-"}</TableCell>
                  <TableCell>
                    {item.imageData ? (
                      <img
                        src={item.imageData}
                        alt={item.itemCode}
                        className="h-12 w-12 rounded-md border border-border object-cover"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void removeItem(item._id)}
                      aria-label={`Remove ${item.itemCode}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlanningItemsSection;
