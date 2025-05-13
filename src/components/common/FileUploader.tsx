'use client';

import { useState } from 'react';
import { Chip } from '@/components/common/Chip';
import { supabase } from '@/lib/supabase';

interface FileUploaderProps {
  onComplete: (url: string) => void;
  onError: (error: Error) => void;
}

export default function FileUploader({ onComplete, onError }: FileUploaderProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`uploads/${file.name}`, file);

      if (error) throw error;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(data.path);
          
        onComplete(publicUrl);
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      onError(error as Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        disabled={uploading}
      />
      <div className="bg-gray-700 px-4 py-2 rounded text-center">
        {uploading ? 'Subiendo...' : 'Subir archivo'}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Categorías</h4>
        <div className="flex flex-wrap gap-2">
          {MEDIA_CATEGORIES.map(category => (
            <Chip
              key={category}
              label={category}
              selected={selectedCategories.includes(category)}
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category)
                    ? prev.filter(c => c !== category)
                    : [...prev, category]
                );
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 