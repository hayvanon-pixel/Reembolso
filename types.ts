
export enum ExpenseCategory {
  PARKING = 'Estacionamento',
  WASHING = 'Lavagem',
  TOOLS = 'Ferramentas',
  FUEL = 'Combustível',
  LODGING = 'Hospedagem',
  FOOD = 'Alimentação',
  OTHERS = 'Outros'
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptImage?: string; // Base64 (Local)
  isPersonalMoney: boolean;
  timestamp: number;
}

export interface UserSettings {
  monthlyAdvance: number;
  userName: string;
  pixQrCode?: string; // Base64 da imagem do QR Code PIX
}

export interface GeminiExtraction {
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  date?: string;
}
