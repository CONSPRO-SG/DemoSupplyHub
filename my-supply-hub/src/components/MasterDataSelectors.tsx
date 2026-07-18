import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  id: string;
  name: string;
}

interface MasterDataSelectorsProps {
  projectOptions: SelectOption[];
  departmentOptions: SelectOption[];
  selectedProjectId: string;
  selectedDepartmentId: string;
  onProjectChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  isAddingProject: boolean;
  newProjectName: string;
  newProjectDepartmentId: string;
  onToggleAddProject: () => void;
  onNewProjectNameChange: (value: string) => void;
  onNewProjectDepartmentChange: (value: string) => void;
  onCreateProject: () => void;
  isAddingDepartment: boolean;
  newDepartmentName: string;
  onToggleAddDepartment: () => void;
  onNewDepartmentNameChange: (value: string) => void;
  onCreateDepartment: () => void;
}

const NONE_VALUE = "__none__";

const MasterDataSelectors = ({
  projectOptions,
  departmentOptions,
  selectedProjectId,
  selectedDepartmentId,
  onProjectChange,
  onDepartmentChange,
  isAddingProject,
  newProjectName,
  newProjectDepartmentId,
  onToggleAddProject,
  onNewProjectNameChange,
  onNewProjectDepartmentChange,
  onCreateProject,
  isAddingDepartment,
  newDepartmentName,
  onToggleAddDepartment,
  onNewDepartmentNameChange,
  onCreateDepartment,
}: MasterDataSelectorsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Project</Label>
          <Button type="button" variant="outline" size="sm" onClick={onToggleAddProject}>
            + Add Project
          </Button>
        </div>
        <Select value={selectedProjectId || NONE_VALUE} onValueChange={(value) => onProjectChange(value === NONE_VALUE ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>Select a project</SelectItem>
            {projectOptions.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAddingProject ? (
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <Input
              placeholder="New project name"
              value={newProjectName}
              onChange={(event) => onNewProjectNameChange(event.target.value)}
            />
            <Select
              value={newProjectDepartmentId || NONE_VALUE}
              onValueChange={(value) => onNewProjectDepartmentChange(value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Select a department</SelectItem>
                {departmentOptions.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="button" onClick={onCreateProject} disabled={!newProjectDepartmentId}>
                Save Project
              </Button>
              <Button type="button" variant="ghost" onClick={onToggleAddProject}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Department</Label>
          <Button type="button" variant="outline" size="sm" onClick={onToggleAddDepartment}>
            + Add Department
          </Button>
        </div>
        <Select value={selectedDepartmentId || NONE_VALUE} onValueChange={(value) => onDepartmentChange(value === NONE_VALUE ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>Select a department</SelectItem>
            {departmentOptions.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAddingDepartment ? (
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <Input
              placeholder="New department name"
              value={newDepartmentName}
              onChange={(event) => onNewDepartmentNameChange(event.target.value)}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={onCreateDepartment}>
                Save Department
              </Button>
              <Button type="button" variant="ghost" onClick={onToggleAddDepartment}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MasterDataSelectors;
