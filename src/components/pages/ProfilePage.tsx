
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';

// ** import api
import { apiClient } from '@/lib/api';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const data = await apiClient.get('/user-settings');

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Manage your account information</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        
        <ProfileAvatar
          user={user}
          displayName={displayName}
          avatarUrl={avatarUrl}
          onAvatarUpdate={setAvatarUrl}
        />

        <ProfileForm
          user={user}
          displayName={displayName}
          avatarUrl={avatarUrl}
          onDisplayNameChange={setDisplayName}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <PasswordChangeForm />
      </Card>
    </div>
  );
};
