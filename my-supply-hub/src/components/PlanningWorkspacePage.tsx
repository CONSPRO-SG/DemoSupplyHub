import { motion } from "framer-motion";
import { ArrowLeft, Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MasterDataSelectors from "@/components/MasterDataSelectors";
import ProjectRequirementItemsSection from "@/components/ProjectRequirementItemsSection";
import { Button } from "@/components/ui/button";
import { useDepartments, useProjects, type PlanningType, type PpeCategory } from "@/hooks/useMasterData";
import type { Id } from "../../convex/_generated/dataModel";

interface PlanningWorkspacePageProps {
  title: string;
  planningType: PlanningType;
  ppeCategory?: PpeCategory;
  storagePrefix: string;
  showSellingPriceExclVat?: boolean;
}

const SHARED_PROJECT_KEY = "master-data-project-id";
const SHARED_DEPARTMENT_KEY = "master-data-department-id";

const readStoredSelection = (primaryKey: string, sharedKey: string) => {
  const primaryValue = localStorage.getItem(primaryKey);
  if (primaryValue) return primaryValue;
  return localStorage.getItem(sharedKey) || "";
};

const PlanningWorkspacePage = ({
  title,
  planningType,
  ppeCategory,
  storagePrefix,
  showSellingPriceExclVat = true,
}: PlanningWorkspacePageProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [hasLoadedStoredSelection, setHasLoadedStoredSelection] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDepartmentId, setNewProjectDepartmentId] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const { projects, createProject, updateProject } = useProjects(false);
  const { departments, createDepartment } = useDepartments(false);

  useEffect(() => {
    const storedProjectId = readStoredSelection(`${storagePrefix}-project-id`, SHARED_PROJECT_KEY);
    const storedDepartmentId = readStoredSelection(`${storagePrefix}-department-id`, SHARED_DEPARTMENT_KEY);
    setSelectedProjectId(storedProjectId);
    setSelectedDepartmentId(storedDepartmentId);
    setHasLoadedStoredSelection(true);
  }, [storagePrefix]);

  useEffect(() => {
    if (!hasLoadedStoredSelection) return;
    localStorage.setItem(`${storagePrefix}-project-id`, selectedProjectId);
    localStorage.setItem(SHARED_PROJECT_KEY, selectedProjectId);
  }, [hasLoadedStoredSelection, selectedProjectId, storagePrefix]);

  useEffect(() => {
    if (!hasLoadedStoredSelection) return;
    localStorage.setItem(`${storagePrefix}-department-id`, selectedDepartmentId);
    localStorage.setItem(SHARED_DEPARTMENT_KEY, selectedDepartmentId);
  }, [hasLoadedStoredSelection, selectedDepartmentId, storagePrefix]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId],
  );

  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedDepartmentId("");
      return;
    }

    if (selectedProject) {
      setSelectedDepartmentId(selectedProject.department?._id ?? "");
    }
  }, [selectedProject, selectedProjectId]);

  useEffect(() => {
    if (isAddingProject) {
      setNewProjectDepartmentId(selectedDepartmentId);
    }
  }, [isAddingProject, selectedDepartmentId]);

  const handleDepartmentChange = async (departmentId: string) => {
    if (!departmentId) return;
    setSelectedDepartmentId(departmentId);

    if (selectedProjectId && selectedProject) {
      await updateProject({
        id: selectedProject._id,
        name: selectedProject.name,
        departmentId: departmentId as Id<"departments">,
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) return;

    const id = await createDepartment({ name: newDepartmentName });
    setSelectedDepartmentId(id);
    setNewProjectDepartmentId(id);
    setNewDepartmentName("");
    setIsAddingDepartment(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectDepartmentId) return;

    const id = await createProject({
      name: newProjectName,
      departmentId: newProjectDepartmentId as Id<"departments">,
    });

    setSelectedProjectId(id);
    setSelectedDepartmentId(newProjectDepartmentId);
    setNewProjectName("");
    setNewProjectDepartmentId("");
    setIsAddingProject(false);
  };

  const toggleAddProject = () => {
    setIsAddingProject((current) => {
      const next = !current;
      if (!next) {
        setNewProjectName("");
        setNewProjectDepartmentId("");
      }
      return next;
    });
  };

  const toggleAddDepartment = () => {
    setIsAddingDepartment((current) => {
      const next = !current;
      if (!next) {
        setNewDepartmentName("");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Get Started
          </Link>
          <Button asChild variant="outline">
            <Link to="/project-department-management">
              <Settings2 className="mr-2 h-4 w-4" />
              Project & Department Management
            </Link>
          </Button>
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
            {title}
          </h1>
        </motion.div>

        <motion.div
          className="mx-auto max-w-6xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MasterDataSelectors
            projectOptions={projects.map((project) => ({ id: project._id, name: project.name }))}
            departmentOptions={departments.map((department) => ({ id: department._id, name: department.name }))}
            selectedProjectId={selectedProjectId}
            selectedDepartmentId={selectedDepartmentId}
            onProjectChange={setSelectedProjectId}
            onDepartmentChange={(value) => void handleDepartmentChange(value)}
            isAddingProject={isAddingProject}
            newProjectName={newProjectName}
            newProjectDepartmentId={newProjectDepartmentId}
            onToggleAddProject={toggleAddProject}
            onNewProjectNameChange={setNewProjectName}
            onNewProjectDepartmentChange={setNewProjectDepartmentId}
            onCreateProject={() => void handleCreateProject()}
            isAddingDepartment={isAddingDepartment}
            newDepartmentName={newDepartmentName}
            onToggleAddDepartment={toggleAddDepartment}
            onNewDepartmentNameChange={setNewDepartmentName}
            onCreateDepartment={() => void handleCreateDepartment()}
          />

          <ProjectRequirementItemsSection
            title="Required Items"
            planningType={planningType}
            ppeCategory={ppeCategory}
            projectId={(selectedProjectId || null) as Id<"projects"> | null}
            projectName={selectedProject?.name ?? ""}
            showSellingPriceExclVat={showSellingPriceExclVat}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default PlanningWorkspacePage;
