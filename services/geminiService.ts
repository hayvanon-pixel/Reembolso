
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, GeminiExtraction } from "../types";

export const extractReceiptData = async (base64Image: string): Promise<GeminiExtraction | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

    // Verificação robusta para satisfazer o compilador do Netlify (TS18048)
    const generatedText = response.text;
    
    if (typeof generatedText !== 'string') {
      console.warn("Gemini retornou uma resposta sem conteúdo textual.");
      return null;
    }

    const result = JSON.parse(generatedText.trim());
    return result as GeminiExtraction;
  } catch (error) {
    console.error("Erro ao analisar recibo com Gemini:", error);
    return null;
  }
};
