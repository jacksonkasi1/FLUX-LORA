
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DangerZoneProps {
  onDeleteAccount: () => Promise<void>;
}

export const DangerZone = ({ onDeleteAccount }: DangerZoneProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      await onDeleteAccount();
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      
      <Button 
        onClick={handleDeleteAccount} 
        disabled={loading} 
        variant="destructive"
        className="w-full"
      >
        {loading ? 'Processing...' : 'Delete Account'}
      </Button>
    </div>
  );
};
