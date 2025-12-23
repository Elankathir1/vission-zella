
import { GoogleGenAI, Type } from "@google/genai";
import { Trade, Account } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const MINDSET_COACH_INSTRUCTION = `
You are my trading psychology journal assistant.
Your job is to help me document and understand my emotions, thoughts, and behaviour during trades.
Do not give trading signals.
Focus only on emotions, mindset, discipline, habits, and stress levels.
Ask about daily rule adherence (e.g., did they exceed their 1-2 trade limit?).
`;

export const gradePortfolioExecution = async (trades: Trade[], account?: Account) => {
  const summary = trades.map(t => ({
    id: t.id,
    symbol: t.symbol,
    pnl: t.pnl,
    isPlanned: t.isPlanned,
    discipline: t.disciplineRating,
    stress: t.stressLevel,
    sequence: t.tradeSequenceNum || 1,
    mistakes: t.mistakes || []
  }));

  const prompt = `
    As an institutional prop firm risk manager, grade the following execution history.
    Account Rules: Max ${account?.maxTradesPerDay || 2} trades per day.
    
    Strictly penalize "Overtrading" (sequence > limit) and "Impulsive" entries.
    Reward high discipline scores and "Planned" entries.
    
    Data: ${JSON.stringify(summary)}
    
    Provide:
    1. An overall letter grade (A+, A, B, C, D, or F).
    2. A numerical "Execution Quality Score" (0-100).
    3. A brief institutional summary (1-2 sentences).
    4. Individual grades for each trade ID.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallGrade: { type: Type.STRING },
            qualityScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            tradeGrades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tradeId: { type: Type.STRING },
                  grade: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Grading failed:", error);
    return null;
  }
};

export const analyzeTradePerformance = async (trades: Trade[]) => {
  const tradeSummary = trades.map(t => ({
    symbol: t.symbol,
    pnl: t.pnl,
    setup: t.setup,
    discipline: t.disciplineRating,
    stress: t.stressLevel,
    isPlanned: t.isPlanned,
    notes: t.notes
  }));

  const prompt = `
    As a elite trading performance psychologist, analyze these recent executions:
    ${JSON.stringify(tradeSummary)}

    Focus on the correlation between discipline, stress levels, and actual P&L. 
    Identify if "Impulsive" trades or "Overtrading" are hurting the equity curve.
    
    Provide a professional analysis in JSON format with exactly 3 distinct insights.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] }
                },
                required: ["title", "content", "type"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"insights":[]}');
    return data.insights;
  } catch (error) {
    console.error("VisionZella AI Audit failed:", error);
    return [];
  }
};

export const startMindsetChat = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: MINDSET_COACH_INSTRUCTION,
    },
  });
};
