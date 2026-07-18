import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PlanningItemsSection from "@/components/PlanningItemsSection";

const ConsumableStock = () => (
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
          Consumable Stock
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Manage consumable stock items directly with item code, description, stock levels,
          requested quantity, and supplier details.
        </p>
      </motion.div>

      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PlanningItemsSection
          module="consumableStock"
          projectName="Consumable Stock"
          selectionLabel="consumable stock"
        />
      </motion.div>
    </main>
  </div>
);

export default ConsumableStock;
