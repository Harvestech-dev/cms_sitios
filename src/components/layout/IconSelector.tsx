'use client';

import Modal from '@/components/common/Modal';

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IconSelector({ isOpen, onClose }: IconSelectorProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Ícono"
      size="xl"
      className="p-4 z-[100]"
    >
      <div className="p-4">
        {/* Contenido del selector de íconos */}
      </div>
    </Modal>
  );
} 