import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import LiveDashboard from "@/components/LiveDashboard";
import Footer from "@/components/Footer";

type DetailType = "project" | "department" | "inventory";

interface SelectionDetailsProps {
  type: DetailType;
}

const detailTitles: Record<DetailType, string> = {
  project: "Project Details",
  department: "Department Details",
  inventory: "Inventory Details",
};

const SelectionDetails = ({ type }: SelectionDetailsProps) => {
  const { id = "" } = useParams();
  const decodedId = decodeURIComponent(id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24">
        <section className="bg-background py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-heading font-bold text-foreground">{detailTitles[type]}</h1>
          </div>
        </section>
        <LiveDashboard
          projectId={type === "project" ? decodedId : ""}
          departmentId={type === "department" ? decodedId : ""}
          inventoryId={type === "inventory" ? decodedId : ""}
        />
      </main>
      <Footer />
    </div>
  );
};

export default SelectionDetails;
