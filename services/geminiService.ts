
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, GeminiExtraction } from "../types";

export const extractReceiptData = async (base64Image: string): Promise<GeminiExtraction | null> => {
  // Fix: Directly check and use process.env.API_KEY per guidelines
  if (!process.env.API_KEY) return null;

  try {
    // Fix: Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) directly to ensure the latest key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We remove the data:image/jpeg;base64, part if present
    const imageData = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData
            }
          },
          {
            text: `Analise este comprovante de despesa e extraia o valor total, a categoria mais provável (Estacionamento, Lavagem, Ferramentas, Combustível, Hospedagem, Alimentação, Outros) e a data. Retorne os dados em JSON. Não gere texto para descrição.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "Valor total da nota" },
            category: { type: Type.STRING, description: "Uma das categorias: Estacionamento, Lavagem, Ferramentas, Combustível, Hospedagem, Alimentação, Outros" },
            date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" }
          },
          required: ["amount", "category"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return result as GeminiExtraction;
  } catch (error) {
    console.error("Erro ao analisar recibo com Gemini:", error);
    return null;
  }
};
