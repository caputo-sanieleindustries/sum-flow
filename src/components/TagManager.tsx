import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Tags } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", 
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"
];

export function TagManager() {
  const { tags, createTag, updateTag, deleteTag } = useTags();
  const [open, setOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      await createTag(newTagName.trim(), selectedColor);
      setNewTagName("");
      setSelectedColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    try {
      await updateTag(editingTag.id, editingTag.name.trim(), editingTag.color);
      setEditingTag(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingTagId) return;
    try {
      await deleteTag(deletingTagId);
      setDeletingTagId(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Tags className="mr-2 h-4 w-4" />
            Gestisci Tag
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-background">
          <DialogHeader>
            <DialogTitle>Gestisci Tag</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create new tag */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Crea nuovo tag</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="flex-1"
                />
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Tags list */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Tag esistenti ({tags.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    {editingTag?.id === tag.id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <Input
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                          className="flex-1"
                        />
                        <div className="flex gap-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setEditingTag({ ...editingTag, color })}
                              className={`w-6 h-6 rounded-full border ${
                                editingTag.color === color ? "border-foreground" : "border-border"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Button onClick={handleUpdate} size="sm" variant="outline">
                          Salva
                        </Button>
                        <Button onClick={() => setEditingTag(null)} size="sm" variant="ghost">
                          Annulla
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge style={{ backgroundColor: tag.color, color: "#fff" }}>
                          {tag.name}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTag(tag)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingTagId(tag.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nessun tag creato. Crea il tuo primo tag!
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTagId} onOpenChange={() => setDeletingTagId(null)}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo tag? Verrà rimosso da tutte le transazioni associate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
