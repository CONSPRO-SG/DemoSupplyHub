import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ProjectRequirementItemsSection from "@/components/ProjectRequirementItemsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDepartments, useProjects, type PlanningType, type PpeCategory } from "@/hooks/useMasterData";
import type { Id } from "../../convex/_generated/dataModel";

const NONE_VALUE = "__none__";

const ProjectDepartmentManagement = () => {
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDepartmentId, setNewProjectDepartmentId] = useState("");
  const [selectedPlanningType, setSelectedPlanningType] = useState<PlanningType>("consumable");
  const [selectedPpeCategory, setSelectedPpeCategory] = useState<PpeCategory>("general");
  const [selectedRequirementProjectId, setSelectedRequirementProjectId] = useState("");

  const departmentMaster = useDepartments(true);
  const projectMaster = useProjects(true);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Get Started
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-4 text-3xl font-heading font-bold text-foreground md:text-4xl">
            Project & Department Management
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Manage Projects, Departments, and each project&apos;s required items from one place.
          </p>
        </motion.div>

        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="requirements">Project Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Create, edit, archive, and delete departments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Add a new department"
                    value={newDepartmentName}
                    onChange={(event) => setNewDepartmentName(event.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      if (!newDepartmentName.trim()) return;
                      await departmentMaster.createDepartment({ name: newDepartmentName });
                      setNewDepartmentName("");
                    }}
                  >
                    Add Department
                  </Button>
                </div>

                <div className="space-y-3">
                  {departmentMaster.departments.map((department) => (
                    <div key={department._id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto_auto_auto]">
                      <Input
                        value={department.name}
                        onChange={(event) => {
                          void departmentMaster.updateDepartment({
                            id: department._id,
                            name: event.target.value,
                          });
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          void departmentMaster.archiveDepartment({
                            id: department._id,
                            archived: !department.archived,
                          })
                        }
                      >
                        {department.archived ? "Restore" : "Archive"}
                      </Button>
                      <div className="flex items-center text-sm text-muted-foreground">
                        {department.archived ? "Archived" : "Active"}
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => void departmentMaster.deleteDepartment({ id: department._id })}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Create, assign departments, archive, and delete projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
                  <Input
                    placeholder="Add a new project"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                  />
                  <Select
                    value={newProjectDepartmentId || NONE_VALUE}
                    onValueChange={(value) => setNewProjectDepartmentId(value === NONE_VALUE ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Select a department</SelectItem>
                      {departmentMaster.departments
                        .filter((department) => !department.archived)
                        .map((department) => (
                          <SelectItem key={department._id} value={department._id}>
                            {department.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!newProjectDepartmentId}
                    onClick={async () => {
                      if (!newProjectName.trim() || !newProjectDepartmentId) return;
                      await projectMaster.createProject({
                        name: newProjectName,
                        departmentId: newProjectDepartmentId as Id<"departments">,
                      });
                      setNewProjectName("");
                      setNewProjectDepartmentId("");
                    }}
                  >
                    Add Project
                  </Button>
                </div>

                <div className="space-y-3">
                  {projectMaster.projects.map((project) => (
                    <div key={project._id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_260px_auto_auto]">
                      <Input
                        value={project.name}
                        onChange={(event) => {
                          void projectMaster.updateProject({
                            id: project._id,
                            name: event.target.value,
                            departmentId: project.departmentId,
                          });
                        }}
                      />
                      <Select
                        value={project.departmentId ?? NONE_VALUE}
                        onValueChange={(value) =>
                          void projectMaster.updateProject({
                            id: project._id,
                            name: project.name,
                            departmentId: value === NONE_VALUE ? project.departmentId : (value as Id<"departments">),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Select a department</SelectItem>
                          {departmentMaster.departments.map((department) => (
                            <SelectItem key={department._id} value={department._id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() =>
                          void projectMaster.archiveProject({
                            id: project._id,
                            archived: !project.archived,
                          })
                        }
                      >
                        {project.archived ? "Restore" : "Archive"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => void projectMaster.deleteProject({ id: project._id })}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Requirements</CardTitle>
                <CardDescription>
                  Select a planning type and project to manage project-specific required items.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Planning Type</div>
                  <Select value={selectedPlanningType} onValueChange={(value) => setSelectedPlanningType(value as PlanningType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumable">Consumable Planning</SelectItem>
                      <SelectItem value="ppe">PPE Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedPlanningType === "ppe" ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">PPE Category</div>
                    <Select value={selectedPpeCategory} onValueChange={(value) => setSelectedPpeCategory(value as PpeCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">PPE Clothing</SelectItem>
                        <SelectItem value="general">PPE General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Project</div>
                  <Select
                    value={selectedRequirementProjectId || NONE_VALUE}
                    onValueChange={(value) => setSelectedRequirementProjectId(value === NONE_VALUE ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Select a project</SelectItem>
                      {projectMaster.projects
                        .filter((project) => !project.archived)
                        .map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <ProjectRequirementItemsSection
              title="Project-Specific Item Requirements"
              planningType={selectedPlanningType}
              ppeCategory={selectedPlanningType === "ppe" ? selectedPpeCategory : undefined}
              projectId={(selectedRequirementProjectId || null) as Id<"projects"> | null}
              projectName={
                projectMaster.projects.find((project) => project._id === selectedRequirementProjectId)?.name ?? ""
              }
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectDepartmentManagement;
