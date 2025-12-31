import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FileUploadProps {
  planetId: string;
  onUploadComplete: (source: {
    title: string;
    url: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }) => void;
  onCancel?: () => void;
  planetColor?: string;
}

export function FileUpload({ planetId, onUploadComplete, onCancel, planetColor }: FileUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, [title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setProgress(10);

    try {
      // Generate unique file path: userId/planetId/timestamp-filename
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${planetId}/${timestamp}-${sanitizedFileName}`;

      setProgress(30);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('source-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(70);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('source-files')
        .getPublicUrl(filePath);

      setProgress(100);

      onUploadComplete({
        title: title.trim() || file.name,
        url: publicUrl,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
      });

      // Reset state
      setFile(null);
      setTitle('');
      setProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearFile = () => {
    setFile(null);
    setTitle('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title input */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">
          Title <span className="text-xs">(optional, defaults to file name)</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Lecture Notes Week 5"
          disabled={uploading}
        />
      </div>

      {/* Drop zone or file preview */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }
          `}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-foreground font-medium mb-1">
            Drop a file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, images, or any document type
          </p>
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-muted/20 overflow-hidden">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="font-medium text-foreground text-sm truncate max-w-full">{file.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {formatFileSize(file.size)} • {file.type || 'Unknown type'}
              </p>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="shrink-0 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mt-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: planetColor }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Uploading... {progress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{ backgroundColor: planetColor }}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload & Save'
          )}
        </Button>
      </div>
    </div>
  );
}
