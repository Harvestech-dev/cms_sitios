'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormField, FieldType } from '@/types/form';
import IconSelector from './IconSelector';
import ImagePicker from './ImagePicker';
import Drawer from './Drawer';
import Image from 'next/image';
import IconRenderer from './IconRenderer';
import { useToast } from '@/contexts/ToastContext';

interface DynamicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: Record<string, any>;
  title: string;
}

export default function DynamicForm({ isOpen, onClose, onSave, initialData, title }: DynamicFormProps) {
  const { showToast } = useToast();
  const [fields, setFields] = useState<FormField[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [currentData, setCurrentData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const { 
    control, 
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty }
  } = useForm({
    defaultValues: currentData
  });

  useEffect(() => {
    setCurrentData(initialData);
    reset(initialData);
  }, [initialData]);

  useEffect(() => {
    // Convertir datos actuales a campos de formulario
    const formFields = Object.entries(currentData).map(([key, value]) => {
      const type = getFieldType(key, value);
      return {
        key,
        type,
        label: formatLabel(key),
        value,
        required: !key.endsWith('_optional')
      };
    });
    setFields(formFields);
  }, [currentData]);

  const getFieldType = (key: string, value: any): FieldType => {
    if (key.startsWith('txt_')) return 'txt';
    if (key.startsWith('txtp_')) return 'txtp';
    if (key.startsWith('img_')) return 'img';
    if (key.startsWith('icon_')) return 'icon';
    if (key.startsWith('link_')) return 'link';
    if (key.startsWith('btn_')) return 'btn';
    if (key.startsWith('item_')) return 'item';
    if (key.startsWith('paragraph_')) return 'paragraph';
    if (key.startsWith('gallery_')) return 'gallery';
    return 'txt';
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/^(txt_|txtp_|img_|icon_|link_|btn_|item_|paragraph_|gallery_)/, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmMessage = '¿Estás seguro de que quieres cerrar? Los cambios no guardados se perderán.';
      if (window.confirm(confirmMessage)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const onSubmitForm = async (data: any) => {
    try {
      setIsSaving(true);
      await onSave(data);
      showToast('Cambios guardados correctamente', 'success');
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al guardar los cambios', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const { type, key, label, value, required } = field;

    switch (type) {
      case 'txt':
        return (
          <Controller
            name={key}
            control={control}
            rules={{ required }}
            render={({ field, fieldState: { error } }) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {label}
                </label>
                <input
                  {...field}
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </div>
            )}
          />
        );

      case 'txtp':
        return (
          <Controller
            name={key}
            control={control}
            rules={{ required }}
            render={({ field }) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {label}
                </label>
                <textarea
                  {...field}
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          />
        );

      case 'img':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveField(key);
                      setShowImagePicker(true);
                    }}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                  >
                    Seleccionar imagen
                  </button>
                  {field.value?.url && (
                    <img
                      src={field.value.url}
                      alt={field.value.alt}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            )}
          />
        );

      case 'icon':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveField(key);
                      setShowIconPicker(true);
                    }}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                  >
                    Seleccionar ícono
                  </button>
                  {field.value && (
                    <div className="flex items-center gap-2">
                      <IconRenderer 
                        icon={field.value} 
                        className="w-6 h-6 text-gray-300" 
                      />
                      <span className="text-sm text-gray-400">
                        {field.value}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        );

      // Agregar más casos según sea necesario...

      default:
        return null;
    }
  };

  const handleImageSelect = (image: ImageField) => {
    if (activeField) {
      setValue(activeField, image, {
        shouldDirty: true,
        shouldTouch: true
      });
      // Actualizamos los datos actuales inmediatamente
      setCurrentData(prev => ({
        ...prev,
        [activeField]: image
      }));
      setShowImagePicker(false);
      setActiveField(null);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      position="right"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {fields.map(field => (
            <div key={field.key}>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>

      {showImagePicker && (
        <ImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleImageSelect}
        />
      )}

      {showIconPicker && (
        <IconSelector
          isOpen={showIconPicker}
          onClose={() => setShowIconPicker(false)}
          onSelect={(iconName) => {
            if (activeField) {
              setValue(activeField, iconName, {
                shouldDirty: true,
                shouldTouch: true
              });
              // Actualizamos los datos actuales inmediatamente
              setCurrentData(prev => ({
                ...prev,
                [activeField]: iconName
              }));
              setShowIconPicker(false);
              setActiveField(null);
            }
          }}
          currentIcon={activeField ? control.getValues(activeField) : undefined}
        />
      )}
    </Drawer>
  );
} 