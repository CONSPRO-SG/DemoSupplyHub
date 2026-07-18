import { Shirt, Trash2 } from "lucide-react";
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
import { type PpeClothingFormValues, usePpeClothingItems } from "@/hooks/usePpeClothingItems";
import type { Id } from "../../convex/_generated/dataModel";

const emptyFormValues: PpeClothingFormValues = {
  ppeClothingType: "",
  size: "",
  quantity: 0,
  price: 0,
};

const ppeClothingColumns = [
  { key: "ppeClothingType", label: "PPE Clothing Type" },
  { key: "size", label: "Size" },
  { key: "quantity", label: "Quantity" },
  { key: "price", label: "Price" },
] as const;

interface PPEClothingSectionProps {
  projectId: Id<"projects"> | null;
  projectName: string;
}

const PPEClothingSection = ({ projectId, projectName }: PPEClothingSectionProps) => {
  const [formValues, setFormValues] = useState<PpeClothingFormValues>(emptyFormValues);
  const { items, addItem, removeItem } = usePpeClothingItems(projectId);

  const handleChange =
    (field: "ppeClothingType" | "size") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleNumberChange =
    (field: "quantity" | "price") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]: Number(event.target.value),
      }));
    };

  const handleSubmit = async () => {
    if (!projectId || !formValues.ppeClothingType.trim()) {
      return;
    }

    await addItem(formValues);
    setFormValues(emptyFormValues);
  };

  if (!projectId) {
    return (
      <Card className="border-accent/30 bg-gradient-to-br from-card via-card to-accent/5">
        <CardHeader>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg gradient-accent">
            <Shirt className="h-7 w-7 text-accent-foreground" />
          </div>
          <CardTitle className="text-xl">PPE Clothing Department</CardTitle>
          <CardDescription>Select a project to load PPE clothing stock.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-card via-card to-accent/5">
      <CardHeader>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg gradient-accent">
          <Shirt className="h-7 w-7 text-accent-foreground" />
        </div>
        <CardTitle className="text-xl">PPE Clothing Department</CardTitle>
        <CardDescription>
          Manage PPE clothing stock quantities and prices for{" "}
          <span className="font-medium text-foreground">{projectName}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-4 gap-4">
            {ppeClothingColumns.map((field) => (
              <div key={field.key} className="text-sm font-medium text-muted-foreground">
                {field.label}
              </div>
            ))}
          </div>
          <div className="grid min-w-[760px] grid-cols-4 gap-4">
            <Input
              placeholder="Enter clothing type"
              value={formValues.ppeClothingType}
              onChange={handleChange("ppeClothingType")}
            />
            <Input
              placeholder="Enter size"
              value={formValues.size}
              onChange={handleChange("size")}
            />
            <Input
              type="number"
              min="0"
              placeholder="Enter quantity"
              value={String(formValues.quantity)}
              onChange={handleNumberChange("quantity")}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price"
              value={String(formValues.price)}
              onChange={handleNumberChange("price")}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => void handleSubmit()}>Add PPE Clothing Record</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PPE Clothing Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No PPE clothing records saved yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.ppeClothingType || "-"}</TableCell>
                  <TableCell>{item.size || "-"}</TableCell>
                  <TableCell className="text-right">{item.quantity ?? item.qtyIssued ?? 0}</TableCell>
                  <TableCell className="text-right">
                    {typeof item.price === "number" ? item.price.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void removeItem(item._id)}
                      aria-label={`Remove ${item.ppeClothingType}`}
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

export default PPEClothingSection;
