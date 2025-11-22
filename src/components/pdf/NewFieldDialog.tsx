import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DrawnRect } from "@/hooks/use-field-drawing";
import { useState, useEffect } from "react";

interface NewFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rect: DrawnRect & { page: number } | null;
  onSave: (field: { name: string; type: string; rect: DrawnRect }) => void;
}

export function NewFieldDialog({ open, onOpenChange, rect, onSave }: NewFieldDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("input");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setType("input");
    }
  }, [open]);

  const handleSave = () => {
    if (rect && name) {
      onSave({ name, type, rect });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Field (Page {rect?.page})</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Field Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., item1a_name"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="input">Input (Text)</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="textarea">Textarea (Multi-line)</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="signature">Signature</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {rect && (
            <div className="text-xs text-muted-foreground col-span-4 text-center mt-2 font-mono">
              Position: Top {rect.top.toFixed(2)}%, Left {rect.left.toFixed(2)}% <br/>
              Size: {rect.width.toFixed(2)}% x {rect.height.toFixed(2)}%
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name}>Save Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

