import { useState } from 'react';
import { X, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Subject } from '@/data/subjects';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SubjectPanelProps {
  subject: Subject | null;
  onClose: () => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
}

export const SubjectPanel = ({ subject, onClose, onDelete, onRename }: SubjectPanelProps) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState('');

  if (!subject) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(subject.name);
    setShowDeleteConfirm(false);
  };

  const handleRenameClick = () => {
    setNewName(subject.name);
    setShowRenameDialog(true);
  };

  const handleConfirmRename = () => {
    if (newName.trim() && newName.trim() !== subject.name) {
      onRename(subject.name, newName.trim());
    }
    setShowRenameDialog(false);
  };

  return (
    <>
      <div className="fixed right-0 top-0 h-full w-96 z-50 animate-slide-in">
        <div className="h-full glass-panel m-4 p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div 
                className="w-12 h-12 rounded-full mb-3"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${subject.color}ee, ${subject.color}aa)`,
                  boxShadow: `0 0 20px ${subject.color}50`,
                }}
              />
              <h2 className="font-display text-2xl font-bold text-foreground">
                {subject.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                Last active: {subject.lastActiveDaysAgo === 0 ? 'Today' : `${subject.lastActiveDaysAgo} days ago`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Planet Options */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRenameClick}
              className="flex-1"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="glass-panel p-4 mb-6 bg-secondary/30">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keep this planet close by doing an assignment, study session, or project in <span className="text-foreground font-medium">{subject.name}</span>.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass-panel p-3 text-center">
                <div className="text-2xl font-display font-bold text-foreground">
                  {subject.stats.assignmentsCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Assignments</div>
              </div>
              <div className="glass-panel p-3 text-center">
                <div className="text-2xl font-display font-bold text-foreground">
                  {subject.stats.studySessions}
                </div>
                <div className="text-xs text-muted-foreground">Study Sessions</div>
              </div>
              <div className="glass-panel p-3 text-center">
                <div className="text-2xl font-display font-bold text-foreground">
                  {subject.stats.projects}
                </div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => navigate(`/astar-ai?subject=${encodeURIComponent(subject.name)}`)}
            >
              Open ASTAR.AI for this subject
            </Button>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/board?subject=${encodeURIComponent(subject.name)}`)}
            >
              View assignments on Board
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="glass-panel border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {subject.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this planet from your solar system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="glass-panel border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename Planet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter new name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
              className="bg-background/50 border-border"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
