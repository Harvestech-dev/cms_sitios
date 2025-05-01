'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NewsFormData } from '@/types/news';
import IconRender from '@/components/common/IconRender';
import ImagePicker from '@/components/common/ImagePicker';
import { ImageField } from '@/types/form';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

interface NewsFormProps {
  onSave: (data: NewsFormData, status: NewsStatus) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<NewsFormData>;
}

export default function NewsForm({ onSave, onCancel, initialData }: NewsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm<NewsFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      summary: '',
      content: '',
      author: '',
      status: 'draft',
      featured: false,
      tags: [],
      categories: [],
      ...initialData
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const watchContent = watch('content');
  const watchTitle = watch('title');
  const watchStatus = watch('status');

  const onSubmit = async (data: NewsFormData, status: NewsStatus = watchStatus) => {
    if (!isDirty) {
      let confirmMessage = '';
      
      if (status === 'published' && watchStatus === 'draft') {
        confirmMessage = '¿Estás seguro que deseas publicar esta noticia?';
      } else {
        confirmMessage = '¿Deseas guardar de todos modos? No hay cambios.';
      }
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setIsSaving(true);
      if (!initialData?.slug) {
        data.slug = watchTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      await onSave(data, status);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (image: ImageField) => {
    setValue('img_src', image.url);
    setValue('img_alt', image.alt);
    setShowImagePicker(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de navegación y acciones */}
      <div className="bg-gray-900 px-6 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center -mb-px">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'edit'
                ? 'text-blue-500 border-blue-500'
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <IconRender icon="FaEdit" className="w-4 h-4" />
              <span>Editor</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'preview'
                ? 'text-blue-500 border-blue-500'
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <IconRender icon="FaEye" className="w-4 h-4" />
              <span>Vista previa</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 py-2">
          {watchStatus && (
            <span className={`px-2 py-1 rounded-full text-sm ${
              watchStatus === 'published' 
                ? 'bg-green-500/20 text-green-300'
                : watchStatus === 'draft'
                ? 'bg-gray-500/20 text-gray-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {watchStatus === 'published' ? 'Publicado' : watchStatus === 'draft' ? 'Borrador' : 'Archivado'}
            </span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
            disabled={isSaving}
          >
            Cancelar
          </button>
          {(isDirty || watchStatus !== 'published') && (
            <button
              type="button"
              onClick={handleSubmit(data => onSubmit(data, 'draft'))}
              className={`px-4 py-2 rounded-md ${
                isDirty
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={isSaving || !isDirty}
              title={!isDirty ? 'No hay cambios para guardar' : ''}
            >
              {isSaving ? 'Guardando...' : 'Guardar borrador'}
            </button>
          )}
          {(isDirty || watchStatus !== 'published') && (
            <button
              type="button"
              onClick={handleSubmit(data => onSubmit(data, 'published'))}
              className={`px-4 py-2 rounded-md ${
                isDirty || watchStatus === 'draft'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600/50 text-blue-300 cursor-not-allowed'
              }`}
              disabled={isSaving || (!isDirty && watchStatus === 'published')}
              title={!isDirty && watchStatus === 'published' ? 'No hay cambios para publicar' : ''}
            >
              {isSaving ? 'Publicando...' : 'Publicar'}
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'edit' ? (
          <form id="news-form" className="p-6">
            {/* Panel principal - Contenido */}
            <div className="space-y-6 mb-8">
              <h2 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">
                Contenido
              </h2>
              
              {/* Título, Subtítulo y Autor */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'El título es requerido' })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="Título de la noticia"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Autor
                  </label>
                  <input
                    type="text"
                    {...register('author', { required: 'El autor es requerido' })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                  {errors.author && (
                    <p className="mt-1 text-sm text-red-400">{errors.author.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  {...register('subtitle')}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Subtítulo (opcional)"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Imagen de portada
                </label>
                <div className="flex gap-4 items-start">
                  {watch('img_src') && (
                    <div className="relative w-32 h-32">
                      <img
                        src={watch('img_src')}
                        alt={watch('img_alt') || ''}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setValue('img_src', '');
                          setValue('img_alt', '');
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <IconRender icon="FaTimes" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-2"
                  >
                    <IconRender icon="FaImage" className="w-4 h-4" />
                    {watch('img_src') ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </button>
                </div>
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Resumen
                </label>
                <textarea
                  {...register('summary', { required: 'El resumen es requerido' })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  rows={3}
                  placeholder="Breve resumen de la noticia"
                />
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-400">{errors.summary.message}</p>
                )}
              </div>

              {/* Editor Markdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contenido
                </label>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'El contenido es requerido' }}
                  render={({ field }) => (
                    <MDEditor
                      value={field.value}
                      onChange={field.onChange}
                      preview="edit"
                      height={400}
                      previewOptions={{
                        rehypePlugins: [[rehypeSanitize]]
                      }}
                      className="bg-gray-800 border border-gray-700"
                    />
                  )}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
                )}
              </div>
            </div>

            {/* Panel lateral - Metadata */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-200">
                  Metadata
                </h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Destacado
                  </span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tags
                  </label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <input
                          type="text"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.currentTarget.value.trim();
                              if (value && !field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                          placeholder="Presiona Enter para agregar"
                        />
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 rounded-full text-xs flex items-center gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value.filter((_, i) => i !== index));
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <IconRender icon="FaTimes" className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  />
                </div>

                {/* Categorías */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Categorías
                  </label>
                  <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <input
                          type="text"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.currentTarget.value.trim();
                              if (value && !field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                          placeholder="Presiona Enter para agregar"
                        />
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 rounded-full text-xs flex items-center gap-1"
                            >
                              {category}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value.filter((_, i) => i !== index));
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <IconRender icon="FaTimes" className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              {/* Contenido principal */}
              <div className="mb-8">
                <h1 className="mb-2">{watchTitle}</h1>
                {watch('subtitle') && (
                  <p className="text-xl text-gray-300 mt-2">{watch('subtitle')}</p>
                )}

                {/* Imagen destacada */}
                {watch('img_src') && (
                  <div className="my-8">
                    <img
                      src={watch('img_src')}
                      alt={watch('img_alt') || watch('title')}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Resumen */}
                <div className="text-lg text-gray-300 my-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  {watch('summary')}
                </div>

                {/* Contenido */}
                <div className="markdown-body mt-8">
                  <MDEditor.Markdown source={watchContent} />
                </div>

                {/* Autor */}
                <div className="mt-8 pt-4 border-t border-gray-700">
                  <span className="flex items-center gap-1 text-gray-400">
                    <IconRender icon="FaUser" className="w-4 h-4" />
                    {watch('author')}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h2 className="text-lg font-medium text-gray-200 mb-4">Metadata</h2>
                
                <div className="flex flex-wrap gap-4">
                  {/* Estado */}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    watchStatus === 'published' 
                      ? 'bg-green-500/20 text-green-300'
                      : watchStatus === 'draft'
                      ? 'bg-gray-500/20 text-gray-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {watchStatus === 'published' ? 'Publicado' : watchStatus === 'draft' ? 'Borrador' : 'Archivado'}
                  </span>

                  {/* Destacado */}
                  {watch('featured') && (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <IconRender icon="FaStar" className="w-4 h-4" />
                      Destacado
                    </span>
                  )}

                  {/* Categorías */}
                  {watch('categories')?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <IconRender icon="FaFolder" className="w-4 h-4 text-gray-400" />
                      <div className="flex gap-2">
                        {watch('categories').map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {watch('tags')?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <IconRender icon="FaTags" className="w-4 h-4 text-gray-400" />
                      <div className="flex gap-2">
                        {watch('tags').map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showImagePicker && (
        <ImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleImageSelect}
        />
      )}
    </div>
  );
} 