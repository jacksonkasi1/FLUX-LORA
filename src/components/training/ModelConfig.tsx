
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ModelConfigProps {
  onConfigChange: (config: ModelConfig) => void;
  initialConfig?: Partial<ModelConfig>;
}

export interface ModelConfig {
  name: string;
  triggerWord: string;
  description: string;
}

export const ModelConfig = ({ onConfigChange, initialConfig }: ModelConfigProps) => {
  const [config, setConfig] = useState<ModelConfig>({
    name: initialConfig?.name || '',
    triggerWord: initialConfig?.triggerWord || '',
    description: initialConfig?.description || '',
  });

  const handleChange = (field: keyof ModelConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const generateTriggerWord = () => {
    const suggestions = [
      'mymodel',
      'mystyle',
      'myface',
      'mychar',
      'myobj',
      config.name.toLowerCase().replace(/\s+/g, '')
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    handleChange('triggerWord', randomSuggestion);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="e.g., My Portrait Style"
              value={config.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Give your model a descriptive name
            </p>
          </div>

          <div>
            <Label htmlFor="trigger-word">Trigger Word</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="trigger-word"
                placeholder="e.g., myportrait"
                value={config.triggerWord}
                onChange={(e) => handleChange('triggerWord', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateTriggerWord}
                className="shrink-0"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A unique word to activate your model in prompts
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this model is for..."
              value={config.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
