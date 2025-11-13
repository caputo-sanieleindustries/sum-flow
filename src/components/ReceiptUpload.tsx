import { useState } from "react";
import { FileUp, X, FileText, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReceiptUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemove: () => void;
  uploading?: boolean;
}

export function ReceiptUpload({ 
  onFileSelect, 
  selectedFile, 
  onRemove,
  uploading = false 
}: ReceiptUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  if (selectedFile) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {getFileIcon(selectedFile.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-colors",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="receipt-upload"
        className="hidden"
        onChange={handleChange}
        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
      />
      <label
        htmlFor="receipt-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <FileUp className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Trascina un file o clicca per selezionare
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP o PDF (max 5MB)
          </p>
        </div>
      </label>
    </div>
  );
}
