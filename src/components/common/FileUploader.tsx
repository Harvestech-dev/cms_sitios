import React, { useState } from 'react';
import { Chip } from '@/components/common/Chip';
import { supabase } from '@/lib/supabase';

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleUpload = async (file: File) => {
    // ... lógica de subida ...
    
    // Agregar categorías al registro en la base de datos
    await supabase
      .from('media')
      .insert({
        // ... otros campos ...
        categories: selectedCategories
      });
  };

  return (
    <div>
      {/* ... UI de subida ... */}
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