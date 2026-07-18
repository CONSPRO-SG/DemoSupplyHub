import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../convex/_generated/api";

type HubType = "projects" | "departments" | "inventory";

interface MasterDataHubProps {
  type: HubType;
}

const hubCopy: Record<HubType, { title: string; description: string }> = {
  projects: {
    title: "Projects",
    description: "Open a project to view its department, inventory, records, calculations, and saved transactions.",
  },
  departments: {
    title: "Departments",
    description: "Open a department to view linked projects and aggregated project inventory.",
  },
  inventory: {
    title: "Inventory",
    description: "View current stock balances, shortages, surpluses, and linked project inventory records.",
  },
};

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const formatQuantity = (value: number, unit: string) => {
  const formatted = numberFormat.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

const MasterDataHub = ({ type }: MasterDataHubProps) => {
  const options = useQuery(api.masterData.listDashboardFilterOptions);
  const inventorySnapshot = useQuery(
    api.masterData.listDashboardSnapshot,
    type === "inventory" ? { includeAll: true } : "skip",
  );
  const copy = hubCopy[type];
  const inventory = inventorySnapshot?.inventory ?? [];
  const consumables = inventory.filter((item) => item.planningType === "consumable");
  const ppe = inventory.filter((item) => item.planningType === "ppe");

  const renderInventoryTable = (
    title: string,
    description: string,
    records: typeof inventory,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {records.length} {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Required</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Shortage/Surplus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventorySnapshot === undefined ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No {title.toLowerCase()} inventory records saved yet.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </TableCell>
                    <TableCell>{item.projectName}</TableCell>
                    <TableCell>
                      {item.departmentNames.length > 0
                        ? item.departmentNames.join(", ")
                        : "No department"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(item.requiredQuantity, item.unit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(item.stockOnHand, item.unit)}
                    </TableCell>
                    <TableCell className={item.shortageSurplus < 0 ? "text-right text-destructive" : "text-right"}>
                      {formatQuantity(item.shortageSurplus, item.unit)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24">
        <section className="bg-background py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-heading font-bold text-foreground">{copy.title}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{copy.description}</p>
          </div>
        </section>

        {type === "inventory" ? (
          <section className="bg-background pb-16">
            <div className="container mx-auto grid gap-6 px-4">
              {renderInventoryTable("Consumables", "consumable inventory records", consumables)}
              {renderInventoryTable("PPE", "PPE inventory records", ppe)}
            </div>
          </section>
        ) : (
          <section className="bg-background pb-16">
            <div className="container mx-auto grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
              {(type === "projects" ? options?.projects : options?.departments)?.map((item) => (
                <Link
                  key={item.id}
                  to={`/${type === "projects" ? "project" : "department"}-details/${encodeURIComponent(item.id)}`}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:border-accent">
                    <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>
                        {type === "projects" ? "Project Details" : "Department Details"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Open linked records and synchronized inventory.
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MasterDataHub;
