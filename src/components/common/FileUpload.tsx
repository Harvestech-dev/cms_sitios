'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import IconRenderer from './IconRenderer';
import { supabase } from '@/lib/supabase';
import type { MediaFile } from '@/types/media';

interface FileUploadProps {
  onUploadComplete?: (file: MediaFile) => void;
  onError?: (error: Error) => void;
}

export default function FileUpload({ onUploadComplete, onError }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setUploading(true);
      
      for (const file of acceptedFiles) {
        setProgress(0);
        
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        try {
          // Generar un nombre único para el archivo
          const fileName = `${Date.now()}-${file.name}`;
          const storagePath = `uploads/${fileName}`;

          // Subir archivo al storage
          const { error: storageError } = await supabase
            .storage
            .from('media')
            .upload(storagePath, file);

          if (storageError) throw storageError;

          // Obtener la URL pública
          const { data: { publicUrl } } = supabase
            .storage
            .from('media')
            .getPublicUrl(storagePath);

          // Crear registro en la base de datos
          const { data: mediaFile, error: dbError } = await supabase
            .from('media_files')
            .insert({
              name: file.name,
              type: file.type,
              size: file.size,
              storage_path: storagePath,
              url: publicUrl,
              alt: file.name
            })
            .select()
            .single();

          if (dbError) throw dbError;

          clearInterval(progressInterval);
          setProgress(100);

          handleUploadComplete(mediaFile);
        } catch (error) {
          clearInterval(progressInterval);
          handleError(error);
        }
      }
    } catch (error) {
      console.error('Error detallado:', error);
      handleError(error instanceof Error ? error : new Error('Error desconocido'));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleUploadComplete = (mediaFile: MediaFile) => {
    if (onUploadComplete) {
      onUploadComplete(mediaFile);
    }
  };

  const handleError = (error: unknown) => {
    if (onError) {
      onError(error instanceof Error ? error : new Error('Error desconocido'));
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center w-full
        ${isDragActive ? 'border-blue-500 bg-blue-50/5' : 'border-gray-600'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700/50'}
        transition-all duration-200 ease-in-out
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <IconRenderer
          icon={isDragActive ? 'FaCloudUploadAlt' : 'FaFileUpload'}
          className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
        />
        
        {uploading ? (
          <div className="w-full max-w-xs">
            <div className="text-sm text-gray-300 mb-2">Subiendo... {progress}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-gray-300">
            {isDragActive ? (
              <p>Suelta los archivos aquí...</p>
            ) : (
              <>
                <p className="font-medium">Arrastra archivos aquí</p>
                <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 