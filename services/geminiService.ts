// Fix: Implement the Gemini service to provide data analysis and chat functionality.
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { AnalysisResult } from '../types';

// Per coding guidelines, initialize with apiKey from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResultSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of the data, highlighting the main findings in Swedish."
    },
    keyInsights: {
      type: Type.ARRAY,
      description: "A list of 3-5 bullet-point key insights derived from the data, in Swedish. Each insight should be a short, impactful sentence.",
      items: { type: Type.STRING }
    },
    table: {
      type: Type.OBJECT,
      description: "A table representation of the most important data. It can be a subset or a transformed version of the original data.",
      properties: {
        headers: {
          type: Type.ARRAY,
          description: "The column headers for the table.",
          items: { type: Type.STRING }
        },
        data: {
          type: Type.ARRAY,
          description: "The table data as an array of arrays, where each inner array is a row.",
          items: {
            type: Type.ARRAY,
            items: {
              // The schema doesn't support union types like string|number.
              // We will ask for strings, and the client will parse numbers.
              type: Type.STRING,
            }
          }
        }
      }
    },
    charts: {
      type: Type.ARRAY,
      description: "A list of 1-3 chart suggestions to visualize the data. Provide data in a format ready for a charting library. All text should be in Swedish.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The suggested chart type. Must be one of: 'bar', 'line', 'pie', 'doughnut', 'scatter'."
          },
          title: {
            type: Type.STRING,
            description: "A descriptive title for the chart, in Swedish."
          },
          data: {
            type: Type.OBJECT,
            properties: {
              labels: {
                type: Type.ARRAY,
                description: "The labels for the X-axis (or segments in pie/doughnut charts).",
                items: { type: Type.STRING }
              },
              datasets: {
                type: Type.ARRAY,
                description: "The data series to be plotted.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: {
                      type: Type.STRING,
                      description: "The label for this dataset, in Swedish."
                    },
                    data: {
                      type: Type.ARRAY,
                      description: "The numerical data points for this dataset.",
                      items: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};


export const analyzeData = async (csvData: string): Promise<AnalysisResult> => {
    // Per guidelines, use a capable model for complex tasks.
    const model = 'gemini-2.5-pro'; 
    const prompt = `
    Analysera följande CSV-data och ge en strukturerad analys i JSON-format.
    All text i ditt svar (sammanfattning, insikter, diagramtitlar etc.) ska vara på svenska.
    Datan representerar ett litet urval från en större datamängd.
    Baserat på denna data, generera:
    1. En kort, insiktsfull sammanfattning.
    2. 3 till 5 nyckelinsikter som inte är omedelbart uppenbara.
    3. En relevant datatabell (kan vara en delmängd eller aggregering av den angivna datan).
    4. 1 till 3 förslag på diagram för att visualisera datan, inklusive diagramtyp och själva datan.
    
    Här är CSV-datan:
    ---
    ${csvData}
    ---
    
    Vänligen ge hela analysen i den specificerade JSON-strukturen. Inkludera ingen förklarande text utanför JSON-objektet.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisResultSchema,
            },
        });

        // Per guidelines, access text property directly
        const jsonText = response.text;
        
        // The Gemini API with JSON schema sometimes wraps the output in markdown backticks
        const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');

        const result: AnalysisResult = JSON.parse(cleanedJsonText);
        
        // Post-processing to ensure data types are correct for the table.
        // Gemini is requested to return strings for table cells, and we convert valid numeric strings to numbers.
        if (result.table && Array.isArray(result.table.data)) {
            result.table.data = result.table.data.map(row => {
                if (!Array.isArray(row)) return row; // handle malformed rows
                return row.map(cell => {
                    if (typeof cell === 'string' && cell.trim() !== '' && !isNaN(Number(cell))) {
                        return Number(cell);
                    }
                    return cell;
                });
            });
        }

        return result;

    } catch (error) {
        console.error("Error analyzing data with Gemini:", error);
        throw new Error("Kunde inte analysera data. AI-modellen kunde inte behandla begäran.");
    }
};

export const startChat = (context: string): Chat => {
    // Per guidelines, use a fast model for chat.
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `Du är en hjälpsam dataanalysassistent. Användaren ställer frågor om en datauppsättning de har laddat upp.
            Använd följande sammanhang om datan för att besvara deras frågor. Var koncis och hjälpsam. Alltid svara på svenska.
            
            Sammanhang:
            ---
            ${context}
            ---
            `,
        },
    });
    return chat;
};
