import { supabase } from './supabase';

export type FileType = 'image' | 'video' | 'file';

interface UploadResponse {
  url: string;
  path: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    // Determinar el tipo de archivo
    const fileType: FileType = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('video/') 
      ? 'video' 
      : 'file';

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileType}s/${fileName}`;

    // Subir archivo a Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      console.error('Error de Storage:', storageError);
      throw new Error(`Error al subir archivo: ${storageError.message}`);
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
};

export const createMediaRecord = async (
  file: File, 
  uploadResponse: UploadResponse
) => {
  try {
    const { data, error } = await supabase
      .from('media_files')
      .insert({
        type: file.type,
        url: uploadResponse.url,
        name: file.name,
        storage_path: uploadResponse.path,
        alt: file.name
      })
      .select()
      .single();

    if (error) {
      console.error('Error de Base de Datos:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
}; 