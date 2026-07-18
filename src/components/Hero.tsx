import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, ClipboardCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
const Hero = () => {
  const features = [{
    icon: Shield,
    text: "Quality PPE"
  }, {
    icon: ClipboardCheck,
    text: "Inventory Control"
  }, {
    icon: Package,
    text: "Full Stock Management"
  }];
  return <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.2
        }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 text-sm font-medium mb-6">Your Trusted Consumable Partner<Shield className="w-4 h-4" />
              Trusted Safety Partner
            </span>
          </motion.div>

          <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 leading-tight" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.3
        }}>
            Your Complete Solution for{" "}
            <span className="text-accent">Consumables & PPE</span>
          </motion.h1>

          <motion.p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.4
        }}>
            Manage, track, and control personal protective equipment and industrial
            consumables with our streamlined control system. Safety made simple.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 mb-12" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.5
        }}>
            <Button size="lg" variant="accent" className="group" asChild>
              <Link to="/get-started">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="hero">
              Learn More
            </Button>
          </motion.div>

          <motion.div className="flex flex-wrap gap-6" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.6
        }}>
            {features.map((feature, index) => <div key={index} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>)}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>;
};
export default Hero;