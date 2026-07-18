import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";
import ConsumablePlanning from "./pages/ConsumablePlanning";
import PPEPlanning from "./pages/PPEPlanning";
import ConsumableStock from "./pages/ConsumableStock";
import PPEStock from "./pages/PPEStock";
import ProjectDepartmentManagement from "./pages/ProjectDepartmentManagement";
import SelectionDetails from "./pages/SelectionDetails";
import MasterDataHub from "./pages/MasterDataHub";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/consumable-planning" element={<ConsumablePlanning />} />
        <Route path="/ppe-planning" element={<PPEPlanning />} />
        <Route path="/ppe-planning/:category" element={<PPEPlanning />} />
        <Route path="/consumable-stock" element={<ConsumableStock />} />
        <Route path="/ppe-stock" element={<PPEStock />} />
        <Route path="/ppe-stock/:category" element={<PPEStock />} />
        <Route path="/project-department-management" element={<ProjectDepartmentManagement />} />
        <Route path="/projects" element={<MasterDataHub type="projects" />} />
        <Route path="/departments" element={<MasterDataHub type="departments" />} />
        <Route path="/inventory" element={<MasterDataHub type="inventory" />} />
        <Route path="/project-details/:id" element={<SelectionDetails type="project" />} />
        <Route path="/department-details/:id" element={<SelectionDetails type="department" />} />
        <Route path="/inventory-details/:id" element={<SelectionDetails type="inventory" />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
