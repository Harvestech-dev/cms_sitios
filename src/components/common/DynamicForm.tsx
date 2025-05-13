'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormField, FieldType } from '@/types/form';
import ImagePicker from './ImagePicker';
import Drawer from './Drawer';
import { useToast } from '@/contexts/ToastContext';
import IconRender from './IconRender';
import { useIconSelector } from '@/contexts/IconSelectorContext';

interface DynamicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData: Record<string, unknown>;
  title: string;
}

interface FieldGroup {
  title: string;
  fields: FormField[];
}

interface FormValue {
  url?: string;
  alt?: string;
  icon?: string;
  label?: string;
  text?: string;
  text_subject?: string;
  text_body?: string;
}

export default function DynamicForm({ isOpen, onClose, onSave, initialData, title }: DynamicFormProps) {
  const { showToast } = useToast();
  const [fields, setFields] = useState<FormField[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { openIconSelector } = useIconSelector();

  const { 
    control, 
    handleSubmit,
    reset,
    setValue,
    formState: { }
  } = useForm({
    defaultValues: initialData
  });

  useEffect(() => {
    // Asegurarnos de que los arrays estén inicializados
    const initializedData = Object.entries(initialData).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        acc[key] = value;
      } else if (value === null || value === undefined) {
        const type = getFieldType(key);
        if (['gallery', 'item'].includes(type)) {
          acc[key] = [];
        } else {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    reset(initializedData);
    
    const formFields = Object.entries(initializedData)
      .filter(([key]) => !shouldExcludeField(key))
      .map(([key, value]) => ({
        key,
        type: getFieldType(key),
        label: formatLabel(key),
        value,
        required: !key.endsWith('_optional'),
        isArray: Array.isArray(value)
      }));

    setFields(formFields);
  }, [initialData, reset]);

  const shouldExcludeField = (key: string): boolean => {
    return key.startsWith('id') || 
           key.endsWith('_id') || 
           key === 'style' || 
           key === 'className';
  };

  const getFieldType = (key: string): FieldType => {
    if (key.startsWith('txt_')) return 'txt';
    if (key.startsWith('txtp_')) return 'txtp';
    if (key.startsWith('img_')) return 'img';
    if (key.startsWith('icon_')) return 'icon';
    if (key.startsWith('link_')) return 'link';
    if (key.startsWith('btn_')) return 'btn';
    if (key.startsWith('item_')) return 'item';
    if (key.startsWith('gallery_')) return 'gallery';
    if (key.startsWith('social_')) return 'social';
    if (key.startsWith('contact_')) return 'contact';
    if (key.startsWith('template_email')) return 'template_email';
    return 'txt';
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/^(txt_|txtp_|img_|icon_|link_|btn_|item_|gallery_)/, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const onSubmitForm = async (data: Record<string, unknown>) => {
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

  const renderArrayField = (
    field: FormField, 
    arrayValue: unknown[], 
    onArrayChange: (value: unknown[]) => void
  ) => {
    return (
      <div className="space-y-4">
        <Controller
          name={field.key}
          control={control}
          render={({ field: { onChange: fieldOnChange, value = [] } }) => (
            <div>
              {value.map((item: unknown, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  {renderSingleField(
                    field.type,
                    item,
                    (newValue) => {
                      const newArray = [...value];
                      newArray[index] = newValue;
                      fieldOnChange(newArray);
                    },
                    `${field.key}_${index}`
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = value.filter((_: unknown, i: number) => i !== index);
                      onArrayChange(newArray);
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <IconRender icon="FaTimes" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        />
      </div>
    );
  };

  const handleIconClick = (fieldKey: string) => {
    const currentValue = fieldKey.includes('.')
      ? control._formValues[fieldKey.split('.')[0]]?.icon
      : control._formValues[fieldKey];

    openIconSelector(currentValue || '', (iconName) => {
      if (fieldKey.includes('.')) {
        const [parentKey, indexOrKey, subField] = fieldKey.split('.');
        if (subField) {
          const index = parseInt(indexOrKey);
          const currentArray = control._formValues[parentKey] || [];
          const newArray = [...currentArray];
          newArray[index] = {
            ...newArray[index],
            [subField]: iconName
          };
          setValue(parentKey, newArray, { shouldDirty: true });
        } else {
          setValue(parentKey, {
            ...control._formValues[parentKey],
            [indexOrKey]: iconName
          }, { shouldDirty: true });
        }
      } else {
        setValue(fieldKey, iconName, { shouldDirty: true });
      }
    });
  };

  const renderIconField = (value: string, onChange: (value: string) => void, fieldKey: string) => {
    return (
      <div 
        className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => handleIconClick(fieldKey)}
      >
        {value ? (
          <IconRender icon={value} className="w-6 h-6 text-gray-300" />
        ) : (
          <div className="text-gray-500">
            <IconRender icon="FaPlus" className="w-5 h-5" />
          </div>
        )}
      </div>
    );
  };

  const renderSingleField = (
    type: FieldType,
    value: FormValue,
    onChange: (value: FormValue) => void,
    fieldKey: string
  ): ReactElement => {
    switch (type) {
      case 'txt':
        return (
          <input
            type="text"
            value={value?.text || ''}
            onChange={(e) => onChange({ text: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
          />
        );

      case 'txtp':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
          />
        );

      case 'img':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveField(fieldKey);
                setShowImagePicker(true);
              }}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              Seleccionar imagen
            </button>
            {value?.url && (
              <div className="flex items-center gap-2">
                <img
                  src={value.url}
                  alt={value.alt}
                  className="w-10 h-10 object-cover rounded"
                />
                <input
                  type="text"
                  value={value.alt}
                  onChange={(e) => onChange({ ...value, alt: e.target.value })}
                  placeholder="Texto alternativo"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 text-sm"
                />
              </div>
            )}
          </div>
        );

      case 'icon':
        return renderIconField(value, onChange, fieldKey);

      case 'link':
      case 'btn':
        return (
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={value.label}
              onChange={(e) => onChange({ ...value, label: e.target.value })}
              placeholder="Etiqueta"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
            />
            <input
              type="text"
              value={value.url}
              onChange={(e) => onChange({ ...value, url: e.target.value })}
              placeholder="URL"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleIconClick(`${fieldKey}.icon`)}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                {value.icon ? (
                  <IconRender icon={value.icon} className="w-5 h-5" />
                ) : (
                  'Ícono'
                )}
              </button>
            </div>
          </div>
        );

      case 'item':
        return (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => handleIconClick(`${fieldKey}.icon`)}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                {value.icon ? (
                  <IconRender icon={value.icon} className="w-5 h-5" />
                ) : (
                  'Ícono'
                )}
              </button>
            </div>
            <input
              type="text"
              value={value.text}
              onChange={(e) => onChange({ ...value, text: e.target.value })}
              placeholder="Texto"
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
            />
          </div>
        );

      case 'social':
      case 'contact':
        return (
          <div className="space-y-3">
            
            <div className="flex gap-3">
            <button
                type="button"
                onClick={() => {
                  const currentIcon = value?.icon || '';
                  openIconSelector(currentIcon, (iconName) => {
                    onChange({ ...value, icon: iconName });
                  });
                }}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center gap-2"
              >
                {value?.icon ? (
                  <IconRender icon={value.icon} className="w-5 h-5" />
                ) : (
                  'Ícono'
                )}
              </button>
              <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">
                Etiqueta
              </label>                <input
                  type="text"
                  value={value?.label || ''}
                  onChange={(e) => onChange({ ...value, label: e.target.value })}
                  placeholder="Etiqueta"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
                />
              </div>
              <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">
                URL
              </label>                <input
                  type="text"
                  value={value?.url || ''}
                  onChange={(e) => onChange({ ...value, url: e.target.value })}
                  placeholder="URL o número"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
                />
              </div>

            </div>
          </div>
        );

      case 'template_email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Asunto del email
              </label>
              <input
                type="text"
                value={value?.text_subject || ''}
                onChange={(e) => onChange({ ...value, text_subject: e.target.value })}
                placeholder="Asunto del email"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Cuerpo del email
              </label>
              <textarea
                value={value?.text_body || ''}
                onChange={(e) => onChange({ ...value, text_body: e.target.value })}
                placeholder="Escribe el mensaje predeterminado..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
              />

            </div>
          </div>
        );

      default:
        return <div>Campo no soportado</div>;
    }
  };

  const renderField = (field: FormField) => {
    return (
      <div key={field.key} className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <Controller
          name={field.key}
          control={control}
          rules={{ required: field.required }}
          render={({ field: { value, onChange } }) => (
            field.isArray 
              ? renderArrayField(field, value, onChange)
              : renderSingleField(field.type, value, onChange, field.key)
          )}
        />
      </div>
    );
  };

  const groupFields = (fields: FormField[]): FieldGroup[] => {
    const groups: { [key: string]: FieldGroup } = {};
    const ungroupedFields: FormField[] = [];

    // Primero encontrar todos los meta_title
    const metaTitles = fields.filter(field => field.key.startsWith('meta_title_'));
    
    metaTitles.forEach(metaField => {
      const groupKey = metaField.key.replace('meta_title_', '');
      groups[groupKey] = {
        title: metaField.value || groupKey,
        fields: []
      };
    });

    // Agrupar campos
    fields.forEach(field => {
      if (field.key.startsWith('meta_')) return; // Ignorar metadatos

      // Buscar a qué grupo pertenece
      const groupKey = Object.keys(groups).find(key => 
        field.key.toLowerCase().includes(key.toLowerCase())
      );

      if (groupKey) {
        groups[groupKey].fields.push(field);
      } else {
        ungroupedFields.push(field);
      }
    });

    // Agregar campos no agrupados al inicio
    const result: FieldGroup[] = [];
    if (ungroupedFields.length > 0) {
      result.push({
        title: 'General',
        fields: ungroupedFields
      });
    }

    // Agregar grupos ordenados
    Object.values(groups).forEach(group => {
      if (group.fields.length > 0) {
        result.push(group);
      }
    });

    return result;
  };

  const renderFieldGroup = (group: FieldGroup) => {
    return (
      <div key={group.title} className="mb-8">
        <div className="mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-white">{group.title}</h3>
        </div>
        <div className="space-y-4">
          {group.fields.map(field => renderField(field))}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {groupFields(fields).map(group => renderFieldGroup(group))}
        </div>

        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
          onSelect={(image) => {
            if (activeField) {
              setValue(activeField, image, {
                shouldDirty: true,
                shouldTouch: true
              });
              setShowImagePicker(false);
              setActiveField(null);
            }
          }}
        />
      )}
    </Drawer>
  );
} 