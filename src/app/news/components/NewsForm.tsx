'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NewsFormData } from '@/types/news';
import IconRender from '@/components/common/IconRender';
import ImagePicker from '@/components/common/ImagePicker';
import { ImageField } from '@/types/form';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';
import Image from 'next/image';

interface NewsFormProps {
  onSave: (data: NewsFormData, status: NewsStatus) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<NewsFormData>;
  initialView?: 'edit' | 'preview';
}

export default function NewsForm({ onSave, onCancel, initialData, initialView = 'edit' }: NewsFormProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>(initialView);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editConfirmed, setEditConfirmed] = useState(false);

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

  const watchContent = watch('content');
  const watchTitle = watch('title');
  const watchStatus = watch('status');
  const isPublished = watchStatus === 'published';

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (initialView) {
      setViewMode(initialView);
    }
    if (initialData && editConfirmed) {
      reset(initialData);
    }
  }, [initialView, editConfirmed, initialData, reset]);

  // Función para verificar si la imagen ha cambiado
  const hasImageChanged = useCallback(() => {
    const currentImgSrc = watch('img_src');
    const currentImgAlt = watch('img_alt');
    return currentImgSrc !== initialData?.img_src || currentImgAlt !== initialData?.img_alt;
  }, [watch, initialData]);

  // Función para verificar si hay cambios pendientes
  const hasPendingChanges = useCallback(() => {
    return isDirty || hasImageChanged();
  }, [isDirty, hasImageChanged]);

  useEffect(() => {
    if (isPublished && hasPendingChanges() && !editConfirmed) {
      const confirmed = confirm('Esta noticia ya está publicada. ¿Deseas realizar cambios?');
      if (confirmed) {
        setEditConfirmed(true);
      } else {
        reset(initialData);
      }
    }
  }, [isDirty, isPublished, hasPendingChanges]);

  const onSubmit = async (data: NewsFormData, status: NewsStatus = watchStatus) => {
    if (isPublished && isDirty && status === 'published') {
      if (!confirm('¿Estás seguro que deseas publicar estos cambios?')) {
        return;
      }
    } else if (!isDirty && status === 'published' && watchStatus === 'draft') {
      if (!confirm('¿Estás seguro que deseas publicar esta noticia?')) {
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
      setEditConfirmed(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (image: ImageField) => {
    if (isPublished && !editConfirmed) {
      const confirmed = confirm('Esta noticia ya está publicada. ¿Deseas realizar cambios?');
      if (confirmed) {
        setEditConfirmed(true);
        setValue('img_src', image.url);
        setValue('img_alt', image.alt);
        setShowImagePicker(false);
      }
    } else {
      setValue('img_src', image.url);
      setValue('img_alt', image.alt);
      setShowImagePicker(false);
    }
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
            onClick={() => {
              if (isDirty && isPublished && !editConfirmed) {
                if (confirm('¿Estás seguro que deseas descartar los cambios?')) {
                  reset(initialData);
                  onCancel();
                }
              } else {
                onCancel();
              }
            }}
            className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
            disabled={isSaving}
          >
            Cancelar
          </button>
          {!isPublished && (
            <button
              type="button"
              onClick={() => handleSubmit(data => onSubmit(data, 'draft'))}
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
          {(!isPublished || (isPublished && editConfirmed && hasPendingChanges())) && (
            <button
              type="button"
              onClick={() => {
                const submitHandler = handleSubmit((data) => {
                  if (isPublished && (isDirty || hasImageChanged())) {
                    onSubmit(data, 'published');
                  } else if (!isPublished) {
                    onSubmit(data, 'published');
                  }
                });
                submitHandler();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving 
                ? 'Publicando...' 
                : isPublished 
                  ? 'Publicar cambios' 
                  : 'Publicar'
              }
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
                      <Image
                        src={watch('img_src')}
                        alt={watch('img_alt') || ''}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isPublished && !editConfirmed) {
                            const confirmed = confirm('Esta noticia ya está publicada. ¿Deseas realizar cambios?');
                            if (confirmed) {
                              setEditConfirmed(true);
                              setValue('img_src', '');
                              setValue('img_alt', '');
                            }
                          } else {
                            setValue('img_src', '');
                            setValue('img_alt', '');
                          }
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <IconRender icon="FaTimes" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (isPublished && !editConfirmed) {
                        const confirmed = confirm('Esta noticia ya está publicada. ¿Deseas realizar cambios?');
                        if (confirmed) {
                          setEditConfirmed(true);
                          setShowImagePicker(true);
                        }
                      } else {
                        setShowImagePicker(true);
                      }
                    }}
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
            <div className="prose prose-invert prose-lg max-w-none">
              {/* Encabezado */}
              <h1 className="text-4xl font-bold mb-4">{watchTitle}</h1>
              {watch('subtitle') && (
                <p className="text-xl text-gray-300 mt-2 mb-8">{watch('subtitle')}</p>
              )}

              {/* Imagen destacada */}
              {watch('img_src') && (
                <div className="my-8">
                  <Image
                    src={watch('img_src')}
                    alt={watch('img_alt') || watchTitle}
                    width={300}
                    height={200}
                    className="w-full max-h-[400px] object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Resumen */}
              <div className="text-lg text-gray-300 my-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                {watch('summary')}
              </div>

              {/* Contenido Markdown */}
              <div className="wmde-markdown-var"> {/* Variables CSS personalizadas */}
                <div className="wmde-markdown prose-headings:font-bold prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-gray-300 prose-code:bg-gray-800 prose-code:rounded prose-code:px-1 prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400">
                  <MDEditor.Markdown 
                    source={watchContent}
                    rehypePlugins={[[rehypeSanitize]]}
                  />
                </div>
              </div>

              {/* Autor y fechas */}
              <div className="mt-8 pt-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-400">
                  <IconRender icon="FaUser" className="w-4 h-4" />
                  {watch('author')}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {initialData?.created_at && (
                    <div className="flex items-center gap-1">
                      <IconRender icon="FaCalendar" className="w-4 h-4" />
                      <span>Creado: {new Date(initialData.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                  {initialData?.updated_at && initialData.updated_at !== initialData.created_at && (
                    <div className="flex items-center gap-1">
                      <IconRender icon="FaEdit" className="w-4 h-4" />
                      <span>Actualizado: {new Date(initialData.updated_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
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

      {/* Agregar estilos globales */}
      <style jsx global>{`
        .wmde-markdown-var {
          --color-canvas-default: transparent;
          --color-prettylights-syntax-comment: #8b949e;
          --color-prettylights-syntax-constant: #79c0ff;
          --color-prettylights-syntax-entity: #d2a8ff;
          --color-prettylights-syntax-storage-modifier-import: #c9d1d9;
          --color-prettylights-syntax-entity-tag: #7ee787;
          --color-prettylights-syntax-keyword: #ff7b72;
          --color-prettylights-syntax-string: #a5d6ff;
          --color-prettylights-syntax-variable: #ffa657;
          --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
          --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
          --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
          --color-prettylights-syntax-carriage-return-text: #f0f6fc;
          --color-prettylights-syntax-carriage-return-bg: #b62324;
          --color-prettylights-syntax-string-regexp: #7ee787;
          --color-prettylights-syntax-markup-list: #f2cc60;
          --color-prettylights-syntax-markup-heading: #1f6feb;
          --color-prettylights-syntax-markup-italic: #c9d1d9;
          --color-prettylights-syntax-markup-bold: #c9d1d9;
          --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
          --color-prettylights-syntax-markup-deleted-bg: #67060c;
          --color-prettylights-syntax-markup-inserted-text: #aff5b4;
          --color-prettylights-syntax-markup-inserted-bg: #033a16;
          --color-prettylights-syntax-markup-changed-text: #ffdfb6;
          --color-prettylights-syntax-markup-changed-bg: #5a1e02;
          --color-prettylights-syntax-markup-ignored-text: #c9d1d9;
          --color-prettylights-syntax-markup-ignored-bg: #1158c7;
          --color-prettylights-syntax-meta-diff-range: #d2a8ff;
          --color-prettylights-syntax-brackethighlighter-angle: #8b949e;
          --color-prettylights-syntax-sublimelinter-gutter-mark: #484f58;
          --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;
          --color-fg-default: #e5e7eb;
          --color-fg-muted: #8b949e;
          --color-fg-subtle: #6e7681;
          --color-border-default: #30363d;
          --color-border-muted: #21262d;
          --color-neutral-muted: rgba(110,118,129,0.4);
          --color-accent-fg: #58a6ff;
          --color-accent-emphasis: #1f6feb;
          --color-attention-subtle: rgba(187,128,9,0.15);
          --color-danger-fg: #f85149;
        }

        .wmde-markdown {
          background-color: transparent;
          font-size: 1.125rem;
          line-height: 1.75;
        }

        .wmde-markdown code {
          font-size: 0.875em;
          padding: 0.2em 0.4em;
        }

        .wmde-markdown pre {
          padding: 1em;
          margin: 1em 0;
          border-radius: 0.5em;
        }

        .wmde-markdown table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        .wmde-markdown th,
        .wmde-markdown td {
          border: 1px solid var(--color-border-default);
          padding: 0.5em 1em;
        }

        .wmde-markdown th {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .wmde-markdown img {
          max-width: 100%;
          border-radius: 0.5em;
        }
      `}</style>
    </div>
  );
} 