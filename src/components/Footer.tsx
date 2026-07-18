import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-primary-foreground">
              Consumable<span className="text-accent">Pro</span>
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            <a
              href="#home"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
            >
              Privacy Policy
            </a>
          </nav>

          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} Consumable Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
