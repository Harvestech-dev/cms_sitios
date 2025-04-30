'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface MediaFile {
  id: string;
  url: string;
  alt: string;
  name: string;
  type: string;
  created_at: string;
  storage_path: string;
}

interface MediaContextType {
  files: MediaFile[];
  images: MediaFile[];
  videos: MediaFile[];
  documents: MediaFile[];
  loading: boolean;
  error: Error | null;
  refreshMedia: () => Promise<void>;
  addFile: (file: MediaFile) => void;
  deleteFile: (fileId: string) => Promise<void>;
  updateFile: (fileId: string, data: Partial<MediaFile>) => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data: mediaFiles, error: mediaError } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (mediaError) {
        throw mediaError;
      }

      const filesWithUrls = await Promise.all(
        (mediaFiles || []).map(async (file) => {
          let url = file.url;

          // Si tenemos storage_path, obtenemos la URL pública
          if (file.storage_path) {
            const { data } = supabase
              .storage
              .from('media')
              .getPublicUrl(file.storage_path);
            
            url = data.publicUrl;
          }

          return {
            ...file,
            url,
            alt: file.alt || file.name
          };
        })
      );

      console.log('Files cargados:', filesWithUrls); // Para debug
      setFiles(filesWithUrls);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar archivos'));
      console.error('Error al cargar archivos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const addFile = (newFile: MediaFile) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const deleteFile = async (fileId: string) => {
    try {
      const fileToDelete = files.find(f => f.id === fileId);
      if (!fileToDelete?.storage_path) {
        throw new Error('Archivo no encontrado');
      }

      // Primero eliminamos el archivo del storage
      const { error: storageError } = await supabase
        .storage
        .from('media')
        .remove([fileToDelete.storage_path]);

      if (storageError) throw storageError;

      // Luego eliminamos el registro de la base de datos
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Actualizamos el estado local
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
      throw err;
    }
  };

  const updateFile = async (fileId: string, data: Partial<MediaFile>) => {
    try {
      // Actualizamos en la base de datos
      const { data: updatedData, error: dbError } = await supabase
        .from('media_files')
        .update({
          name: data.name,
          alt: data.alt
        })
        .eq('id', fileId)
        .select()
        .single();

      if (dbError) throw dbError;

      // Actualizamos el estado local
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, ...updatedData }
          : file
      ));

      return updatedData;
    } catch (err) {
      console.error('Error al actualizar archivo:', err);
      throw err;
    }
  };

  const value = {
    files,
    images: files.filter(file => file.type.startsWith('image/')),
    videos: files.filter(file => file.type.startsWith('video/')),
    documents: files.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/')),
    loading,
    error,
    refreshMedia: fetchMedia,
    addFile,
    deleteFile,
    updateFile
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia debe usarse dentro de un MediaProvider');
  }
  return context;
} 