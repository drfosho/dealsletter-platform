'use client';

import { useState, useRef, DragEvent } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      (file.type === 'image/jpeg' || file.type === 'image/jpg' || 
       file.type === 'image/png' || file.type === 'image/webp')
    );

    if (imageFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, or WEBP)');
      return;
    }

    // Check max images limit
    if (images.length + imageFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.paths) {
        onImagesChange([...images, ...result.paths]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging 
            ? 'border-accent bg-accent/5' 
            : 'border-border/60 hover:border-accent/50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-3">
          <svg className="w-12 h-12 mx-auto text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <div>
            <p className="text-lg font-medium text-primary">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted mt-1">
              or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-accent hover:text-accent/80 font-medium"
                disabled={isUploading}
              >
                browse files
              </button>
            </p>
          </div>
          
          <p className="text-xs text-muted">
            Supports JPG, PNG, WEBP • Max {maxImages} images • Max 10MB per file
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-accent mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-primary">Uploading images...</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted mb-2">
            Uploaded Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg border border-border/60">
                <div className="relative w-full h-32 bg-muted/10">
                  <Image
                    src={image}
                    alt={`Property image ${index + 1}`}
                    width={200}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}