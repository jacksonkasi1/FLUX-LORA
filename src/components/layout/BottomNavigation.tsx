
import { Home, Plus, Settings, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: "home" | "train" | "models" | "generate" | "settings";
  onTabChange: (tab: "home" | "train" | "models" | "generate" | "settings") => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "home" as const, label: "Gallery", icon: Home },
    { id: "train" as const, label: "Train", icon: Plus },
    { id: "generate" as const, label: "Generate", icon: Sparkles },
    { id: "models" as const, label: "Models", icon: Bot },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-[20px] border-t border-[#F5F5F7]/50 safe-area-bottom">
      <div className="max-w-[425px] mx-auto px-5">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-4 transition-opacity duration-200 min-h-[44px] min-w-[44px]",
                  isActive 
                    ? "text-black opacity-100" 
                    : "text-[#8E8E93] opacity-60 hover:opacity-80 active:opacity-40"
                )}
              >
                <IconComponent 
                  className="w-6 h-6 mb-1" 
                  strokeWidth={1.5}
                />
                <span className="text-[12px] font-medium tracking-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
