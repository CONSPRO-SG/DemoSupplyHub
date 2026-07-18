import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import ComboboxField from "@/components/ComboboxField";
import { type ModuleOptionKey, useModuleOptions } from "@/hooks/useModuleOptions";
import PlanningItemsSection from "@/components/PlanningItemsSection";

interface ModuleOptionPageProps {
  title: string;
  description?: string;
  moduleKey: ModuleOptionKey;
  storageKey: string;
  optionLabel?: string;
  optionPlaceholder?: string;
  enableItemTracking?: boolean;
  itemTrackingLabel?: string;
  hideItemDescription?: boolean;
  backTo?: string;
}

const ModuleOptionPage = ({
  title,
  description,
  moduleKey,
  storageKey,
  optionLabel = "Options",
  optionPlaceholder = "Add a new option",
  enableItemTracking = false,
  itemTrackingLabel = "project",
  hideItemDescription = false,
  backTo = "/get-started",
}: ModuleOptionPageProps) => {
  const [selectedOption, setSelectedOption] = useState("");
  const { options, addOption, removeOption } = useModuleOptions(moduleKey);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            to={backTo}
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
            {title}
          </h1>
          {description ? (
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">{description}</p>
          ) : null}
        </motion.div>

        <motion.div
          className="mx-auto max-w-6xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mx-auto max-w-md">
            <ComboboxField
              label={optionLabel}
              placeholder={optionPlaceholder}
              value={selectedOption}
              items={options}
              onValueChange={setSelectedOption}
              onAddItem={(item) => void addOption(item)}
              onRemoveItem={(item) => void removeOption(item)}
              storageKey={storageKey}
            />
          </div>

          {enableItemTracking &&
          (moduleKey === "consumablePlanning" ||
            moduleKey === "ppePlanning" ||
            moduleKey === "consumableStock") ? (
            <PlanningItemsSection
              module={moduleKey}
              projectName={selectedOption}
              selectionLabel={itemTrackingLabel}
              hideDescription={hideItemDescription}
            />
          ) : null}
        </motion.div>
      </main>
    </div>
  );
};

export default ModuleOptionPage;
