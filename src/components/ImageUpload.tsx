import { useCallback, useState } from "react";
import { Upload, X, FileImage } from "lucide-react";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

export function ImageUpload({ onFileSelect, isAnalyzing, selectedFile, onClear }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFileSelect(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = () => {
    setPreview(null);
    onClear();
  };

  if (preview && selectedFile) {
    return (
      <div className="relative rounded-lg border border-border bg-card overflow-hidden medical-card-shadow">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-medical-surface">
          <FileImage className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate flex-1">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</span>
          {!isAnalyzing && (
            <button onClick={handleClear} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="relative">
          <img src={preview} alt="Medical scan" className="w-full max-h-80 object-contain bg-medical-navy/5 p-2" />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/30 overflow-hidden">
                <div className="h-full w-1/3 bg-primary animate-scan-line rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-lg border-2 border-dashed p-10 text-center transition-all cursor-pointer
        ${isDragging ? "border-primary bg-medical-highlight" : "border-border hover:border-primary/50 hover:bg-medical-surface"}`}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        Drop medical image here or click to browse
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Barium swallow, X-ray, CT, endoscopy, or manometry images
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        JPEG, PNG, WEBP supported
      </p>
    </div>
  );
}
