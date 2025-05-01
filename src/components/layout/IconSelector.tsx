return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Seleccionar Ícono"
    size="full"
    className="p-4"
  >
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex gap-4 mb-4">
          <select
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(iconSets).map(set => (
              <option key={set} value={set}>{set}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar ícono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {currentIcon && (
          <div className="flex items-center gap-2 text-gray-300">
            <span>Ícono actual:</span>
            <IconRender icon={currentIcon} className="w-6 h-6" />
            <span className="text-sm text-gray-400">({currentIcon})</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
          {filteredIcons.map(iconName => (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              className={`
                p-4 flex flex-col items-center gap-2 rounded-lg
                hover:bg-gray-700 transition-colors
                ${currentIcon === iconName ? 'bg-blue-600' : 'bg-gray-800'}
              `}
            >
              <IconRender icon={iconName} className="w-6 h-6" />
              <span className="text-xs text-gray-400 truncate w-full text-center">
                {iconName.replace(/^(Fa|Ai|Bi)/, '')}
              </span>
            </button>
          ))}
        </div>
        {filteredIcons.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No se encontraron íconos
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </Modal>
); 