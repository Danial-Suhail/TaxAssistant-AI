"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);

      // Simulate file upload
      setTimeout(() => {
        setIsUploading(false);
        setOpen(false);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded and is being analyzed.`,
        });
      }, 1500);
    }
  };

  return (
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

                {/* Label wraps button for proper file selection */}
                <input   id="file-upload"
                    type="file"
                    hidden/>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100">
                    Select File
                  </Button>
                  
                  
                  
                </label>
                
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Your documents are encrypted and processed securely. We never store your sensitive information.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
