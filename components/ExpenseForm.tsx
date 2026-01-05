
import React, { useState, useRef } from 'react';
import { ExpenseCategory, Expense } from '../types';
import { extractReceiptData } from '../services/geminiService';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onClose }) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.PARKING);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPersonalMoney, setIsPersonalMoney] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeForStorage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200; 
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
          resolve(canvas.toDataURL('image/jpeg', 0.85));
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
    setAiStatus('scanning');
    
    try {
      const optimizedBase64 = await resizeForStorage(file);
      setReceiptImage(optimizedBase64);

      // Chamar a IA para extrair os dados
      const extractedData = await extractReceiptData(optimizedBase64);
      
      if (extractedData) {
        if (extractedData.amount) setAmount(extractedData.amount.toString());
        if (extractedData.category) setCategory(extractedData.category);
        if (extractedData.date) setDate(extractedData.date);
        setAiStatus('done');
      } else {
        setAiStatus('error');
      }
    } catch (error) {
      console.error("Erro ao processar imagem ou IA:", error);
      setAiStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }
    onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      date,
      isPersonalMoney,
      receiptImage: receiptImage || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up max-h-[95vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Novo Registro</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${receiptImage ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'} ${aiStatus === 'scanning' ? 'animate-pulse' : ''}`}
              >
                {receiptImage ? (
                  <div className="relative w-full h-full">
                    <img src={receiptImage} alt="Recibo" className="w-full h-full object-cover" />
                    {aiStatus === 'scanning' && (
                      <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest">IA analisando nota...</p>
                      </div>
                    )}
                    {aiStatus === 'done' && (
                      <div className="absolute bottom-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase flex items-center shadow-lg animate-bounce">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Lido pela IA
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-indigo-100 p-3 rounded-2xl mb-2 text-indigo-600 mx-auto w-fit">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tirar Foto do Recibo</p>
                    <p className="text-[8px] text-gray-400 font-medium mt-1">IA preencherá os dados por você</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                <input 
                  type="number" step="0.01" required value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full p-4 bg-gray-100 rounded-2xl border-none font-black text-gray-800 transition-all ${aiStatus === 'done' ? 'ring-2 ring-emerald-500' : ''}`}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoria</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className={`w-full p-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-700 transition-all ${aiStatus === 'done' ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição</label>
              <input 
                type="text" value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-800"
                placeholder="Ex: Almoço Cliente X"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
              <input 
                type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full p-4 bg-gray-100 rounded-2xl border-none font-bold transition-all ${aiStatus === 'done' ? 'ring-2 ring-emerald-500' : ''}`}
              />
            </div>

            <div className={`flex items-center space-x-3 p-4 rounded-2xl border transition-colors ${isPersonalMoney ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
              <input 
                type="checkbox" id="personal" checked={isPersonalMoney}
                onChange={(e) => setIsPersonalMoney(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="personal" className="text-xs font-black text-gray-600 uppercase tracking-tight cursor-pointer">
                Dinheiro Próprio (Reembolsar)
              </label>
            </div>

            <button 
              type="submit" disabled={isProcessing}
              className="w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 uppercase tracking-widest text-xs"
            >
              {isProcessing && aiStatus === 'scanning' ? 'IA Analisando...' : isProcessing ? 'Processando...' : 'Salvar Despesa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
