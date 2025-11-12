import { useState, useEffect } from "react";
import { useTags, Tag } from "@/hooks/useTags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X, Tags } from "lucide-react";

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  transactionId?: string;
}

export function TagSelector({ selectedTagIds, onTagsChange, transactionId }: TagSelectorProps) {
  const { tags, getTransactionTags } = useTags();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (transactionId && open) {
      getTransactionTags(transactionId).then((transactionTags) => {
        onTagsChange(transactionTags.map(t => t.id));
      });
    }
  }, [transactionId, open]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Tags className="mr-2 h-4 w-4" />
            {selectedTags.length > 0 ? `${selectedTags.length} tag selezionati` : "Seleziona tag"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-background border-border" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Seleziona tag</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Badge style={{ backgroundColor: tag.color, color: "#fff" }}>
                      {tag.name}
                    </Badge>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun tag disponibile. Crea i tuoi tag prima!
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Display selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color, color: "#fff" }}
              className="pr-1"
            >
              {tag.name}
              <button
                onClick={(e) => removeTag(tag.id, e)}
                className="ml-2 hover:bg-black/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
