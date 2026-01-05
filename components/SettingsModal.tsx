
import React, { useState, useRef } from 'react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose, onReset }) => {
  const [name, setName] = useState(settings.userName);
  const [advance, setAdvance] = useState(settings.monthlyAdvance === 0 ? '' : settings.monthlyAdvance.toString());
  const [pixQrCode, setPixQrCode] = useState(settings.pixQrCode || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800; // QR Codes não precisam de resolução altíssima
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const optimizedBase64 = await resizeImage(file);
      setPixQrCode(optimizedBase64);
    } catch (error) {
      console.error("Erro ao carregar QR Code:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      userName: name,
      monthlyAdvance: parseFloat(advance) || 0,
      pixQrCode: pixQrCode
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col border border-white/20">
        
        <div className="bg-gradient-to-br from-indigo-50 to-white border-b border-gray-100 px-8 pt-8 pb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Configurações</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">Ajustes do Perfil</p>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <div className="space-y-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu Nome para o Relatório</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-800"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Adiantado (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value)}
                  className="w-full p-4 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600 text-lg"
                  placeholder="Digite o valor"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                  </svg>
                  QR Code PIX para Reembolso
                </label>
                
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`w-full h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${pixQrCode ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  {pixQrCode ? (
                    <>
                      <img src={pixQrCode} alt="PIX QR Code" className="w-full h-full object-contain p-2" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPixQrCode(''); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m5-12h1m-1 5h1m-5 1h1m-3 4h1m-6-4h1m-1 5h1M5 8h1m11 5h1M12 7a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 01-1-1V8a1 1 0 011-1h5z" />
                      </svg>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Fazer Upload do PIX</p>
                      <p className="text-[8px] text-gray-400 font-medium mt-1">Clique para selecionar imagem</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
              </div>

              <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 hover:bg-indigo-700 transition-colors disabled:bg-gray-300">
                {isProcessing ? 'PROCESSANDO...' : 'Salvar Alterações'}
              </button>
            </form>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">Manutenção</h3>
              <button onClick={onReset} className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                Limpar Dados (Novo Ciclo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
