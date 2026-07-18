import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Shield, ArrowLeft, Boxes, HardHat, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GetStarted = () => {
  const options = [
    {
      title: "Consumable Planning",
      description: "Plan and manage industrial consumables, track usage, and optimize stock levels.",
      icon: Package,
      href: "/consumable-planning",
    },
    {
      title: "PPE Planning",
      description: "Plan and control personal protective equipment allocation and compliance.",
      icon: Shield,
      href: "/ppe-planning",
    },
    {
      title: "Consumable Stock",
      description: "View and manage current consumable inventory and stock quantities.",
      icon: Boxes,
      href: "/consumable-stock",
    },
    {
      title: "PPE Stock",
      description: "View and manage current PPE inventory and available equipment.",
      icon: HardHat,
      href: "/ppe-stock",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Get Started
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose a planning module to begin managing your resources.
          </p>
        </motion.div>

        <div className="mb-8 flex justify-center">
          <Link
            to="/project-department-management"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Settings2 className="h-4 w-4" />
            Project & Department Management
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {options.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={option.href} className="block group">
                <div className="p-8 rounded-xl border border-border bg-card hover:border-accent hover:shadow-elevated transition-all duration-300">
                  <div className="w-14 h-14 rounded-lg gradient-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <option.icon className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                    {option.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <span className="inline-flex items-center text-accent font-medium group-hover:gap-2 transition-all">
                    Select
                    <ArrowLeft className="w-4 h-4 rotate-180 ml-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GetStarted;
