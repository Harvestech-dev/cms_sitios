import { supabase } from './supabase';

export type FileType = 'image' | 'video' | 'file';

interface UploadResponse {
  url: string;
  path: string;
}

export async function uploadFile(file: File, path: string) {
  try {
    const { data, error } = await supabase
      .storage
      .from('media')
      .upload(path, file);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

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