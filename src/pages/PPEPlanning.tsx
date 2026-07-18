import { motion } from "framer-motion";
import { ArrowLeft, HardHat, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PlanningWorkspacePage from "@/components/PlanningWorkspacePage";

const categories = [
  {
    key: "PPE Clothing",
    description: "Plan clothing-related PPE requirements.",
    icon: Shield,
    ppeCategory: "clothing",
    storagePrefix: "ppe-planning-clothing",
  },
  {
    key: "PPE General",
    description: "Plan general PPE requirements.",
    icon: HardHat,
    ppeCategory: "general",
    storagePrefix: "ppe-planning-general",
  },
] as const;

const PPEPlanning = () => {
  const { category: categorySlug } = useParams();
  const selectedCategory = categories.find((category) =>
    categorySlug === category.ppeCategory,
  );

  if (selectedCategory) {
    return (
      <PlanningWorkspacePage
        title={`${selectedCategory.key} Planning`}
        planningType="ppe"
        ppeCategory={selectedCategory.ppeCategory}
        storagePrefix={selectedCategory.storagePrefix}
      />
    );
  }

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
            PPE Planning
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Choose which PPE planning area you want to work in.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {categories.map((category) => (
            <Link
              key={category.key}
              to={`/ppe-planning/${category.ppeCategory}`}
              className="rounded-xl border border-border bg-card p-8 text-left transition-all duration-300 hover:border-accent hover:shadow-elevated"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg gradient-accent">
                <category.icon className="h-7 w-7 text-accent-foreground" />
              </div>
              <h2 className="mb-3 text-xl font-heading font-bold text-foreground">
                {category.key}
              </h2>
              <p className="text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default PPEPlanning;
