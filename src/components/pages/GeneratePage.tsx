import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Download, Settings, Image as ImageIcon, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateImageWithModel, GenerateImageParams } from "@/services/imageGeneration";
import { cn } from "@/lib/utils";

interface TrainingModel {
  id: string;
  name: string;
  trigger_word: string;
  model_url: string;
  status: string;
}

export const GeneratePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numSteps, setNumSteps] = useState(28);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  // Fetch completed models
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['completed-models', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_models')
        .select('id, name, trigger_word, model_url, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('model_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingModel[];
    },
    enabled: !!user,
  });

  // Image generation mutation
  const generateMutation = useMutation({
    mutationFn: async (params: GenerateImageParams & { modelId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { modelId, ...genParams } = params;
      return await generateImageWithModel(genParams, user.id, modelId);
    },
    onSuccess: (result) => {
      setGeneratedImages(prev => [result, ...prev]);
      toast({
        title: "Image generated successfully!",
        description: "Your new image has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedModel = models?.find(m => m.id === selectedModelId);

  const handleGenerate = () => {
    if (!selectedModel) {
      toast({
        title: "No model selected",
        description: "Please select a trained model first.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      modelId: selectedModel.id,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      modelUrl: selectedModel.model_url,
      triggerWord: selectedModel.trigger_word,
      numInferenceSteps: numSteps,
      guidanceScale: guidanceScale,
    });
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image.",
        variant: "destructive",
      });
    }
  };

  if (modelsLoading) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-sm">
        <div className="text-center space-y-apple-sm">
          <h2 className="text-large-title font-apple text-foreground">Generate</h2>
          <p className="text-body font-apple text-muted-foreground">Loading your trained models...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="container mx-auto px-apple-sm py-apple-sm space-y-apple-lg">
        <div className="text-center space-y-2">
          <h2 className="text-large-title font-apple text-foreground">Generate</h2>
          <p className="text-body font-apple text-muted-foreground">Create images with your trained models</p>
        </div>
        
        <div className="apple-card p-apple-lg">
          <div className="text-center py-apple-xl space-y-apple-sm">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-title-2 font-apple text-foreground">No Models Ready</h3>
              <p className="text-body font-apple text-muted-foreground max-w-sm mx-auto">
                Train a model first, then come back here to generate amazing images
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="container mx-auto px-apple-sm py-apple-sm">
        <div className="text-center space-y-2">
          <h2 className="text-large-title font-apple text-foreground">Generate</h2>
          <p className="text-body font-apple text-muted-foreground">Create images with AI</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 container mx-auto px-apple-sm pb-apple-sm space-y-apple-sm">
        {/* Model Selection */}
        <div className="apple-card p-apple-sm space-y-3">
          <Label className="text-body font-apple text-foreground">Model</Label>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-full h-12 rounded-apple border-border focus:ring-foreground">
              <SelectValue placeholder="Choose a trained model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-apple">{model.name}</span>
                    <code className="bg-secondary px-2 py-0.5 rounded text-caption font-apple">
                      {model.trigger_word}
                    </code>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModel && (
            <p className="text-caption font-apple text-muted-foreground">
              Use "{selectedModel.trigger_word}" in your prompt to activate the model
            </p>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="apple-card">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-apple-sm flex items-center justify-between text-left focus-ring rounded-apple transition-apple haptic-light"
          >
            <span className="text-body font-apple text-foreground">Advanced Settings</span>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {showAdvanced && (
            <div className="px-apple-sm pb-apple-sm space-y-apple-sm border-t border-border">
              <div className="space-y-3">
                <Label className="text-body font-apple text-foreground">
                  Steps: {numSteps}
                </Label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={numSteps}
                  onChange={(e) => setNumSteps(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer slider"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-body font-apple text-foreground">
                  Guidance Scale: {guidanceScale}
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer slider"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-body font-apple text-foreground">Negative Prompt</Label>
                <Textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What you don't want to see..."
                  className="min-h-20 rounded-apple border-border focus:ring-foreground font-apple resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-apple-sm">
            <h3 className="text-title-2 font-apple text-foreground">Recent Generations</h3>
            <div className="masonry-grid">
              {generatedImages.map((image, index) => (
                <div key={index} className="masonry-item">
                  <div className="apple-card group">
                    <div className="relative">
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-auto object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(image.image_url, image.prompt)}
                        className="absolute top-2 right-2 p-2 h-auto w-auto rounded-full backdrop-blur-apple bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-apple"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-apple-sm">
                      <p className="text-caption font-apple text-muted-foreground line-clamp-2">
                        {image.prompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ChatGPT-inspired Prompt Input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-apple border-t border-border safe-area-bottom">
        <div className="container mx-auto px-apple-sm py-apple-sm">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full min-h-12 max-h-32 pr-14 rounded-[20px] border-border focus:ring-foreground font-apple resize-none bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <Button
              onClick={handleGenerate}
              disabled={!selectedModel || !prompt.trim() || generateMutation.isPending}
              className={cn(
                "absolute right-2 bottom-2 w-8 h-8 rounded-full p-0 transition-apple haptic-medium focus-ring",
                (!selectedModel || !prompt.trim() || generateMutation.isPending)
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {generateMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
