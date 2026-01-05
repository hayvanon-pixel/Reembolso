
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, confirmLabel, onConfirm, onCancel, isDanger = true 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xs rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-up">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="space-y-3">
            <button 
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 ${isDanger ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}
            >
              {confirmLabel}
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs active:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
