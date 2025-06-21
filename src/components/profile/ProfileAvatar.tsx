
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAvatarProps {
  user: any;
  displayName: string;
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileAvatar = ({ user, displayName, avatarUrl, onAvatarUpdate }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Use upsert to handle existing records
      const { error: updateError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {displayName ? displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <label 
          htmlFor="avatar-upload" 
          className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-600 transition-colors"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </div>
      <div>
        <p className="text-sm text-gray-600">Profile Picture</p>
        <p className="text-xs text-gray-500">Click the camera icon to upload</p>
      </div>
    </div>
  );
};
