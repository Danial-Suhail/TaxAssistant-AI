"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Image as ImageIcon, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { chat } from "@/actions/chat";

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFileName(file.name);
        setFileType(file.type);
        setIsUploading(true);

        try {
            // Read file content
            const content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target?.result as string);
                };
                reader.readAsText(file);
            });

            // Send file content to chat
            await chat([], content);

            toast({
                title: "File uploaded successfully",
                description: "Your document has been processed and is ready for analysis.",
                duration: 3000,
            });
        } catch (error) {
            console.error("File processing error:", error);
            toast({
                title: "Error processing file",
                description: "There was an error reading your file.",
            });
        } finally {
            setIsUploading(false);
            setOpen(false);
        }
    }
};

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="icon" className="border-gray-300 hover:bg-teal-50">
            <FileUp className="h-4 w-4 text-teal-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Tax Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                  <p className="text-sm text-gray-500 mb-2">Drag and drop your W-2, 1099, or other tax documents</p>
                  <p className="text-xs text-gray-400 mb-4">Supports PDF, JPG, PNG (max 10MB)</p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100"
                    onClick={handleButtonClick}
                  >
                    Select File
                  </Button>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Your documents are encrypted and processed securely. We never store your sensitive information.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {fileName && !isUploading && (
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
    </div>
  );
};
