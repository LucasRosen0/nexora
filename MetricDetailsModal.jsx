import React from 'react';

const MetricDetailsModal = ({ isOpen, onClose, metric }) => {
  if (!isOpen || !metric) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50 transition-opacity">
      <div 
        className="h-full w-full max-w-md bg-[#1e1e2d] text-white p-6 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-700 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">{metric.label}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold mb-2">{metric.value}{metric.id === 'compliance' ? '%' : ''}</div>
          <p className="text-gray-400 text-sm leading-relaxed">{metric.description}</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Detalhes do Indicador</h3>
          <div className="bg-[#151521] rounded-lg divide-y divide-gray-800 border border-gray-800">
            {metric.details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center p-4">
                <span className="text-gray-300">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-300">Dica de Gestão</h4>
              <p className="text-xs text-blue-400 mt-1 opacity-80">Mantenha este indicador monitorado para garantir a conformidade da frota.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricDetailsModal;