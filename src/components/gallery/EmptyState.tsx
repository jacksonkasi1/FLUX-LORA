
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();

  const handleTrainClick = () => {
    navigate('/train');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-[280px] text-center space-y-8">
        <div className="space-y-6">
          <h3 className="text-[28px] font-medium text-black leading-tight tracking-tight">
            Your Gallery Awaits
          </h3>
          <p className="text-[16px] text-[#8E8E93] leading-relaxed">
            Start by training your first model to generate amazing AI images
          </p>
        </div>
        
        <Button 
          onClick={handleTrainClick}
          className="w-full h-[50px] bg-black text-white text-[16px] font-medium rounded-[25px] border-none hover:opacity-80 active:opacity-60 transition-opacity duration-200"
        >
          <Plus className="w-5 h-5 mr-3" strokeWidth={2} />
          Train Your First Model
        </Button>
      </div>
    </div>
  );
};
