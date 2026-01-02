import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const parseResumeToGemini = async (bufferData: Buffer, mimeType: string) => {

    const base64Data = bufferData.toString("base64");

    const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType 
                }
            },
            "Describe what is in this file."
        ],
    });

    console.log(result);
};

