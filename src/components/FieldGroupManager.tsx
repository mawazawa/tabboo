import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Download, Upload, Trash2, Play, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  getStoredGroups,
  saveGroup,
  deleteGroup,
  exportGroup,
  importGroup,
  createRelativePositions,
  type FieldGroup,
} from '@/utils/fieldGroupManager';

interface FieldGroupManagerProps {
  selectedFields: string[];
  fieldPositions: Record<string, { top: number; left: number }>;
  onApplyGroup: (groupPositions: Record<string, { top: number; left: number }>) => void;
  triggerless?: boolean;
}

export const FieldGroupManager = ({
  selectedFields,
  fieldPositions,
  onApplyGroup,
  triggerless = false,
}: FieldGroupManagerProps) => {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Record<string, FieldGroup>>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    setGroups(getStoredGroups());
  };

  const handleSaveGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    const relativeFields = createRelativePositions(selectedFields, fieldPositions);
    
    const newGroup: FieldGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      description: newGroupDescription || undefined,
      createdAt: new Date().toISOString(),
      fields: relativeFields,
    };

    saveGroup(newGroup);
    loadGroups();
    setNewGroupName('');
    setNewGroupDescription('');
    toast.success(`Group "${newGroupName}" saved with ${selectedFields.length} fields`);
  };

  const handleApplyGroup = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;

    if (selectedFields.length === 0) {
      toast.error('Please select target fields to apply the group to');
      return;
    }

    if (selectedFields.length < group.fields.length) {
      toast.warning(`Group has ${group.fields.length} fields but only ${selectedFields.length} selected. Some fields will be skipped.`);
    }

    // Use the first selected field's position as anchor
    const anchorField = selectedFields[0];
    const anchorPos = fieldPositions[anchorField];
    
    if (!anchorPos) {
      toast.error('Cannot find position of anchor field');
      return;
    }

    // Create new positions for selected fields based on group pattern
    const newPositions: Record<string, { top: number; left: number }> = {};
    
    group.fields.forEach((groupField, index) => {
      if (index < selectedFields.length) {
        const targetField = selectedFields[index];
        newPositions[targetField] = {
          top: anchorPos.top + groupField.relativeTop,
          left: anchorPos.left + groupField.relativeLeft,
        };
      }
    });

    onApplyGroup(newPositions);
    toast.success(`Applied group "${group.name}" to ${Object.keys(newPositions).length} fields`);
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;
    
    if (window.confirm(`Delete group "${group.name}"?`)) {
      deleteGroup(groupId);
      loadGroups();
      toast.success('Group deleted');
    }
  };

  const handleExportGroup = (groupId: string) => {
    const group = groups[groupId];
    if (!group) return;
    
    exportGroup(group);
    toast.success('Group exported');
  };

  const handleImportGroup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const group = await importGroup(file);
      saveGroup(group);
      loadGroups();
      toast.success(`Group "${group.name}" imported`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import group');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const content = (
    <div className="space-y-6">
      {/* Save New Group */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Save Selected Fields as Group</h3>
        <div className="space-y-2">
          <Input
            placeholder="Group name (e.g., 'Address Block')"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveGroup}
              disabled={!newGroupName.trim() || selectedFields.length === 0}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Save Group ({selectedFields.length} fields)
            </Button>
            <label htmlFor="import-group-file">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
            </label>
            <input
              id="import-group-file"
              type="file"
              accept=".json"
              onChange={handleImportGroup}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Saved Groups */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Saved Groups ({Object.keys(groups).length})</h3>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {Object.values(groups).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No saved groups yet. Select fields and save them as a group.
              </p>
            ) : (
              Object.values(groups).map((group) => (
                <div
                  key={group.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedGroupId === group.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      {group.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.fields.length} fields • {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyGroup(group.id);
                        }}
                        disabled={selectedFields.length === 0}
                        title="Apply to selected fields"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportGroup(group.id);
                        }}
                        title="Export group"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                        title="Delete group"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {selectedFields.length > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Tip:</strong> With {selectedFields.length} field(s) selected, you can save them as a group or apply an existing group pattern to them.
        </div>
      )}
    </div>
  );

  if (triggerless) {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4 mr-2" />
          Field Groups
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Field Group Manager</DialogTitle>
          <DialogDescription>
            Save sets of fields as reusable groups. Apply groups to repeat patterns across forms.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
