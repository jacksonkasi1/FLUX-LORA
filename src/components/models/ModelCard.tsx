
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, ImageIcon, Zap, AlertCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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

interface ModelCardProps {
  model: TrainingModel;
  onDelete: () => void;
  isDeleting: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: Zap,
        label: 'Ready',
        className: 'text-green-600 bg-green-50 border-green-200',
        dotColor: 'bg-green-500'
      };
    case 'training':
      return {
        icon: Clock,
        label: 'Training',
        className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        dotColor: 'bg-yellow-500'
      };
    case 'failed':
      return {
        icon: AlertCircle,
        label: 'Failed',
        className: 'text-red-600 bg-red-50 border-red-200',
        dotColor: 'bg-red-500'
      };
    default:
      return {
        icon: Clock,
        label: 'Pending',
        className: 'text-muted-foreground bg-secondary border-border',
        dotColor: 'bg-muted-foreground'
      };
  }
};

export const ModelCard = ({ model, onDelete, isDeleting }: ModelCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const statusConfig = getStatusConfig(model.status);
  const StatusIcon = statusConfig.icon;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-apple-sm transition-apple hover:shadow-apple-hover">
        <div className="flex items-start justify-between gap-apple-sm">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-title-2 font-apple text-foreground">{model.name}</h3>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-caption font-apple font-medium border",
                statusConfig.className
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
                <StatusIcon className="w-3 h-3" strokeWidth={2} />
                {statusConfig.label}
              </div>
            </div>

            {model.description && (
              <p className="text-body font-apple text-muted-foreground leading-relaxed">
                {model.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-apple-sm text-caption font-apple text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Trigger:</span>
                <code className="bg-secondary px-2 py-1 rounded font-mono text-primary">
                  {model.trigger_word}
                </code>
              </div>
              
              {model.image_count && (
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" strokeWidth={2} />
                  <span>{model.image_count} images</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" strokeWidth={2} />
                <span>{formatDate(model.created_at)}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="touch-target focus-ring haptic-light text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-apple rounded-full"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md mx-4 rounded-xl border shadow-lg">
          <AlertDialogHeader className="text-center space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Delete Model?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 leading-relaxed">
              Are you sure you want to delete this model? This action cannot be undone and all training data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex-row gap-3 justify-center pt-2">
            <AlertDialogCancel className="mt-0 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-xl px-6 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl px-6 font-medium"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
