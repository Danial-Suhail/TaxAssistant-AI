"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { FileUp, Image as ImageIcon, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  clearPreview?: boolean; // Add this prop
}

export default function FileUpload({ onFileSelect, clearPreview }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add useEffect to clear preview when clearPreview changes
  useEffect(() => {
    if (clearPreview) {
      setFileName(null);
      setFileType(null);
    }
  }, [clearPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type);
      onFileSelect(file); // Pass the file back to parent
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept="image/*,text/*,application/pdf"  // Add PDF mime type
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleUploadClick}
        className="text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100 focus:outline-none mr-3"
        aria-label="Upload Files"
      >
        <FileUp className="h-5 w-5" />
      </button>
      
      {fileName && (
        <div className="flex items-center gap-2 bg-teal-50 px-2 py-1 rounded-md">
          {fileType?.includes('image') ? (
            <ImageIcon className="h-4 w-4 text-teal-600" />
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
