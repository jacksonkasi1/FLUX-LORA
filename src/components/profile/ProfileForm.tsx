
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormProps {
  user: any;
  displayName: string;
  avatarUrl: string;
  onDisplayNameChange: (name: string) => void;
}

export const ProfileForm = ({ user, displayName, avatarUrl, onDisplayNameChange }: ProfileFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Use upsert to handle existing records
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ''}
          disabled
          className="mt-1 bg-gray-50"
        />
      </div>

      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className="mt-1"
          placeholder="Enter your display name"
        />
      </div>

      <Button onClick={updateProfile} disabled={loading} className="w-full">
        {loading ? 'Updating...' : 'Update Profile'}
      </Button>
    </div>
  );
};
