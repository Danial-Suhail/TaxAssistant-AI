"use client";

import { useState, useRef, useEffect } from "react";
import { FileUp, Image as ImageIcon, FileText, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  clearPreview?: boolean;
}

export default function FileUpload({ onFileSelect, clearPreview }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (clearPreview) {
      setFileName(null);
      setFileType(null);
    }
  }, [clearPreview]);

  const isAcceptableFile = (file: File) => {
    return file.type.startsWith("image/") || file.type === "application/pdf" || file.type.startsWith("text/");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        const fileType = item.type;
        if (fileType.startsWith("image/") || fileType === "application/pdf") {
          setIsDragActive(true);
        }
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (isAcceptableFile(file)) {
        setIsUploading(true);
        setFileName(file.name);
        setFileType(file.type);
        await onFileSelect(file);
        setOpen(false);
        setIsUploading(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setFileName(file.name);
        setFileType(file.type);
        await onFileSelect(file); // In case onFileSelect is async
        setOpen(false); // Close dialog after selection
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="border-gray-300 hover:bg-teal-50"
          >
            <FileUp className="h-4 w-4 text-teal-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Tax Document</DialogTitle>
          </DialogHeader>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
            ${isDragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-300'}
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-pulse mb-2">
                  <FileUp className="h-10 w-10 text-teal-500" />
                </div>
                <p className="text-sm text-gray-500">Uploading {fileName}...</p>
              </div>
            ) : (
              <>
                <FileUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop your W-2, 1099, or other tax documents
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Supports PDF, JPG, PNG, TXT (max 10MB)
                </p>
                <input
                  type="file"
                  accept="image/*,text/*,application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </label>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {fileName && (
        <div className="flex items-center gap-2 bg-teal-50 px-2 py-1 rounded-md">
          {fileType?.includes('image') ? (
            <ImageIcon className="h-4 w-4 text-teal-600" />
          ) : fileType === 'application/pdf' ? (
            <FileIcon className="h-4 w-4 text-red-600" />
          ) : (
            <FileText className="h-4 w-4 text-teal-600" />
          )}
          <span className="text-xs text-teal-600 truncate max-w-[100px]">
            {fileName}
          </span>
        </div>
      )}
    </>
  );
}
