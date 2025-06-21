
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ModelCard } from "@/components/models/ModelCard";
import { ModelDetailView } from "@/components/models/ModelDetailView";

interface TrainingModel {
  id: string;
  name: string;
  description?: string;
  status: string;
  trigger_word: string;
  image_count?: number;
  created_at: string;
  updated_at: string;
}

export const ModelsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const { data: models, isLoading } = useQuery({
    queryKey: ['training-models', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingModel[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const { error } = await supabase
        .from('training_models')
        .delete()
        .eq('id', modelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-models'] });
      toast({
        title: "Model deleted",
        description: "The model has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting model",
        description: error.message || "Failed to delete the model.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteModel = (modelId: string) => {
    deleteMutation.mutate(modelId);
  };

  const handleModelClick = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  // Show detail view if a model is selected
  if (selectedModelId) {
    return (
      <ModelDetailView 
        modelId={selectedModelId} 
        onBack={() => setSelectedModelId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-sm">
        <h2 className="text-large-title font-apple text-foreground">Models</h2>
        <div className="space-y-apple-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-xl p-apple-sm space-y-3">
              <div className="h-6 skeleton rounded"></div>
              <div className="h-4 skeleton rounded w-2/3"></div>
              <div className="h-4 skeleton rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-apple-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-apple-sm">
            <Bot className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2 max-w-sm">
            <h3 className="text-title-1 font-apple text-foreground">No Models Yet</h3>
            <p className="text-body font-apple text-muted-foreground leading-relaxed">
              Start by training your first model to create custom AI image generators
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-large-title font-apple text-foreground">Models</h2>
        <span className="text-caption font-apple text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {models.length} model{models.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-apple-sm">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => handleModelClick(model.id)}
            className="cursor-pointer"
          >
            <ModelCard
              model={model}
              onDelete={() => handleDeleteModel(model.id)}
              isDeleting={deleteMutation.isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
