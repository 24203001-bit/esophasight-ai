import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileImage, ImageIcon } from "lucide-react";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-xl border border-border bg-card overflow-hidden medical-card-shadow-lg"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/50">
          <FileImage className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate flex-1">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</span>
          {!isAnalyzing && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors group"
            >
              <X className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </motion.button>
          )}
        </div>
        <div className="relative bg-muted/30">
          <img src={preview} alt="Medical scan" className="w-full max-h-72 object-contain p-3" />
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/5 flex items-center justify-center"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-primary/20 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full w-1/3 bg-primary rounded-full"
                    animate={{ x: ["0%", "300%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card/90 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg border border-border"
                >
                  <p className="text-sm font-medium text-foreground">Analyzing scan...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer group
        ${isDragging ? "border-primary bg-medical-highlight" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
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
      <motion.div
        animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <ImageIcon className="h-7 w-7 text-primary/70 group-hover:text-primary transition-colors" />
        </div>
      </motion.div>
      <p className="text-sm font-semibold text-foreground">
        Drop medical image here
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        or click to browse your files
      </p>
      <div className="flex items-center justify-center gap-2 mt-4">
        {["Barium Swallow", "X-ray", "CT", "Endoscopy", "Manometry"].map((type) => (
          <span key={type} className="text-[10px] font-medium text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full">
            {type}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
