
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { GalleryPage } from "@/components/pages/GalleryPage";
import { TrainPage } from "@/components/pages/TrainPage";
import { ModelsPage } from "@/components/pages/ModelsPage";
import { GeneratePage } from "@/components/pages/GeneratePage";
import { SettingsPage } from "@/components/pages/SettingsPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"home" | "train" | "models" | "generate" | "settings">("home");

  const renderCurrentPage = () => {
    switch (activeTab) {
      case "home":
        return <GalleryPage />;
      case "train":
        return <TrainPage />;
      case "models":
        return <ModelsPage />;
      case "generate":
        return <GeneratePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <GalleryPage />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
