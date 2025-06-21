import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Key, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const ApiKeyConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, [user]);

  const loadApiKey = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('fal_api_key')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading API key:', error);
        return;
      }

      if (data?.fal_api_key) {
        setHasExistingKey(true);
        setApiKey('••••••••••••••••••••••••••••••••••••••••'); // Masked display
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async () => {
    if (!user) return;

    if (!apiKey || apiKey.includes('•')) {
      toast({
        title: "Invalid API key",
        description: "Please enter a valid FAL.AI API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use upsert to handle existing records
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          fal_api_key: apiKey,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        toast({
          title: "Error saving API key",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setHasExistingKey(true);
        setApiKey('••••••••••••••••••••••••••••••••••••••••');
        setShowApiKey(false);
        toast({
          title: "API key saved",
          description: "Your FAL.AI API key has been saved securely.",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving API key",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const clearApiKey = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ fal_api_key: null })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error removing API key",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setHasExistingKey(false);
        setApiKey('');
        toast({
          title: "API key removed",
          description: "Your FAL.AI API key has been removed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error removing API key",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5" />
          <h3 className="text-lg font-semibold">FAL.AI API Key</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Your API key is required for model training and image generation. 
          It's stored securely and encrypted.
        </p>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="fal-api-key">API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="fal-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Enter your FAL.AI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isLoading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={saveApiKey} disabled={isLoading}>
            {hasExistingKey ? 'Update API Key' : 'Save API Key'}
          </Button>
          
          {hasExistingKey && (
            <Button variant="outline" onClick={clearApiKey} disabled={isLoading}>
              Remove Key
            </Button>
          )}
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-foreground text-sm mb-2">
            <strong>Need an API key?</strong>
          </p>
          <a
            href="https://fal.ai/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 text-sm flex items-center space-x-1 underline"
          >
            <span>Get your API key from FAL.AI Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};
