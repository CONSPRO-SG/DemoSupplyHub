import { useQuery } from "convex/react";
import { Building2, FolderKanban, PackageCheck } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const formatQuantity = (value: number, unit: string) => {
  const formatted = numberFormat.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

interface LiveDashboardProps {
  projectId?: string;
  departmentId?: string;
  inventoryId?: string;
  includeAll?: boolean;
}

const LiveDashboard = ({ projectId = "", departmentId = "", inventoryId = "", includeAll = false }: LiveDashboardProps) => {
  const hasSelection = Boolean(projectId || departmentId || inventoryId || includeAll);
  const snapshot = useQuery(
    api.masterData.listDashboardSnapshot,
    hasSelection
      ? {
          projectId: projectId ? (projectId as Id<"projects">) : undefined,
          departmentId: departmentId ? (departmentId as Id<"departments">) : undefined,
          inventoryId: inventoryId ? (inventoryId as Id<"projectRequirementItems">) : undefined,
          includeAll,
        }
      : "skip",
  );
  const projects = snapshot?.projects ?? [];
  const departments = snapshot?.departments ?? [];
  const inventory = snapshot?.inventory ?? [];
  const isLoading = hasSelection && snapshot === undefined;

  if (!hasSelection) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FolderKanban className="h-5 w-5 text-accent" />
                <CardTitle>Project</CardTitle>
              </div>
              <CardDescription>{projects.length} active saved projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading saved projects...</div>
              ) : projects.length === 0 ? (
                <div className="text-sm text-muted-foreground">No saved projects yet.</div>
              ) : (
                projects.slice(0, 6).map((project) => (
                  <div key={project.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{project.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {project.departmentNames.length > 0
                            ? project.departmentNames.join(", ")
                            : "No linked department"}
                        </div>
                      </div>
                      {project.shortageCount > 0 ? (
                        <Badge variant="destructive">{project.shortageCount} short</Badge>
                      ) : (
                        <Badge variant="secondary">Stock ok</Badge>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {project.inventoryCount} inventory records
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-accent" />
                <CardTitle>Department</CardTitle>
              </div>
              <CardDescription>{departments.length} active saved departments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading saved departments...</div>
              ) : departments.length === 0 ? (
                <div className="text-sm text-muted-foreground">No saved departments yet.</div>
              ) : (
                departments.slice(0, 6).map((department) => (
                  <div key={department.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{department.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {department.projectCount} linked projects
                        </div>
                      </div>
                      <Badge variant="outline">{department.inventoryCount} items</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Required</div>
                        <div className="font-medium">{numberFormat.format(department.requiredQuantity)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">On hand</div>
                        <div className="font-medium">{numberFormat.format(department.stockOnHand)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <PackageCheck className="h-5 w-5 text-accent" />
                <CardTitle>Inventory</CardTitle>
              </div>
              <CardDescription>{inventory.length} saved calculated records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[455px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Required</TableHead>
                      <TableHead className="text-right">On hand</TableHead>
                      <TableHead className="text-right">Shortage/Surplus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Loading saved inventory...
                        </TableCell>
                      </TableRow>
                    ) : inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No saved inventory requirements yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory.slice(0, 12).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.projectName}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.departmentNames.length > 0
                                ? item.departmentNames.join(", ")
                                : "No department"}
                            </div>
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
        </div>
      </div>
    </section>
  );
};

export default LiveDashboard;
