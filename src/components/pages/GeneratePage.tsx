import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wand2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { generateImageWithModel } from '@/services/imageGeneration';
import type { TrainingModel } from '@/types';

export const GeneratePage = () => {
  const { user } = useAuth();
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);

  // Fetch completed models
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['completed-models', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const data = await apiClient.get('/training-models');
      
      // Filter completed models with model URLs on the client side
      return (data as TrainingModel[]).filter(model => 
        model.status === 'completed' && model.model_url
      );
    },
    enabled: !!user,
  });

  const selectedModel = models?.find(m => m.id === selectedModelId);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !user) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await generateImageWithModel(
        {
          prompt: prompt.trim(),
          modelUrl: selectedModel.model_url!,
          triggerWord: selectedModel.trigger_word,
        },
        user.id,
        selectedModel.id
      );

      setGeneratedImage(result);
    } catch (error: unknown) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to generate images with your trained models.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Wand2 className="h-8 w-8" />
          Generate Images
        </h1>
        <p className="text-muted-foreground">
          Create stunning images using your trained LoRA models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generation Settings
            </CardTitle>
            <CardDescription>
              Configure your image generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model-select">Select Model</Label>
              <Select
                value={selectedModelId}
                onValueChange={setSelectedModelId}
                disabled={modelsLoading}
              >
                <SelectTrigger id="model-select">
                  <SelectValue placeholder={
                    modelsLoading ? "Loading models..." : "Choose a trained model"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {models?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.trigger_word})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder={selectedModel ? 
                  `Describe your image... (use "${selectedModel.trigger_word}" to activate your trained style)` :
                  "Select a model first..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!selectedModel}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedModel || !prompt.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <img 
                  src={generatedImage.imageUrl} 
                  alt="Generated" 
                  className="w-full rounded-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Seed: {generatedImage.seed}
                </p>
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  {isGenerating ? 'Generating...' : 'Generated image will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
