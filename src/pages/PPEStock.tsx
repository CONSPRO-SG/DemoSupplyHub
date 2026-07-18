import { motion } from "framer-motion";
import { ArrowLeft, HardHat, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PlanningWorkspacePage from "@/components/PlanningWorkspacePage";
import PPEClothingStockPage from "@/pages/PPEClothingStockPage";

const categories = [
  {
    key: "PPE Clothing",
    slug: "clothing",
    description: "Work with clothing-related PPE stock items.",
    icon: Shield,
  },
  {
    key: "PPE General",
    slug: "general",
    description: "Work with general PPE stock items.",
    icon: HardHat,
  },
] as const;

const PPEStock = () => {
  const { category: categorySlug } = useParams();
  const selectedCategory = categories.find((category) => category.slug === categorySlug) ?? null;

  if (selectedCategory?.key === "PPE General") {
    return (
      <PlanningWorkspacePage
        title="PPE General Stock"
        planningType="ppe"
        ppeCategory="general"
        storagePrefix="ppe-stock-general"
        showSellingPriceExclVat={false}
      />
    );
  }

  if (selectedCategory?.key === "PPE Clothing") {
    return <PPEClothingStockPage />;
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
            PPE Stock
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Choose which PPE stock area you want to work in.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mb-8 grid max-w-4xl gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {categories.map((category) => (
            <Link
              key={category.key}
              to={`/ppe-stock/${category.slug}`}
              className={`rounded-xl border p-8 text-left transition-all duration-300 ${
                selectedCategory?.key === category.key
                  ? "border-accent bg-accent/5 shadow-elevated"
                  : "border-border bg-card hover:border-accent hover:shadow-elevated"
              }`}
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

        <div className="text-center text-muted-foreground">
          Select `PPE Clothing` or `PPE General` to start working in that area.
        </div>
      </main>
    </div>
  );
};

export default PPEStock;
