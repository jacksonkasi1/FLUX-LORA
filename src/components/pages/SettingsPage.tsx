
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { ApiKeyConfig } from '@/components/settings/ApiKeyConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

// ** import api
import { apiClient } from '@/lib/api';

export const SettingsPage = () => {
  const { user } = useAuth();
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
        
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

      <ApiKeyConfig />

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Change Password</h3>
        <PasswordChangeForm />
      </Card>
    </div>
  );
};
