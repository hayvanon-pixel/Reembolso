
import React, { useState, useRef } from 'react';
import { ExpenseCategory, Expense } from '../types';

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
    try {
      const optimizedBase64 = await resizeForStorage(file);
      setReceiptImage(optimizedBase64);
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
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
                className={`w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${receiptImage ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}
              >
                {receiptImage ? (
                  <img src={receiptImage} alt="Recibo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tirar Foto</p>
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
                  className="w-full p-4 bg-gray-100 rounded-2xl border-none font-black text-gray-800"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoria</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full p-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-700"
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
                placeholder=""
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
              <input 
                type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 bg-gray-100 rounded-2xl border-none font-bold"
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
              {isProcessing ? 'Processando...' : 'Salvar Despesa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
